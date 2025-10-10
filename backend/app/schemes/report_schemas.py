from pydantic import BaseModel, Field
from typing import List
from app.models.enums.InterviewEnums import InterviewDecision 

class FinalReportOutput(BaseModel):

    final_decision: InterviewDecision = Field(
        ...,
        description="The final hiring decision, which must be one of 'accepted', 'rejected', or 'needs_improvement'."
    )
    strengths: List[str] = Field(
        ...,
        min_items=1,
        max_items=3,
        description="A list of 1-3 key strengths demonstrated by the candidate, written as concise points."
    )
    areas_for_improvement: List[str] = Field(
        ...,
        min_items=1,
        max_items=3,
        description="A list of 1-3 concrete areas where the candidate can improve, with actionable advice."
    )
    content: str = Field(
        ...,
        description="A comprehensive, multi-paragraph summary of the candidate's overall performance, incorporating the strengths and areas for improvement."
    )
    email_subject: str = Field(
        ...,
        description="A concise and appropriate subject line for the email to the user (e.g., 'Your EnterVU Interview Results')."
    )
    email_body: str = Field(
        ...,
        description="A personalized, empathetic, and professional email body, with a tone that matches the final_decision, **written in html**."
    )

class ReportOut(BaseModel):
    
    id: int
    content: str
    strengths: List[str]
    areas_for_improvement: List[str]

    class Config:
        from_attributes = True

