from pydantic import BaseModel
from datetime import datetime
from typing import List
from .report_schemas import ReportOut
from .cv_schemes import CvOut
from .user_schemes import UserOut
from .questions_schemes import QuestionOut

class InterviewCreate(BaseModel):
    user_id: int
    cv_id: int
    job_title: str
    job_description: str | None = None

class InterviewOut(BaseModel):
    
    id: int

    user: UserOut
    cvs: CvOut
    job_title: str
    questions: List[QuestionOut] = []
    score: float | None = None
    decision: str | None = None
    report: ReportOut | None = None
    created_at: datetime

    class Config:
        from_attributes = True