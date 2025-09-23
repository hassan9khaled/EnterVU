from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routes import base, users, cvs
from backend.app.core import db
import logging

logger = logging.getLogger('uvicorn.error')



@asynccontextmanager
async def lifespan(app: FastAPI):


    db.Base.metadata.create_all(bind=db.engine)
    app.state.db_client = db.get_db()

    logger.info("Connected to database")

    yield

    

app = FastAPI(
    title="AI Interview System",
    description="MVP for AI-powered interview preparation and evaluation",
    version="0.1",
    lifespan=lifespan
)

app.include_router(base.base_router)
app.include_router(users.users_router)
app.include_router(cvs.cvs_router)
