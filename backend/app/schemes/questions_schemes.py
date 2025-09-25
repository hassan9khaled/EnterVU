from pydantic import BaseModel  


class QuestionOut(BaseModel):
    id: int
    text: str
    order: int

    class Config:
        from_attributes = True