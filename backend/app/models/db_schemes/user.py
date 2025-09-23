from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.db_schemes.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)

    cvs = relationship("app.models.db_schemes.cv.Cv", back_populates="user")
    interviews = relationship("app.models.db_schemes.interview.Interview", back_populates="user")