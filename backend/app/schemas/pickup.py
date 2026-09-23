from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class GeoLocation(BaseModel):
    lat: float
    lng: float

class PickupCreate(BaseModel):
    item_type: str = Field(..., min_length=2, example="Laptops, Phones, Batteries")
    quantity: int = Field(..., gt=0, example=2)
    address: str = Field(..., min_length=5, example="124 Green Tech Street, Eco City")
    preferred_date: str = Field(..., example="2026-09-25")
    geo_location: Optional[GeoLocation] = Field(default_factory=lambda: GeoLocation(lat=12.9716, lng=77.5946))
    photo_url: Optional[str] = ""
    notes: Optional[str] = ""

class PickupUpdateStatus(BaseModel):
    status: str = Field(..., example="Verified")  # Pending, Verified, Assigned, Collected, Delivered, Recycled, Rejected
    rejection_reason: Optional[str] = None

class PickupAssignCenter(BaseModel):
    center_id: str

class PickupAssignStaff(BaseModel):
    staff_id: str

class PickupResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = ""
    user_email: Optional[str] = ""
    user_phone: Optional[str] = ""
    item_type: str
    quantity: int
    address: str
    preferred_date: str
    geo_location: Optional[GeoLocation] = None
    photo_url: Optional[str] = ""
    notes: Optional[str] = ""
    status: str  # Pending, Verified, Assigned, Collected, Delivered, Recycled
    assigned_center_id: Optional[str] = None
    assigned_center_name: Optional[str] = None
    assigned_staff_id: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    created_at: str
    updated_at: str
