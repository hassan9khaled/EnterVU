from pydantic import BaseModel
from datetime import datetime

class InterviewCreate(BaseModel):
    user_id: int
    cv_id: int
    job_title: str

class InterviewOut(BaseModel):
    id: int
    user_id: int
    cv_id: int

    job_title: str
    score: float
    decision: str

    created_at: datetime

    class Config:
        from_attributes = True