from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.db import Base
from .question_topic_association import question_topic_table

class Topic(Base):
    
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    questions = relationship("Question", secondary=question_topic_table, back_populates="topics")
