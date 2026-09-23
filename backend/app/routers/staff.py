from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.staff import CollectionStaffCreate, CollectionStaffUpdate, CollectionStaffResponse
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/api/staff", tags=["Collection Staff"])

async def enrich_staff(s: dict, db) -> dict:
    staff_id = str(s["_id"])
    center_id = s.get("center_id")
    center = await db["recycling_centers"].find_one({"_id": str(center_id)}) if center_id else None
    
    active_pickups = await db["pickup_requests"].count_documents({
        "assigned_staff_id": staff_id,
        "status": {"$in": ["Assigned", "Collected"]}
    })

    return {
        "id": staff_id,
        "name": s.get("name", ""),
        "center_id": str(center_id) if center_id else "",
        "center_name": center.get("name", "") if center else "Unassigned Center",
        "phone": s.get("phone", ""),
        "email": s.get("email", ""),
        "availability_status": s.get("availability_status", "Available"),
        "active_pickups_count": active_pickups,
        "created_at": s.get("created_at", "")
    }

@router.get("", response_model=List[CollectionStaffResponse])
async def list_staff(
    center_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    query = {}
    if center_id:
        query["center_id"] = str(center_id)

    cursor = db["collection_staff"].find(query).sort("created_at", -1)
    staffs = await cursor.to_list(length=100)
    
    res = []
    for s in staffs:
        res.append(await enrich_staff(s, db))
    return res

@router.post("", response_model=CollectionStaffResponse)
async def create_staff(
    staff_in: CollectionStaffCreate,
    current_user: dict = Depends(require_roles(["Admin", "Recycling Center"]))
):
    db = get_db()
    staff_id = str(ObjectId())
    now = datetime.now(timezone.utc).isoformat()

    center = await db["recycling_centers"].find_one({"_id": str(staff_in.center_id)})
    if not center:
        raise HTTPException(status_code=404, detail="Recycling center not found")

    doc = {
        "_id": staff_id,
        "name": staff_in.name,
        "center_id": str(staff_in.center_id),
        "phone": staff_in.phone,
        "email": staff_in.email or f"{staff_in.name.lower().replace(' ', '.')}@ewaste.com",
        "availability_status": staff_in.availability_status or "Available",
        "created_at": now
    }

    await db["collection_staff"].insert_one(doc)
    return await enrich_staff(doc, db)

@router.put("/{staff_id}", response_model=CollectionStaffResponse)
async def update_staff(
    staff_id: str,
    staff_in: CollectionStaffUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    s = await db["collection_staff"].find_one({"_id": str(staff_id)})
    if not s:
        raise HTTPException(status_code=404, detail="Collection staff not found")

    updates = {k: v for k, v in staff_in.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        await db["collection_staff"].update_one({"_id": str(staff_id)}, {"$set": updates})

    updated_s = await db["collection_staff"].find_one({"_id": str(staff_id)})
    return await enrich_staff(updated_s, db)

@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: str,
    current_user: dict = Depends(require_roles(["Admin", "Recycling Center"]))
):
    db = get_db()
    s = await db["collection_staff"].find_one({"_id": str(staff_id)})
    if not s:
        raise HTTPException(status_code=404, detail="Collection staff not found")

    await db["collection_staff"].delete_one({"_id": str(staff_id)})
    return {"message": "Collection staff deleted successfully"}
