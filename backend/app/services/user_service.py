from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status

from app.models.db_schemes import User
from app.schemes.user_schemes import UserCreate, UserUpdate, LoginRequest
from app.core.db import get_db

class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """Creates a new user, ensuring the email is unique."""
        if self.get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{user_data.email}' already exists."
            )
        db_user = User(**user_data.model_dump())
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieves a user from the database by their email."""
        return self.db.query(User).filter(User.email == email).first()

    def user_login(self, user_data: LoginRequest) -> Optional[User]:
        
        user_email = user_data.email
        user_password = user_data.password

        db_user = self.get_user_by_email(user_email)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {user_email} not found"
            )
        if db_user.password == user_password:
            return db_user
        else:
             raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail=f"Wrong password or email"
             )           
    def get_user_by_id(self, user_id: int) -> User:
        """Retrieves a user by ID, raising a 404 error if not found."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found"
            )
        return user

    def delete_user(self, user_id: int) -> dict:
        """Deletes a user after confirming they exist."""
        db_user = self.get_user_by_id(user_id)
        user_details = {"user_id": user_id, "email": db_user.email, "name": db_user.name}
        self.db.delete(db_user)
        self.db.commit()
        return user_details

    def get_users(self, skip: int, limit: int) -> List[User]:
        """Retrieves a list of users with pagination."""
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """Performs a partial update of a user's information."""
        db_user = self.get_user_by_id(user_id)
        update_data = user_data.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] != db_user.email:
            if self.get_user_by_email(update_data["email"]):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"User with email '{update_data['email']}' already exists."
                )

        for key, value in update_data.items():
            setattr(db_user, key, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user
