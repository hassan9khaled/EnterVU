from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    """Application settings loaded from environment variables."""
    
    APP_NAME: str
    APP_VERSION: str

    FILE_MAX_SIZE: int
    FILE_ALLOWED_TYPES: list
    MAX_PAGES: int

    class Config:
        env_file = "./app/.env"


def get_settings():
    return Settings()