from sqlalchemy import Column, Integer, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship

from app.core.db import Base
from app.models.enums.QuestionEnums import QuestionType
from .question_topic_association import question_topic_table

class Question(Base):
    
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)

    content = Column(Text, nullable=False)
    type = Column(Enum(QuestionType), nullable=False, server_default='technical')
    max_score = Column(Float, default=10.0) 
    order = Column(Integer, nullable=False)


    interview = relationship("Interview", back_populates='questions')
    answer = relationship("Answer", back_populates="question", uselist=False, cascade="all, delete-orphan")
    topics = relationship("Topic", secondary=question_topic_table, back_populates="questions")
