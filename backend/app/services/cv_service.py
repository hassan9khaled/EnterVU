import os
from fastapi import Depends, HTTPException, status, UploadFile
from sqlalchemy.orm import Session

from app.controllers.FileController import FileController

from app.integrations.google_adk.agents import cv_parsing_agent
from app.integrations.google_adk.client import run_agent

from app.models.db_schemes.cv import Cv
from app.services import user_service
from app.core.db import get_db

class CVService:
    """Orchestrates the entire CV processing and creation workflow."""

    def __init__(
        self,
        db: Session = Depends(get_db),
        file_controller: FileController = Depends()
    ):
        """
        Initializes the service with its dependencies, injected by FastAPI.
        """
        self.db = db
        self.file_controller = file_controller

    async def process_and_create_cv(self, user_id: int, file: UploadFile) -> Cv:
        """
        Main orchestration method. Handles validation, saving, parsing,
        DB creation, and cleanup on failure.
        """
        file_path = None  # Initialize to ensure it exists for the cleanup block

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
                raw_text=parsed_text  # Assuming you save the parsed JSON here
            )
        except Exception as e:
            
            # If a file was saved but a later step failed, delete the orphaned file.
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            
            # Re-raise the original exception so FastAPI can generate the
            # correct error response for the client.
            raise e

    def _create_cv_record(self, user_id: int, file_path: str, raw_text: str) -> Cv:
        """
        Private method to handle the final database transaction.
        """
        user = user_service.get_user(db=self.db, user_id=user_id)
        if not user:
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} is not found"
            )

        db_cv = Cv(user_id=user_id, raw_text=raw_text, file_path=file_path)
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
