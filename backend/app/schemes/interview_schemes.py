from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import List, Optional
from .report_schemas import ReportOut
from .cv_schemes import CvOut
from .user_schemes import UserOut
from .questions_schemes import QuestionOut
from app.models.enums.InterviewEnums import InterviewMode

class InterviewCreate(BaseModel):
    user_id: int
    cv_id: int
    job_title: str
    job_description: str | None = None
    skills_to_foucs: Optional[List[str]] | None = []
    mode: InterviewMode | None = None

class InterviewOut(BaseModel):
    
    id: int

    user: UserOut
    cvs: CvOut
    job_title: str
    questions: List[QuestionOut] = []
    final_score: float | None = None
    status: str
    decision: str | None = None
    report: ReportOut | None = None
    mode: str
    created_at: datetime

    class Config:
        from_attributes = True