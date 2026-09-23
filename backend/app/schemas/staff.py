from pydantic import BaseModel, Field
from typing import Optional

class CollectionStaffCreate(BaseModel):
    name: str = Field(..., min_length=2, example="Alex Rivera")
    center_id: str = Field(..., example="center_id_here")
    phone: str = Field(..., example="+1 555 0192")
    email: Optional[str] = None
    availability_status: str = Field(default="Available")  # Available, Busy, On Leave

class CollectionStaffUpdate(BaseModel):
    name: Optional[str] = None
    center_id: Optional[str] = None
    phone: Optional[str] = None
    availability_status: Optional[str] = None

class CollectionStaffResponse(BaseModel):
    id: str
    name: str
    center_id: str
    center_name: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    availability_status: str
    active_pickups_count: int = 0
    created_at: str
