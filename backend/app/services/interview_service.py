import json
import re
from typing import List 
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.integrations.google_adk.agents import question_generation_agent
from app.integrations.google_adk.client import run_agent
from app.integrations.google_adk.prompts import QUESTION_GENERATION_SYSTEM_PROMPT

from app.controllers.FileController import FileController
from app.integrations.google_adk import mock_client
from app.models import InterviewDecision, InterviewStatus
from app.models.db_schemes import Interview, Question, Topic, question_topic_table
from app.schemes.answers_schemes import AnswerCreate
from app.schemes.interview_schemes import InterviewCreate
from app.schemes.questions_schemes import QuestionOut
from app.services.user_service import UserService
from app.services import (
    CVService, question_service, 
    answer_service, report_service
)
from app.core.db import get_db

class InterviewService:
    def __init__(
        self,
        db: Session = Depends(get_db),
        file_controller: FileController = Depends(),
        cv_service: CVService = Depends(),
        user_service: UserService = Depends()
    ):
        self.db = db
        self.file_controller = file_controller
        self.cv_service = cv_service
        self.user_service = user_service

    async def start_new_interview(self, interview_data: InterviewCreate) -> Interview:
        """
        Orchestrates validation, AI question generation, and saving a new interview.
        """
        user = self.user_service.get_user_by_id(user_id=interview_data.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        cv = self.cv_service.get_cv_by_id_and_user(cv_id=interview_data.cv_id, user_id=interview_data.user_id)
        if not cv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found for this user")

        question_query = QUESTION_GENERATION_SYSTEM_PROMPT.substitute({
            "job_title": interview_data.job_title,
            "job_description": interview_data.job_description,
            "n_questions": interview_data.mode.get_question_count(),
            "parsed_cv_json": cv.raw_text,
            "skills_to_focus": interview_data.skills_to_foucs
        })

        
        questions_json = await run_agent(
            agent=question_generation_agent,
            query=question_query,
            user_id=str(user.id)
        )
        
        questions_list = json.loads(questions_json).get("questions", [])
        
        if not questions_list:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate questions")


        db_interview = self._create_interview_record_with_questions(interview_data, questions_list)
        
        self.db.commit()
        self.db.refresh(db_interview)
        return db_interview

    def get_next_question(self, interview_id: int) -> QuestionOut:
        """
        Fetches the next unanswered question for an ongoing interview.
        """
        db_interview = self.get_interview_by_id(interview_id) # Uses internal helper

        if db_interview.status == InterviewStatus.COMPLETED.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This interview has already been completed.")
        
        next_question = question_service.get_next_unanswered_question(db=self.db, interview_id=interview_id)

        if not next_question:
            
            return {"message": "All questions have been answered. Please finish the interview."}
        
        return next_question

    async def submit_and_evaluate_answer(self, interview_id: int, answer_data: AnswerCreate):
        """
        Validates, evaluates an answer using an AI, and saves it to the database.
        """
        db_interview = self.get_interview_by_id(interview_id)
        
        if db_interview.status == InterviewStatus.COMPLETED.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This interview has already been completed.")
        
        
        db_question = question_service.get_question_by_id(db=self.db, question_id=answer_data.question_id, interview_id=interview_id)
        if not db_question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question Not Found")
        if db_question.answer is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This question has already been answered.")

        evaluation = await mock_client.evaluate_answer(question=db_question.content, answer=answer_data.user_answer)
        
        db_answer = answer_service.create_answer(
            db=self.db,
            question_id=answer_data.question_id,
            user_answer=answer_data.user_answer,
            score=evaluation.get("score"),
            feedback=evaluation.get("feedback")
        )
        self.db.commit()
        self.db.refresh(db_answer)
        return db_answer

    async def finish_and_generate_report(self, interview_id: int) -> Interview:
        """
        Finishes an interview, calculates the score, generates a report, and saves it.
        """
        db_interview = self.get_interview_by_id(interview_id)
        
        if db_interview.report is not None:
            return db_interview # Already finished, just return the result

        db_answers = answer_service.get_all_answers_for_interview(db=self.db, interview_id=interview_id)
        if len(db_answers) != len(db_interview.questions):
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not all questions have been answered yet!")
        
        final_score, decision = self._calculate_final_score_and_decision(db_answers)

        report_content = await mock_client.generate_final_report(
            questions=db_interview.questions, answers=db_answers, feedbacks="feedbacks for each answer"
        )
        
        
        report_path = self.file_controller.get_interview_report_path(
            user_id=db_interview.user_id, interview_id=interview_id
        )

        with open(report_path, "w+") as report_file:
            report_file.write(report_content)

        self._update_interview_as_completed(db_interview, final_score, decision)
        report_service.create_report(self.db, db_interview, report_content, report_path)
        self.db.flush()
        self.db.commit()
        self.db.refresh(db_interview)
        return db_interview

    def get_interview_by_id(self, interview_id: int) -> Interview:
        """Internal helper to fetch an interview and handle 'Not Found' error."""
        interview = self.db.query(Interview).options(
            joinedload(Interview.cvs),
            joinedload(Interview.report),
            joinedload(Interview.user)
        ).filter(Interview.id == interview_id).first()

        if not interview:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview Not Found")
        return interview
    def get_all_interviews_for_user(self, user_id: int, skip: int = 0, limit: int = 100):
        return self.db.query(Interview).filter(Interview.user_id == user_id).offset(skip).limit(limit).all()
    
    def delete_interview_by_id(self, interview_id: int):
        
        db_interview = self.get_interview_by_id(interview_id=interview_id)
        
        self.db.delete(db_interview)
        self.db.commit()

        return {"interview_id":interview_id}

    def _create_interview_record_with_questions(self, interview_data: InterviewCreate, questions: list[str]) -> Interview:
        """Creates the parent Interview and its child Question records."""
        db_interview = Interview(
            user_id=interview_data.user_id,
            cv_id=interview_data.cv_id,
            job_title=interview_data.job_title,
            job_description=interview_data.job_description,
            status=InterviewStatus.IN_PROGRESS.value,
            skills_to_foucs=interview_data.skills_to_foucs,
            mode=interview_data.mode
        )
        topic_cache = {}

        for i, question_data in enumerate(questions):
            new_question = Question(
                content=question_data.get("content"),
                max_score=question_data.get("max_score"),
                type=question_data.get("type"),
                order=i + 1,
            )

            topics = question_data.get("topics", [])

            topic_objects = self._get_or_create_topics(topics, topic_cache)

            new_question.topics = topic_objects

            db_interview.questions.append(new_question)

        self.db.add(db_interview)
        return db_interview
    
    def _get_or_create_topics(self, topic_names: List[str], cache: dict) -> List[Topic]:
        """
        Finds or creates topics using a robust normalization function and a session-level cache.
        """
        
        def _normalize_name(name: str) -> str:
            """Creates a canonical representation for a topic name."""
            # 1. Convert to lowercase and strip outside whitespace.
            cleaned_name = name.lower().strip()
            # 2. Replace hyphens, underscores, and multiple spaces with a single space.
            cleaned_name = re.sub(r'[\s_-]+', ' ', cleaned_name)
            return cleaned_name

        if not topic_names:
            return []
        
        # Use a dictionary to map normalized names back to their original AI-provided form
        # This is useful if you want to store the original casing. For consistency, we'll store the normalized form.
        normalized_map = {name: _normalize_name(name) for name in topic_names}
        unique_normalized_names = list(set(normalized_map.values()))

        final_topic_objects = []
        names_to_query_db = []

        # 1. Check the cache using the NORMALIZED name.
        for name in unique_normalized_names:
            if name in cache:
                final_topic_objects.append(cache[name])
            else:
                names_to_query_db.append(name)
        
        if not names_to_query_db:
            return final_topic_objects

        # 2. Query the database using the NORMALIZED name.
        existing_topics = self.db.query(Topic).filter(
            func.lower(Topic.name).in_(names_to_query_db)
        ).all()

        for topic_obj in existing_topics:
            normalized_existing_name = _normalize_name(topic_obj.name)
            final_topic_objects.append(topic_obj)
            cache[normalized_existing_name] = topic_obj

        # 3. Determine which topics are truly new.
        found_topic_names = {_normalize_name(t.name) for t in existing_topics}
        new_topic_names = set(names_to_query_db) - found_topic_names
        
        # 4. Create, add, and cache the new topics using the NORMALIZED name.
        for name in new_topic_names:
            # We save the clean, normalized version to the database.
            new_topic_obj = Topic(name=name)
            self.db.add(new_topic_obj)
            final_topic_objects.append(new_topic_obj)
            cache[name] = new_topic_obj

        return final_topic_objects
    def _update_interview_as_completed(self, interview: Interview, final_score: int, decision: str):
        
        """Updates an interview record to mark it as complete."""
        interview.status = InterviewStatus.COMPLETED.value
        interview.final_score = final_score
        interview.decision = decision
        self.db.add(interview)

    def _calculate_final_score_and_decision(self, answers: list) -> tuple[int, str]:
        """Calculates the final score and determines the outcome."""
        if not answers:
            return 0, InterviewDecision.REJECTED.value
            
        total_score = sum(ans.score for ans in answers if ans.score is not None)
        final_score = total_score * 10 / len(answers)

        if final_score >= 7:
            decision = InterviewDecision.ACCEPTED.value
        elif final_score >= 5:
            decision = InterviewDecision.NEEDS_IMPROVEMENT.value
        else:
            decision = InterviewDecision.REJECTED.value
            
        return final_score, decision