import json
import re
from typing import List, Union
from fastapi import Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.integrations.google_adk.agents import (
    question_generation_agent,
    answer_evaluation_agent,
    final_report_agent,
)

from app.integrations.google_adk.client import run_agent

from app.controllers.FileController import FileController
from app.models import InterviewStatus
from app.models.db_schemes import Interview, Question, Topic, Answer
from app.schemes.answers_schemes import AnswerCreate
from app.schemes.interview_schemes import InterviewCreate
from app.schemes.questions_schemes import QuestionOut, NextQuestionResponse
from app.services import (
    CVService, question_service, UserService,
    answer_service, ReportService, EmailService
)
from app.core.db import get_db

class InterviewService:
    def __init__(
        self,
        db: Session = Depends(get_db),
        file_controller: FileController = Depends(),
        cv_service: CVService = Depends(),
        user_service: UserService = Depends(),
        report_service: ReportService = Depends(),
        email_service: EmailService = Depends(),
    ):
        self.db = db
        self.file_controller = file_controller
        self.cv_service = cv_service
        self.user_service = user_service
        self.report_service = report_service
        self.email_service = email_service
        user = None

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

        question_query ={
            "job_title": interview_data.job_title,
            "job_description": interview_data.job_description,
            "n_questions": interview_data.mode.get_question_count(),
            "parsed_cv_json": cv.raw_text,
            "skills_to_focus": interview_data.skills_to_foucs
        }

        question_prompt = f"""
        Generate interview questions based on the following information:

        - Job Title: {question_query['job_title']}
        - Job Description: "{question_query['job_description']}"
        - Skills to Focus On: {question_query['skills_to_focus']}
        - Candidate CV (JSON): {question_query['parsed_cv_json']}
        - Number of Questions to Generate: {question_query['n_questions']}
        """
        
        questions_json = await run_agent(
            agent=question_generation_agent,
            query=question_prompt,
            user_id=interview_data.user_id
        )
        
        questions_list = json.loads(questions_json).get("questions", [])
        
        if not questions_list:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate questions")


        db_interview = self._create_interview_record_with_questions(interview_data, questions_list)
        
        self.db.commit()
        self.db.refresh(db_interview)
        return db_interview

    def get_next_question(self, interview_id: int) -> Union[NextQuestionResponse, dict]:
        """
        Fetches the next unanswered question for an ongoing interview.
        """
        db_interview = self.get_interview_by_id(interview_id) # Uses internal helper

        if db_interview.status == InterviewStatus.COMPLETED.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This interview has already been completed.")
        
        next_question = question_service.get_next_unanswered_question(db=self.db, interview_id=interview_id)

        if not next_question:
            
            return {"message": "All questions have been answered. Please finish the interview."}
        
        question_out = QuestionOut.model_validate(next_question)
        
        return {
            "question": question_out,
            "total_questions": len(db_interview.questions)
        }

    async def submit_answer(self, interview_id: int, answer_data: AnswerCreate):
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
        
        # eval_prompt = f"""
        #         **Context:**
        #         - **`question_text`**: "{db_question.content}"
        #         - **`answer_text`**: "{answer_data.user_answer}"
        #     """
        
        # evaluation = await run_agent(
        #     agent=answer_evaluation_agent,
        #     query=eval_prompt,
        #     user_id=db_interview.user_id
        # )

        # answer= json.loads(evaluation)

        db_answer = answer_service.create_answer(
            db=self.db,
            question_id=answer_data.question_id,
            user_answer=answer_data.user_answer,
            score=None,
            feedback=None
        )

        self.db.commit()
        self.db.refresh(db_answer)

        return db_answer
    
    async def _evaluate_answers(self, user_id: int, questions: List[QuestionOut], db_answers: List[Answer]):
        """
        Prepares the context and calls the AI agent to evaluate all answers in a single batch.
        Updates the answer records in the database safely using a dictionary lookup.
        """
        transcript_for_ai = [
            {
                "question_id": answer.question_id,
                "question_text": answer.question.content,
                "user_answer": answer.user_answer,
                "max_score": answer.question.max_score,
                "type": answer.question.type,


            }
            
            for answer in db_answers
        ]

        evaluations_json = await run_agent(
            agent=answer_evaluation_agent,
            query=json.dumps(transcript_for_ai),
            user_id=user_id
        )

        evaluated_answers = json.loads(evaluations_json).get("answers", [])

        answers_map = {answer.question_id: answer for answer in db_answers}

        for evaluation in evaluated_answers:
            q_id = evaluation.get("question_id")
            if q_id in answers_map:
                db_answer_to_update = answers_map[q_id]
                db_answer_to_update.score = evaluation.get("score")
                db_answer_to_update.feedback = evaluation.get("feedback")
                self.db.add(db_answer_to_update) 
            else:
                print(f"Warning: AI returned evaluation for unknown question_id: {q_id}")


    async def finish_and_generate_report(self, interview_id: int, background_tasks: BackgroundTasks) -> Interview:
        """
        Finishes an interview, calculates the score, generates a report, and saves it.
        """
        db_interview = self.get_interview_by_id(interview_id)
        
        if db_interview.report is not None:
            return db_interview # Already finished, just return the result

        db_answers = answer_service.get_all_answers_for_interview(db=self.db, interview_id=interview_id)
        
        if len(db_answers) != len(db_interview.questions):
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not all questions have been answered yet!")
        
        questions = []

        for question in db_interview.questions:
            q = QuestionOut.model_validate(question)
            questions.append(q)

        _ = await self._evaluate_answers(
            user_id=db_interview.user_id,
            questions=questions,
            db_answers=db_answers
        )
        
        average_score = self._calculate_final_score(db_answers)

        report_input_data ={
            "user_name": db_interview.user.name,
            "job_title": db_interview.job_title,
            "average_score": average_score,
            "interview_transcript": db_interview.questions,
        }

        report_prompt = f"""
        - User Name: {report_input_data['user_name']}
        - Job Title: "{report_input_data['job_title']}"
        - Average Score: {report_input_data['average_score']}
        - Interview Transcript: {report_input_data['interview_transcript']}
        """
        agent_response = await run_agent(
            agent=final_report_agent,
            query=report_prompt,
            user_id=db_interview.user_id,  
        )

        report_contents = json.loads(agent_response)

        report_path = self.file_controller.get_interview_report_path(
            user_id=db_interview.user_id, interview_id=interview_id
        )
        report_content = report_contents.get("content")

        # with open(report_path, "w+") as report_file:
        #     report_file.write(report_content)

        self._update_interview_as_completed(db_interview, average_score, report_contents.get("final_decision"))

        # sent_to_email = self.email_service.send_email(
        #     user_email=db_interview.user.email,
        #     subject=report_contents.get("email_subject"),
        #     body=report_contents.get("email_body")
        # )
        background_tasks.add_task(
            self.email_service.send_email,
            user_email=db_interview.user.email,
            subject=report_contents.get("email_subject"),
            body=report_contents.get("email_body")
        )
        report = self.report_service.create_report(
            interview = db_interview,
            report_content = report_content,
            file_path=report_path,
            sent_to_email=True,
            strengths=report_contents.get("strengths", []) or [],
            areas_for_improvement=report_contents.get("areas_for_improvement", []) or []
        )
        if not report:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to generate the report.")
        
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

    def _calculate_final_score(self, answers: list) -> int:
        """Calculates the final score and determines the outcome."""
        if not answers:
            return 0
            
        total_score = sum(ans.score for ans in answers if ans.score is not None)
        avg_score = total_score / len(answers)
            
        return avg_score