from pydantic import BaseModel, Field  
from typing import List

class AnswerCreate(BaseModel):
    question_id: int
    user_answer: str


class AnswerOut(BaseModel):
    id: int
    user_answer: str
    score: float | None = None
    feedback: str | None = None

    class Config:
        from_attributes = True

class AnswerEvaluation(BaseModel):
    """
    Defines the structured output for the AI agent that evaluates a single answer.
    """
    question_id: int

    score: float = Field(
        ...,
        ge=0,
        le=10,
        description="A score from 0.0 to 10.0 evaluating the answer's quality."
    )
    feedback: str = Field(
        ...,
        description="Concise, constructive, and encouraging feedback for the user, explaining the score."
    )

class AnswerEvaluationAgent(BaseModel):
    
    answers: List[AnswerEvaluation]