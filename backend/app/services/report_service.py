from sqlalchemy.orm import Session
from fastapi import Depends
from typing import List
from app.models.db_schemes import Interview, Report
from app.core.db import get_db

class ReportService:

    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_report(self, interview: Interview,
                    sent_to_email: bool,report_content: str, file_path: str,
                    strengths: List[str], areas_for_improvement: List[str]) -> Report:

        db_report = Report(
            interview_id = interview.id,
            content = report_content,
            areas_for_improvement = areas_for_improvement,
            strengths =strengths,
            file_path = file_path,
            sent_to_email = sent_to_email,
        )

        self.db.add(db_report)

        return db_report