from pydantic import BaseModel  

class ReportOut(BaseModel):
    id: int
    content: str

    class Config:
        from_attributes = True