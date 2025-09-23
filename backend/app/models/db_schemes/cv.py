from sqlalchemy import Column, Integer, DateTime, func, ForeignKey, Text, String
from sqlalchemy.orm import relationship

from backend.app.core.db import Base

class Cv(Base):
    
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    raw_text = Column(Text, nullable=False)
    file_path = Column(String)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="cvs")
    interviews = relationship("Interview", back_populates="cvs")

