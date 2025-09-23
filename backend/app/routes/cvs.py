from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from fastapi import status

from sqlalchemy.orm import Session

from app.controllers import DataController
from app.services import cv_service
from app.models import ResponseSignal
from backend.app.core import db
from app.schemes.cv import CvOut

import shutil
import logging

logger = logging.getLogger('uvicorn.error')


cvs_router = APIRouter(
    prefix = "/api/v1/cvs",
    tags = ["api_v1", "cvs"],
)

@cvs_router.post("/upload", response_model=CvOut, status_code=status.HTTP_201_CREATED)
def upload_cv(user_id:int = Form(...), file: UploadFile = File(...),
               database: Session=Depends(db.get_db)):
    data_controller = DataController()

    is_valid, result_signal = data_controller.validate_uploaded_file(file=file)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "signal": result_signal
            }
        )
   
    file_path, file_id = data_controller.generate_unique_filepath(
        orig_file_name=file.filename,
        user_id=user_id
    )
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "signal": ResponseSignal.FILE_UPLOAD_FAILED.value
            }
        )
    finally:
        file.file.close()
    raw_text = data_controller.extract_file_text(file_path=file_path)

    return cv_service.create_cv(db=database, user_id=user_id, file_path=file_path, raw_text=raw_text)