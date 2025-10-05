import logging
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException, Query


from app.schemes.user_schemes import UserCreate, UserOut
from app.schemes.response_schemes import OperationResponse
from app.models.enums.ResponseEnums import OperationStatus
from app.services.user_service import UserService

logger = logging.getLogger('uvicorn.error')


users_router = APIRouter(
    prefix = "/users",
    tags = ["api_v2", "Users"],
)


@users_router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, user_service: UserService = Depends()):

    return await user_service.create_user(user_data=user)

@users_router.get("/",  response_model=List[UserOut])
async def read_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    user_service: UserService = Depends()
):
    """
    Retrieve all the users
    """
    users = user_service.get_users(skip=skip, limit=limit)

    return users

@users_router.get("/{user_id}", response_model=UserOut)
async def read_user(user_id: int, user_service: UserService = Depends()):
    db_user = user_service.get_user(user_id=user_id)

    # If the service function returns None, the user was not found
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
        
    # If found, return the user object. FastAPI will serialize it.
    return db_user

@users_router.delete("/{user_id}", response_model=OperationResponse)
async def delete_user(user_id: int, user_service: UserService = Depends()):
    
    user = await user_service.delete_user(user_id=user_id)

    return OperationResponse(
        message=OperationStatus.DELETED.value,
        data=user
    )

@users_router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_data: UserCreate, user_service: UserService = Depends()):
    return user_service.update_user(user_id=user_id, user_data=user_data)
