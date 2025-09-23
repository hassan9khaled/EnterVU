from pydantic import BaseModel
from datetime import datetime

class CvCreate(BaseModel):
    user_id: int
    raw_text: str

class CvOut(BaseModel):
    id: int
    user_id: int
    raw_text: str
    file_path: str | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
