from sqlalchemy.orm import Session
from typing import List

from app.models.db_schemes import Answer, Question


def create_answer(db: Session, question_id: int,
                  user_answer: str, score: float, feedback: str):
    
    db_answer = Answer(
        question_id=question_id,
        user_answer=user_answer,
        score=score,
        feedback=feedback
    )

    db.add(db_answer)

    return db_answer

def get_all_answers_for_interview(db: Session, interview_id: int) -> List[Answer]:

    return db.query(Answer).join(Question).filter(Question.interview_id == interview_id).all()