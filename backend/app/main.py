from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

# Routers from V1
from app.routes.v1 import base as base_v1
from app.routes.v1 import users as users_v1
from app.routes.v1 import cvs as cvs_v1
from app.routes.v1 import interviews as interviews_v1

# Routers from V2
from app.routes.v2 import base as base_v2
from app.routes.v2 import users as users_v2
from app.routes.v2 import cvs as cvs_v2
from app.routes.v2 import interviews as interviews_v2

from app.core import db
from app.core.config import get_settings
import logging

logger = logging.getLogger('uvicorn.error')

app_name = get_settings().APP_NAME
app_version = get_settings().APP_VERSION

@asynccontextmanager
async def lifespan(app: FastAPI):


    db.Base.metadata.create_all(bind=db.engine)
    app.state.db_client = db.get_db()

    logger.info("Connected to database")

    yield

    

app = FastAPI(
    title=app_name,
    description="MVP for AI-powered interview preparation and evaluation",
    version=app_version,
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles Pydantic's RequestValidationError.

    This function intercepts 422 Unprocessable Entity errors and formats them
    into a more user-friendly, simplified JSON response.
    """
    # Create a simplified list of error messages
    simplified_errors = []
    for error in exc.errors():
        field_name = " -> ".join(map(str, error["loc"]))
        message = error["msg"]
        simplified_errors.append(f"Error in field '{field_name}': {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Invalid input provided. Please check the errors.",
            "errors": simplified_errors,
        },
    )
# --- Include V1 Routers ---
app.include_router(base_v1.base_router, prefix="/api/v1")
app.include_router(users_v1.users_router, prefix="/api/v1")
app.include_router(cvs_v1.cvs_router, prefix="/api/v1")
app.include_router(interviews_v1.interviews_router, prefix="/api/v1")

# --- Include V2 Routers ---
app.include_router(base_v2.base_router, prefix="/api/v2")
app.include_router(users_v2.users_router, prefix="/api/v2")
app.include_router(cvs_v2.cvs_router, prefix="/api/v2")
app.include_router(interviews_v2.interviews_router, prefix="/api/v2")