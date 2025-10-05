from sqlalchemy import Column, Integer, ForeignKey, Text, Float, String
from sqlalchemy.orm import relationship

from app.core.db import Base

class Answer(Base):
    
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    user_answer = Column(Text, nullable=False)
    audio_path = Column(String, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)


    question = relationship("Question", back_populates='answer')