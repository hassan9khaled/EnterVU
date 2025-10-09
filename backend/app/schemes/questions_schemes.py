from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal
from .answers_schemes import AnswerOut
from app.models.enums.QuestionEnums import QuestionType


class QuestionCreate(BaseModel):

    content: str
    max_score: int = Field(..., ge=0, le=10, description="Score must be between 0 and 10")
    type: str
    topics: List[str] = Field(..., description="All topics must be in lower case")
    @validator('topics', each_item=True, pre=True)
    def convert_topics_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.strip().lower()
        return v
    @validator("topics",pre=True)
    def extract_topic_names(cls, v):
        if isinstance(v, list):
            if v and hasattr(v[0], 'name'):
                return [topic.name for topic in v]
            elif v and isinstance(v[0], str):
                return v
        return v

class QuestionOut(QuestionCreate):

    id: int
    answer: Optional[AnswerOut] = None
    order: int

    class Config:
        from_attributes = True


        

class QuestionOutAgent(BaseModel):
    questions: List[QuestionCreate]