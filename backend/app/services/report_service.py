from sqlalchemy.orm import Session

from app.models.db_schemes import Interview, Report

def create_report(db: Session, interview: Interview, report_content: str, file_path: str):

    db_report = Report(
        interview_id = interview.id,
        content = report_content,
        file_path = file_path
    )

    db.add(db_report)

    return db_report