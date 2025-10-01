import os
import re
import uuid
import PyPDF2
import asyncio 
import aiofiles

from fastapi import UploadFile, HTTPException, status, Depends

from .UserController import UserController
from app.core.config import get_settings 


class FileController:
    """
    A modern, injectable controller for handling file operations asynchronously.
    """
    def __init__(self, user_controller: UserController = Depends()):

        self.user_controller = user_controller
        self.size_scale = 1048576  # MB to bytes
        self.settings = get_settings()

    def validate(self, file: UploadFile):
        """
        Validates the file and raises HTTPException on failure.
        """
        if file.content_type not in self.settings.FILE_ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="File type is not supported."
            )

        if file.size > self.settings.FILE_MAX_SIZE * self.size_scale:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the maximum limit."
            )

    async def save_cv_file(self, file: UploadFile, user_id: int) -> str:
        """
        Generates a unique path and saves the file asynchronously.
        Returns the final file path.
        """
        # Get user path via the injected controller
        user_path = self.user_controller.get_user_path(user_id=user_id)
        
        # Clean and create a unique filename
        clean_name = self._get_clean_file_name(file.filename)
        random_key = uuid.uuid4()
        new_file_name = f"{random_key}_{clean_name}"
        file_path = os.path.join(user_path, new_file_name)

        # Asynchronously write the file
        try:
            async with aiofiles.open(file_path, "wb") as buffer:
                while content := await file.read(1024 * 1024):  # Read in 1MB chunks
                    await buffer.write(content)
            return file_path
        
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="There was an error saving the file."
            )
    def get_interview_report_path(self, user_id: int, interview_id: int) -> str:
        """
        Generates a predictable file path for a specific interview report.
        """

        # Get the specific 'report' path via the injected controller
        user_path = self.user_controller.get_user_path(user_id=user_id, report=True)
        
        # Create the predictable filename
        file_name = f"interview_{str(interview_id)}_report.txt"
        
        report_path = os.path.join(user_path, file_name)
        
        return report_path
    
    async def extract_text(self, file_path: str) -> str:
        """
        Asynchronously extracts text by running the blocking PyPDF2 code in a separate thread.
        """
        return await asyncio.to_thread(self._extract_text_pypdf2_sync, file_path)

    
    def _extract_text_pypdf2_sync(self, file_path: str) -> str:
        """
        This is the private helper that contains all the blocking, synchronous PyPDF2 code.
        """
        try:
            raw_text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)

                
                if len(reader.pages) > self.settings.MAX_PAGES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="PDF exceeds the 5-page limit."
                    )

                for page in reader.pages:
                    raw_text += page.extract_text() or ""
            
            if not raw_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not extract text from the PDF."
                )
            return raw_text
        except Exception as e:
            # If text extraction fails, clean up the file that was just saved.
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid or corrupted PDF file: {e}"
            )       
        except Exception as e:
            # Clean up the saved file if text extraction fails
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid or corrupted PDF file: {e}"
            )

    def _get_clean_file_name(self, orig_file_name: str) -> str:
        """Internal utility to sanitize a filename."""
        cleaned = re.sub(r'[^\w.]', '', orig_file_name.strip())
        return cleaned.replace(" ", "_")
