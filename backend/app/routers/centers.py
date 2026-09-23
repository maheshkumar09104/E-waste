from datetime import datetime, timezone
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.center import RecyclingCenterCreate, RecyclingCenterUpdate, RecyclingCenterResponse
from app.schemas.pickup import GeoLocation
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.services.geo import find_nearest_center

router = APIRouter(prefix="/api/centers", tags=["Recycling Centers"])

async def enrich_center(c: dict, db) -> dict:
    center_id = str(c["_id"])
    staff_count = await db["collection_staff"].count_documents({"center_id": center_id})
    active_pickups = await db["pickup_requests"].count_documents({
        "assigned_center_id": center_id,
        "status": {"$in": ["Assigned", "Collected", "Delivered"]}
    })
    geo = c.get("geo_location") or {}
    geo_loc = GeoLocation(lat=geo.get("lat", 12.9716), lng=geo.get("lng", 77.5946))
    
    return {
        "id": center_id,
        "name": c.get("name", ""),
        "location": c.get("location", ""),
        "geo_location": geo_loc,
        "contact": c.get("contact", ""),
        "capacity": c.get("capacity", 1000),
        "current_occupancy": active_pickups,
        "staff_count": staff_count,
        "created_at": c.get("created_at", "")
    }

@router.get("", response_model=List[RecyclingCenterResponse])
async def list_centers(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db["recycling_centers"].find().sort("created_at", -1)
    centers = await cursor.to_list(length=100)
    res = []
    for c in centers:
        res.append(await enrich_center(c, db))
    return res

@router.post("", response_model=RecyclingCenterResponse)
async def create_center(
    center_in: RecyclingCenterCreate,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    center_id = str(ObjectId())
    now = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "_id": center_id,
        "name": center_in.name,
        "location": center_in.location,
        "geo_location": center_in.geo_location.model_dump(),
        "contact": center_in.contact,
        "capacity": center_in.capacity,
        "created_at": now
    }

    await db["recycling_centers"].insert_one(doc)
    return await enrich_center(doc, db)

@router.put("/{center_id}", response_model=RecyclingCenterResponse)
async def update_center(
    center_id: str,
    center_in: RecyclingCenterUpdate,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    c = await db["recycling_centers"].find_one({"_id": str(center_id)})
    if not c:
        raise HTTPException(status_code=404, detail="Recycling center not found")

    updates = {k: v for k, v in center_in.model_dump(exclude_unset=True).items() if v is not None}
    if "geo_location" in updates and isinstance(updates["geo_location"], dict):
        pass  # already dict

    if updates:
        await db["recycling_centers"].update_one({"_id": str(center_id)}, {"$set": updates})

    updated_c = await db["recycling_centers"].find_one({"_id": str(center_id)})
    return await enrich_center(updated_c, db)

@router.delete("/{center_id}")
async def delete_center(
    center_id: str,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    c = await db["recycling_centers"].find_one({"_id": str(center_id)})
    if not c:
        raise HTTPException(status_code=404, detail="Recycling center not found")

    await db["recycling_centers"].delete_one({"_id": str(center_id)})
    return {"message": "Recycling center deleted successfully"}

@router.post("/nearest")
async def get_nearest_center(
    geo: GeoLocation,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    cursor = db["recycling_centers"].find()
    centers = await cursor.to_list(100)
    nearest = find_nearest_center(geo.lat, geo.lng, centers)
    if not nearest:
        raise HTTPException(status_code=404, detail="No recycling centers available")
    return nearest
