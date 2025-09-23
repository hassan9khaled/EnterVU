from sqlalchemy import Column, Integer, ForeignKey, Text, Float, String
from sqlalchemy.orm import relationship

from app.models.db_schemes.db import Base

class Answer(Base):
    
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    user_answer = Column(Text)
    audio_path = Column(String)
    score = Column(Float)


    questions = relationship("Question", back_populates='answers')