from sqlalchemy.orm import Session
from typing import List
from app.models.db_schemes import Question

def get_next_unanswered_question(db: Session, interview_id: int) -> Question:
    return db.query(Question).filter(
        Question.interview_id == interview_id,
        Question.answer == None
    ).order_by(Question.order).first()

def get_question_by_id (db: Session, question_id: int, interview_id: int) -> Question:
    return db.query(Question).filter(
        Question.interview_id == interview_id,
        Question.id == question_id
    ).first()

def get_questions_by_interview_id(db: Session, interview_id: int) -> List[Question]:

    return db.query(Question).filter(
        Question.interview_id == interview_id,
        Question.answer != None
    ).order_by(Question.order).all()    
