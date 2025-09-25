from fastapi import APIRouter, Depends, status
from fastapi import HTTPException, status

from sqlalchemy.orm import Session

from app.schemes.user_schemes import UserCreate, UserOut

from app.services import user_service
from app.core import db

import logging
from typing import List

logger = logging.getLogger('uvicorn.error')


users_router = APIRouter(
    prefix = "/api/v1/users",
    tags = ["api_v1", "users"],
)

# User endpoint
@users_router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, database: Session = Depends(db.get_db)):

    db_user = user_service.get_user_by_email(db=database, email=user.email)
    if db_user:
        # This logic could also be inside the service function
        raise HTTPException(status_code=409, detail="Email already registered")
    new_user = user_service.create_user(db=database, user_data=user)


    return new_user

@users_router.get("/",  response_model=List[UserOut])
async def read_users(skip = 0, limit = 100, database: Session = Depends(db.get_db)):
    """
    Retrieve all the users
    """
    users = user_service.get_users(db=database, skip=skip, limit=limit)

    return users

@users_router.get("/{user_id}", response_model=UserOut)
async def read_user(user_id: int, database: Session = Depends(db.get_db)):
    db_user = user_service.get_user(db = database,user_id=user_id)

    # If the service function returns None, the user was not found
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
        
    # If found, return the user object. FastAPI will serialize it.
    return db_user
