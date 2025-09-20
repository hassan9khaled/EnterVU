from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    name: str | None = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True