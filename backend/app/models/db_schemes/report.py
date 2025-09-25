from sqlalchemy import Column, Integer, DateTime, Boolean, String, ForeignKey, Text, func
from sqlalchemy.orm import relationship

from app.core.db import Base

class Report(Base):
    
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    
    content = Column(Text, nullable=False)
    file_path = Column(String)

    sent_to_email = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)



    interview = relationship("Interview", back_populates='report')