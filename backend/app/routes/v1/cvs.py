from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from fastapi import status

from sqlalchemy.orm import Session

from app.services.cv_service import CVService
from app.core import db
from app.schemes.cv_schemes import CvOut

import logging

logger = logging.getLogger('uvicorn.error')


cvs_router = APIRouter(
    prefix = "/cvs",
    tags = ["api_v1", "cvs"],
)

@cvs_router.post("/upload", response_model=CvOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(user_id:int = Form(...), file: UploadFile = File(...)):
    
    new_cv = await CVService.process_and_create_cv(user_id=user_id, file=file)

    return new_cv