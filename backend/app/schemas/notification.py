from pydantic import BaseModel
from typing import Optional

class NotificationCreate(BaseModel):
    user_id: str
    message: str
    type: Optional[str] = "info"  # info, success, warning, update

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    message: str
    status: str  # unread, read
    type: str = "info"
    created_at: str
