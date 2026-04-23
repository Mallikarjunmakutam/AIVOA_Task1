from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InteractionBase(BaseModel):
    doctor_name: str
    hospital_name: str
    product_discussed: str
    meeting_notes: Optional[str] = None
    followup_date: Optional[str] = None
    status: Optional[str] = "Planned"
    sentiment: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(InteractionBase):
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    product_discussed: Optional[str] = None

class InteractionResponse(InteractionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI Chat Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatLogBase(BaseModel):
    user_message: str
    ai_response: str

class ChatLogCreate(ChatLogBase):
    pass

class ChatLogResponse(ChatLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
