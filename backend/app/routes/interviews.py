from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemes.interview_schemes import InterviewCreate, InterviewOut
from app.schemes.questions_schemes import QuestionOut
from app.schemes.answers_schemes import AnswerOut, AnswerCreate
from app.schemes.report_schemas import ReportOut
from app.controllers import InterviewController

import logging
from typing import Union, Dict

logger = logging.getLogger('uvicorn.error')


interviews_router = APIRouter(
    prefix = "/api/v1/interviews",
    tags = ["api_v1", "interviews"],
)

@interviews_router.post("/start", response_model= InterviewOut, status_code=status.HTTP_201_CREATED)
async def start_interview(interview_data: InterviewCreate, db: Session = Depends(get_db)):
    return InterviewController.start_interview(db=db, interview_data=interview_data)

@interviews_router.get("/{interview_id}/next-question", response_model=Union[QuestionOut, dict])
async def next_question(interview_id: int, db: Session = Depends(get_db)):
    return InterviewController.get_next_question(db=db, interview_id=interview_id)

@interviews_router.post("/{interview_id}/answer", response_model=AnswerOut)
async def answer_question(answer: AnswerCreate, interview_id: int, db: Session = Depends(get_db)):
    return InterviewController.submit_answer(
        db=db,
        answer_data=answer,
        interview_id=interview_id
    )

@interviews_router.post("/{interview_id}/finish", response_model=InterviewOut)
async def finish_interview(interview_id: int, db: Session = Depends(get_db)):
    return InterviewController.finish_interview(
        db=db,
        interview_id=interview_id
    )