from app.models.db_schemes import User

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import Depends, HTTPException, status

from app.models.db_schemes import User
from app.schemes.user_schemes import UserCreate
from app.models.enums.ResponseEnums import OperationStatus

from app.core.db import get_db

class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    async def create_user(self, user_data: UserCreate) -> User:
        """
        Creates a new user in the database.

        Args:
            user_data: The Pydantic schema containing user data (email, name).

        Returns:
            The newly created User object.

        Raises:
            HTTPException: If a user with the same email already exists.
        """
        # Check if user already exists
        existing_user = self.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{user_data.email}' already exists."
            )

        # Create a new SQLAlchemy User model instance
        db_user = User(
            email=user_data.email,
            name=user_data.name
        )

        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{user_data.email}' already exists."
            )

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Retrieves a user from the database by their email.

        Args:
            email: The email of the user to retrieve.

        Returns:
            The User object if found, otherwise None.
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> User:
        """
        Retrieves a user by ID and handles not found error.

        Args:
            user_id: The ID of the user to retrieve.

        Returns:
            The User object if found.

        Raises:
            HTTPException: If user is not found.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    def get_user(self, user_id: int) -> Optional[User]:
        """
        Retrieves a user by ID without raising exception (legacy support).

        Args:
            user_id: The ID of the user to retrieve.

        Returns:
            The User object if found, otherwise None.
        """
        return self.db.query(User).filter(User.id == user_id).first()

    async def delete_user(self, user_id: int) -> dict:
        """
        Deletes a user from the database.

        Args:
            user_id: The ID of the user to delete.

        Returns:
            Dictionary with deletion details.

        Raises:
            HTTPException: If user is not found.
        """
        db_user = self.get_user_by_id(user_id)
        
        # Store user data for response before deletion
        user_email = db_user.email
        user_name = db_user.name
        
        self.db.delete(db_user)
        self.db.commit()
        
        return {
            "user_id": user_id,
            "email": user_email,
            "name": user_name,
        }

    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Retrieves a list of users from the database with pagination.

        Args:
            skip: Number of records to skip (for pagination).
            limit: Maximum number of records to return.

        Returns:
            List of User objects.
        """
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_user(self, user_id: int, user_data: UserCreate) -> User:
        """
        Updates a user's information.

        Args:
            user_id: The ID of the user to update.
            user_data: The updated user data.

        Returns:
            The updated User object.

        Raises:
            HTTPException: If user is not found or email already exists.
        """
        db_user = self.get_user_by_id(user_id)
        
        # Check if email is being changed and if it already exists
        if user_data.email != db_user.email:
            existing_user = self.get_user_by_email(user_data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"User with email '{user_data.email}' already exists."
                )
        
        # Update user fields
        db_user.email = user_data.email if user_data.email else db_user.email
        db_user.name = user_data.name if user_data.name else db_user.name
        

        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user