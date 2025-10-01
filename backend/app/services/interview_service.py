import os
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.controllers.FileController import FileController
from app.integrations.google_adk import mock_client
from app.models import InterviewDecision, InterviewStatus
from app.models.db_schemes import Interview, Question
from app.schemes.answers_schemes import AnswerCreate
from app.schemes.interview_schemes import InterviewCreate
from app.schemes.questions_schemes import QuestionOut
from app.services import (
    user_service, CVService, question_service, 
    answer_service, report_service
)
from app.core.db import get_db

class InterviewService:
    def __init__(
        self,
        db: Session = Depends(get_db),
        file_controller: FileController = Depends(),
        cv_service: CVService = Depends()
    ):
        self.db = db
        self.file_controller = file_controller
        self.cv_service = cv_service

    async def start_new_interview(self, interview_data: InterviewCreate) -> Interview:
        """
        Orchestrates validation, AI question generation, and saving a new interview.
        """
        user = user_service.get_user(self.db, user_id=interview_data.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        cv = self.cv_service.get_cv_by_id_and_user(cv_id=interview_data.cv_id, user_id=interview_data.user_id)
        if not cv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found for this user")

        question_texts = await mock_client.generate_questions(
            cv_text=cv.raw_text,
            job_title=interview_data.job_title,
            job_description=interview_data.job_description,
            user_id=user.id
        )
        
        db_interview = self._create_interview_record_with_questions(interview_data, question_texts)
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

        evaluation = await mock_client.evaluate_answer(question=db_question.text, answer=answer_data.user_answer)
        
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

    def _create_interview_record_with_questions(self, interview_data: InterviewCreate, questions: list[str]) -> Interview:
        """Creates the parent Interview and its child Question records."""
        db_interview = Interview(
            user_id=interview_data.user_id,
            cv_id=interview_data.cv_id,
            job_title=interview_data.job_title,
            job_description=interview_data.job_description,
            status=InterviewStatus.IN_PROGRESS.value
        )
        db_interview.questions.extend([
            Question(text=text, order=i + 1) for i, text in enumerate(questions)
        ])
        self.db.add(db_interview)
        return db_interview

    def _update_interview_as_completed(self, interview: Interview, score: float, decision: str):
        
        """Updates an interview record to mark it as complete."""
        interview.status = InterviewStatus.COMPLETED.value
        interview.score = score
        interview.decision = decision
        self.db.add(interview)

    def _calculate_final_score_and_decision(self, answers: list) -> tuple[float, str]:
        """Calculates the final score and determines the outcome."""
        if not answers:
            return 0.0, InterviewDecision.REJECTED.value
            
        total_score = sum(ans.score for ans in answers if ans.score is not None)
        final_score = total_score / len(answers)

        if final_score >= 7:
            decision = InterviewDecision.ACCEPTED.value
        elif final_score >= 5:
            decision = InterviewDecision.NEEDS_IMPROVEMENT.value
        else:
            decision = InterviewDecision.REJECTED.value
            
        return final_score, decision