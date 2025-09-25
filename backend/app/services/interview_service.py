from sqlalchemy.orm import Session, joinedload

from app.models.db_schemes import Interview
from app.models import InterviewDecision, InterviewStatus
from app.schemes.interview_schemes import InterviewCreate


def create_interview_session(db: Session, interview_data: InterviewCreate) -> Interview:
    db_interview = Interview(
        user_id = interview_data.user_id,
        cv_id = interview_data.cv_id,
        job_title = interview_data.job_title,
        job_description = interview_data.job_description,
        status = InterviewStatus.IN_PROGRESS.value
    )
    
    db.add(db_interview)

    return db_interview
def update_interview_as_completed(db: Session, interview: Interview,
                        score: float,
                        decision: InterviewDecision) -> Interview:
    """
    Updates an existing interview record to mark it as complete.
    Does NOT commit the transaction.
    """
    interview.status = InterviewStatus.COMPLETED.value
    interview.score = score
    interview.decision = decision
    
    db.add(interview)
    return interview

def get_interview_by_id(db: Session, interview_id: int):
    return db.query(Interview).options(
        joinedload(Interview.cvs),
        joinedload(Interview.report),
        joinedload(Interview.user)
    ).filter(Interview.id == interview_id).first()

