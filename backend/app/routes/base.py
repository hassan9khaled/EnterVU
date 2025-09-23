from fastapi import APIRouter, FastAPI, Depends
import os
from app.core.config import get_settings, Settings

# Create an API router for the base endpoints
base_router = APIRouter(
    prefix = "/api/v1",
    tags = ["api_v1"],
)
# Health check endpoint
@base_router.get("/health")
def health_check():
    return {"status": "ok"}

# Root endpoint
@base_router.get("/")
def root(app_settings: Settings = Depends(get_settings)):

    # Retrieve app name and version from settings
    app_name = app_settings.APP_NAME
    app_version = app_settings.APP_VERSION

    # Return the information as a JSON response
    return {
        "app_name": app_name,
        "version": app_version
    }
