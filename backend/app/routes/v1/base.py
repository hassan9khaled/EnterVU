from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.config import get_settings, Settings


class RootResponse(BaseModel):
    app_name: str
    version: str

base_router = APIRouter(
    tags=["API Info"],
)

@base_router.get(
    "/health",
    summary="Health Check",
    description="Performs a simple health check on the API to confirm it is running."
)
def health_check():
    """Confirms the API is alive and responding."""
    return {"status": "ok"}

@base_router.get(
    "/",
    response_model=RootResponse,
    summary="Get API Information",
    description="Returns the application's name and current version."
)
def root(app_settings: Settings = Depends(get_settings)):
    """Retrieves basic application information from the environment settings."""
    return {
        "app_name": app_settings.APP_NAME,
        "version": app_settings.APP_VERSION
    }
