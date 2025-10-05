from typing import List
from fastapi import APIRouter, Depends, status, Query

from app.schemes.user_schemes import UserCreate, UserOut, UserUpdate
from app.schemes.response_schemes import OperationResponse
from app.services.user_service import UserService

users_router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@users_router.post(
    "/",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a New User",
)
def create_user(user: UserCreate, user_service: UserService = Depends()):
    """
    Registers a new user in the system.

    - **email**: Must be a unique email address.
    - **name**: The full name of the user.

    If a user with the provided email already exists, a `409 Conflict` error will be returned.
    """
    return user_service.create_user(user_data=user)

@users_router.get(
    "/",
    response_model=List[UserOut],
    summary="List All Users",
)
def list_users(
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination."),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return."),
    user_service: UserService = Depends()
):
    """
    Retrieves a paginated list of all users registered in the system.
    """
    return user_service.get_users(skip=skip, limit=limit)

@users_router.get(
    "/{user_id}",
    response_model=UserOut,
    summary="Get a Specific User",
)
def get_user(user_id: int, user_service: UserService = Depends()):
    """
    Retrieves detailed information for a single user by their unique ID.

    If a user with the specified ID is not found, a `404 Not Found` error is returned.
    """
    return user_service.get_user_by_id(user_id=user_id)

@users_router.delete(
    "/{user_id}",
    response_model=OperationResponse,
    summary="Delete a User",
)
def delete_user(user_id: int, user_service: UserService = Depends()):
    """
    Deletes a user from the system by their unique ID.

    If a user with the specified ID is not found, a `404 Not Found` error is returned.
    Upon successful deletion, returns the details of the deleted user.
    """
    deleted_user_details = user_service.delete_user(user_id=user_id)
    return OperationResponse(
        message="User successfully deleted",
        data=deleted_user_details
    )

@users_router.patch(
    "/{user_id}",
    response_model=UserOut,
    summary="Update a User's Information",
)
def update_user(user_id: int, user_data: UserUpdate, user_service: UserService = Depends()):
    """
    Updates a user's details. Only the fields provided in the request body will be modified.

    - **email**: If provided, must be a unique email address.
    - **name**: If provided, updates the user's name.

    If a user with the specified ID is not found, a `404 Not Found` error is returned.
    If the new email already belongs to another user, a `409 Conflict` error is returned.
    """
    return user_service.update_user(user_id=user_id, user_data=user_data)
