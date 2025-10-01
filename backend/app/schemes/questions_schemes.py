from pydantic import BaseModel  
from typing import Optional
from .answers_schemes import AnswerOut

class QuestionOut(BaseModel):
    id: int
    text: str
    answer: Optional[AnswerOut] = None
    order: int

    class Config:
        from_attributes = True