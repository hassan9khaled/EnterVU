from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.db_schemes.cv import Cv
from app.services import user_service

def create_cv(db: Session, user_id: int, file_path: str, raw_text) -> Cv:

  # Check for user existance
  user = user_service.get_user(db=db, user_id=user_id)
  if not user:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"User with id {user_id} is not found"
    )

  db_cv = Cv(
    user_id=user_id,
    raw_text=raw_text,
    file_path=file_path
  )
  db.add(db_cv)
  db.commit()
  db.refresh(db_cv)

  return db_cv

def get_cv_by_id_and_user(db: Session, cv_id: int, user_id: int) -> Cv | None:
    return db.query(Cv).filter(
        Cv.id == cv_id,
        Cv.user_id == user_id
    ).first()