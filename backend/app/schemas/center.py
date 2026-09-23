from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.pickup import GeoLocation

class RecyclingCenterCreate(BaseModel):
    name: str = Field(..., min_length=2, example="EcoRecycle Hub Central")
    location: str = Field(..., min_length=3, example="45 Industrial Zone, Tech District")
    geo_location: GeoLocation = Field(..., example={"lat": 12.9716, "lng": 77.5946})
    contact: str = Field(..., example="+1 800 555 EWASTE")
    capacity: int = Field(..., gt=0, example=5000)

class RecyclingCenterUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    geo_location: Optional[GeoLocation] = None
    contact: Optional[str] = None
    capacity: Optional[int] = None

class RecyclingCenterResponse(BaseModel):
    id: str
    name: str
    location: str
    geo_location: GeoLocation
    contact: str
    capacity: int
    current_occupancy: int = 0
    staff_count: int = 0
    created_at: str
