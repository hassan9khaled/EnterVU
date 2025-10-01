from fastapi import APIRouter, Depends, status
from typing import Union


from app.schemes.interview_schemes import InterviewCreate, InterviewOut
from app.schemes.questions_schemes import QuestionOut
from app.schemes.answers_schemes import AnswerOut, AnswerCreate


from app.services.interview_service import InterviewService


interviews_router = APIRouter(
    prefix="/interviews",
    tags=["api_v1", "Interviews"]
)


@interviews_router.post("/start", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
async def start_interview(
    interview_data: InterviewCreate,
    interview_service: InterviewService = Depends()
):
    """
    Starts a new interview session by validating inputs and generating questions.
    """
    return await interview_service.start_new_interview(interview_data=interview_data)


@interviews_router.get("/{interview_id}/next-question", response_model=Union[QuestionOut, dict])
async def get_next_question(
    interview_id: int,
    interview_service: InterviewService = Depends()
):
    """
    Retrieves the next unanswered question for an ongoing interview.
    """
    return interview_service.get_next_question(interview_id=interview_id)


@interviews_router.post("/{interview_id}/answers", response_model=AnswerOut)
async def submit_answer(
    interview_id: int,
    answer_data: AnswerCreate,
    interview_service: InterviewService = Depends()
):
    """
    Submits a user's answer for a specific question to be evaluated and saved.
    """
    return await interview_service.submit_and_evaluate_answer(
        interview_id=interview_id,
        answer_data=answer_data
    )


@interviews_router.post("/{interview_id}/finish", response_model=InterviewOut)
async def finish_interview(
    interview_id: int,
    interview_service: InterviewService = Depends()
):
    """
    Finalizes the interview, calculates the score, and generates the final report.
    """
    return await interview_service.finish_and_generate_report(interview_id=interview_id)