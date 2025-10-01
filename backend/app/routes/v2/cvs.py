from fastapi import APIRouter, Depends, Form, File, UploadFile, status
from app.schemes.cv_schemes import CvOut
from app.services.cv_service import CVService

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