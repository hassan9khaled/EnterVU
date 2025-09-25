from app.models.db_schemes import User

from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.db_schemes.user import User
from app.schemes.user_schemes import UserCreate

def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Creates a new user in the database.

    Args:
        db: The SQLAlchemy database session.
        user_data: The Pydantic schema containing user data (email, name).

    Returns:
        The newly created User object.

    Raises:
        HTTPException: If a user with the same email already exists.
    """
    # Create a new SQLAlchemy User model instance from the Pydantic schema data
    db_user = User(
        email=user_data.email,
        name=user_data.name
    )

    try:
        
        db.add(db_user)
        db.commit()
        # Refresh the instance to get the ID and other defaults from the DB
        db.refresh(db_user)
    except IntegrityError:
        # This error occurs if the email (which is unique) already exists.
        db.rollback()  # Roll back the failed transaction
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{user_data.email}' already exists."
        )

    return db_user

def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Retrieves a user from the database by their email.

    Args:
        db: The SQLAlchemy database session.
        email: The email of the user to retrieve.

    Returns:
        The User object if found, otherwise None.
    """
    return db.query(User).filter(User.email == email).first()

def get_user(db: Session, user_id: int) -> User | None:

    return db.query(User).filter(User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Retrieves a list of users from the database with pagination.
    """
    return db.query(User).offset(skip).limit(limit).all()

