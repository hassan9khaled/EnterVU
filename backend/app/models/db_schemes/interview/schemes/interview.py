from sqlalchemy import (Column, Integer, DateTime, func,
                         String, ForeignKey, Enum, Float, JSON)
from sqlalchemy.orm import relationship

from app.models.enums.InterviewEnums import InterviewStatus, InterviewDecision, InterviewMode
from app.core.db import Base

class Interview(Base):
    
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)

    job_title = Column(String, nullable=False)
    job_description = Column(String, nullable=True)
    skills_to_foucs = Column(JSON, nullable=True)
    mode = Column(Enum(InterviewMode), nullable=False)
    final_score = Column(Float, nullable=True)
    decision = Column(Enum(InterviewDecision), nullable=True)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.IN_PROGRESS.value, nullable=False)


    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    user = relationship("User", back_populates="interviews", cascade="save-update")
    cvs = relationship("Cv", back_populates="interviews", cascade="save-update")
    questions = relationship("Question", back_populates='interview', cascade="all, delete-orphan")
    report = relationship("Report", back_populates="interview", uselist=False, cascade="all, delete-orphan")


