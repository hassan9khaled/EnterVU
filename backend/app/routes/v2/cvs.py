from fastapi import APIRouter, Depends, Form, File, UploadFile, status, Query
from app.schemes.cv_schemes import CvOut
from app.services.cv_service import CVService
from app.schemes.response_schemes import OperationResponse
from app.models.enums.ResponseEnums import OperationStatus
from typing import List

cvs_router = APIRouter(
    prefix="/cvs",
    tags=["api_v2", "CVs"]
)

@cvs_router.post("/upload", response_model=CvOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    cv_service: CVService = Depends()
):
    """
    Handles the upload of a CV file.

    The CVService orchestrates the entire process of validation, storage,
    text parsing, and database record creation, including cleanup on failure.
    """
    new_cv = await cv_service.process_and_create_cv(user_id=user_id, file=file)

    return new_cv

@cvs_router.get("/", response_model=List[CvOut])
async def get_user_cvs(
    user_id: int = Query(),
    cv_service: CVService = Depends()
):
    return cv_service.get_all_user_cvs(user_id=user_id)
@cvs_router.delete("/")
async def delete_cv(
    user_id: int = Query(),
    cv_id: int = Query(),
    cv_service: CVService = Depends()    
):
    cv = cv_service.delete_cv(user_id=user_id, cv_id=cv_id)
    return OperationResponse(
        message=OperationStatus.DELETED.value,
        data=cv
    )