from sqlalchemy import Column, Integer, ForeignKey, Text, Float, String
from sqlalchemy.orm import relationship

from app.core.db import Base

class Question(Base):
    
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)

    text = Column(Text, nullable=False)
    audio_path = Column(String, nullable=True)
    max_score = Column(Float, default=10.0) 
    order = Column(Integer, nullable=False)


    interview = relationship("Interview", back_populates='questions')
    answer = relationship("Answer", back_populates="question", uselist=False, cascade="all, delete-orphan")
