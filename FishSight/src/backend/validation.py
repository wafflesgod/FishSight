# backend/models.py
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr