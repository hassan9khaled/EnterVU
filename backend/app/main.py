from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app import db
from app.models import user as user_model
from app.schemas import UserCreate, UserOut

db.Base.metadata.create_all(bind=db.engine)


# Initialize FastAPI app
app = FastAPI(
    title="AI Interview System",
    description="MVP for AI-powered interview preparation and evaluation",
    version="0.1.0"
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the AI Interview System API"}

# User endpoint
@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate, database: Session = Depends(db.get_db)):
    db_user = user_model.User(email=user.email, name=user.name)
    database.add(db_user)
    database.commit()
    database.refresh(db_user)
    return db_user
