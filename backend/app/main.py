from fastapi import FastAPI
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