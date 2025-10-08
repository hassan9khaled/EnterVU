import os
from fastapi import Depends, HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from typing import List

from app.controllers.FileController import FileController

from app.integrations.google_adk.agents import cv_parsing_agent
from app.integrations.google_adk.client import run_agent

from app.models.db_schemes import Cv, Interview
from app.services.user_service import UserService
from app.core.db import get_db

class CVService:
    """Orchestrates the entire CV processing and creation workflow."""

    def __init__(
        self,
        db: Session = Depends(get_db),
        file_controller: FileController = Depends(),
        user_service: UserService = Depends()
    ):
        """
        Initializes the service with its dependencies, injected by FastAPI.
        """
        self.db = db
        self.file_controller = file_controller
        self.user_service = user_service

    async def process_and_create_cv(self, user_id: int, file: UploadFile) -> Cv:
        """
        Main orchestration method. Handles validation, saving, parsing,
        DB creation, and cleanup on failure.
        """
        file_path = None  # Initialize to ensure it exists for the cleanup block
        file_name = file.filename.replace(".pdf", "") # Remove the file extension

        try:
            # Step 1: Validate the file using the controller
            self.file_controller.validate(file)

            # Step 2: Save the file to disk asynchronously
            file_path = await self.file_controller.save_cv_file(file=file, user_id=user_id)

            # Step 3: Extract text from the saved file
            raw_text = await self.file_controller.extract_text(file_path=file_path)

            # Step 4: Parse the raw text using the external async service
            user_session_id = f"user_{user_id}"
            
            parsed_text = await run_agent(
                agent=cv_parsing_agent,
                query=raw_text,
                user_id=user_session_id
        )

            # Step 5: Create the final record in the database
            return self._create_cv_record(
                user_id=user_id,
                file_path=file_path,
                raw_text=parsed_text,
                file_name=file_name  
            )
        except Exception as e:
            
            # If a file was saved but a later step failed, delete the orphaned file.
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            
            # Re-raise the original exception so FastAPI can generate the
            # correct error response for the client.
            raise e

    def _create_cv_record(self, user_id: int, file_path: str, raw_text: str, file_name: str) -> Cv:
        """
        Private method to handle the final database transaction.
        """
        user = self.user_service.get_user_by_id(user_id=user_id)
        if not user:
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} is not found"
            )

        db_cv = Cv(user_id=user_id, raw_text=raw_text, file_path=file_path, file_name=file_name)
        self.db.add(db_cv)
        self.db.commit()
        self.db.refresh(db_cv)
        return db_cv

    def get_cv_by_id_and_user(self, cv_id: int, user_id: int) -> Cv | None:
        
        """Retrieves a specific CV for a specific user."""
        return self.db.query(Cv).filter(
            Cv.id == cv_id,
            Cv.user_id == user_id
        ).first()
    
    def get_all_user_cvs(self, user_id: int) -> List[Cv] | None:

        return self.db.query(Cv).filter(
            Cv.user_id == user_id
        ).all()

    def delete_cv(self, user_id: int, cv_id: int):
        cv = self.get_cv_by_id_and_user(cv_id=cv_id, user_id=user_id)
        
        # First, delete all interviews that use this CV
        interviews_using_cv = self.db.query(Interview).filter(Interview.cv_id == cv_id).all()
        
        interview_ids = []
        for interview in interviews_using_cv:
            interview_ids.append(interview.id)
            self.db.delete(interview)
        
        # Now it's safe to delete the CV
        self.db.delete(cv)
        self.db.commit()

        return {
            "cv_id": cv_id,
            "deleted_interviews_count": len(interviews_using_cv),
            "deleted_interview_ids": interview_ids,
            "message": "CV and all related interviews deleted successfully"
        }