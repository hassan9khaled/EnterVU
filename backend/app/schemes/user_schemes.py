from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    """Schema for updating a user. All fields are optional."""
    email: Optional[EmailStr] = None
    name: Optional[str] = None