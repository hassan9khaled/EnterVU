from pydantic import BaseModel  

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