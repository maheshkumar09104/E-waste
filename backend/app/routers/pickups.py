from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.pickup import (
    PickupCreate, PickupUpdateStatus, PickupAssignCenter, 
    PickupAssignStaff, PickupResponse, GeoLocation
)
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.services.notification_service import notify_status_change
from app.services.geo import find_nearest_center

router = APIRouter(prefix="/api/pickups", tags=["Pickup Requests"])

def build_id_query(item_id: str) -> dict:
    if ObjectId.is_valid(item_id):
        return {"$or": [{"_id": str(item_id)}, {"_id": ObjectId(item_id)}]}
    return {"_id": str(item_id)}

async def enrich_pickup(p: dict, db) -> dict:
    user_id = p.get("user_id")
    user = await db["users"].find_one(build_id_query(user_id)) if user_id else None
    
    center_id = p.get("assigned_center_id")
    center = await db["recycling_centers"].find_one(build_id_query(center_id)) if center_id else None

    staff_id = p.get("assigned_staff_id")
    staff = await db["collection_staff"].find_one(build_id_query(staff_id)) if staff_id else None
    if not staff and staff_id:
        staff = await db["collection_staff"].find_one({"email": staff_id})

    geo = p.get("geo_location") or {}
    geo_loc = GeoLocation(lat=geo.get("lat", 12.9716), lng=geo.get("lng", 77.5946))

    return {
        "id": str(p["_id"]),
        "user_id": str(p.get("user_id", "")),
        "user_name": user.get("name", "Unknown User") if user else "Unknown User",
        "user_email": user.get("email", "") if user else "",
        "user_phone": user.get("phone", "") if user else "",
        "item_type": p.get("item_type", ""),
        "quantity": p.get("quantity", 1),
        "address": p.get("address", ""),
        "preferred_date": p.get("preferred_date", ""),
        "geo_location": geo_loc,
        "photo_url": p.get("photo_url", ""),
        "notes": p.get("notes", ""),
        "status": p.get("status", "Pending"),
        "assigned_center_id": str(center_id) if center_id else None,
        "assigned_center_name": center.get("name", "") if center else None,
        "assigned_staff_id": str(staff_id) if staff_id else None,
        "assigned_staff_name": staff.get("name", "") if staff else None,
        "created_at": p.get("created_at", ""),
        "updated_at": p.get("updated_at", "")
    }

@router.post("", response_model=PickupResponse)
async def create_pickup_request(
    pickup_in: PickupCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    pickup_id = str(ObjectId())
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "_id": pickup_id,
        "user_id": str(current_user["_id"]),
        "item_type": pickup_in.item_type,
        "quantity": pickup_in.quantity,
        "address": pickup_in.address,
        "preferred_date": pickup_in.preferred_date,
        "geo_location": pickup_in.geo_location.model_dump() if pickup_in.geo_location else {"lat": 12.9716, "lng": 77.5946},
        "photo_url": pickup_in.photo_url or "",
        "notes": pickup_in.notes or "",
        "status": "Pending",
        "assigned_center_id": None,
        "assigned_staff_id": None,
        "created_at": now,
        "updated_at": now
    }

    await db["pickup_requests"].insert_one(doc)
    
    # Notify User
    await notify_status_change(str(current_user["_id"]), pickup_in.item_type, "Submitted")
    
    return await enrich_pickup(doc, db)

@router.get("", response_model=List[PickupResponse])
async def list_pickup_requests(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    role = current_user.get("role", "User")
    user_id = str(current_user["_id"])

    query = {}
    if status:
        query["status"] = status

    if role == "User":
        query["user_id"] = user_id
    elif role == "Recycling Center":
        # Find center linked to this user email or center_id
        center = await db["recycling_centers"].find_one({"contact_email": current_user["email"].lower()})
        if not center:
            centers = await db["recycling_centers"].find().to_list(10)
            if centers:
                center = centers[0]
        if center:
            query["assigned_center_id"] = str(center["_id"])
    elif role == "Collection Staff":
        staff = await db["collection_staff"].find_one({
            "$or": [
                {"email": current_user["email"].lower()},
                {"_id": str(current_user["_id"])}
            ]
        })
        matching_ids = [str(current_user["_id"])]
        if staff:
            matching_ids.append(str(staff["_id"]))
            if staff.get("email"):
                matching_ids.append(staff["email"])
        query["$or"] = [
            {"assigned_staff_id": {"$in": matching_ids}},
            {"assigned_staff_name": current_user.get("name", "")}
        ]

    cursor = db["pickup_requests"].find(query).sort("created_at", -1)
    items = await cursor.to_list(length=300)

    res = []
    for item in items:
        res.append(await enrich_pickup(item, db))
    return res

@router.get("/{pickup_id}", response_model=PickupResponse)
async def get_pickup_detail(
    pickup_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    return await enrich_pickup(p, db)

@router.put("/{pickup_id}/verify", response_model=PickupResponse)
async def verify_pickup_request(
    pickup_id: str,
    auto_assign: bool = Query(True),
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "status": "Verified",
        "updated_at": now
    }

    # Auto assign to nearest center if enabled
    assigned_center_name = ""
    if auto_assign:
        centers_cursor = db["recycling_centers"].find()
        centers = await centers_cursor.to_list(100)
        geo = p.get("geo_location") or {"lat": 12.9716, "lng": 77.5946}
        nearest = find_nearest_center(geo.get("lat", 12.9716), geo.get("lng", 77.5946), centers)
        if nearest:
            update_data["assigned_center_id"] = str(nearest["_id"])
            update_data["status"] = "Assigned"
            assigned_center_name = nearest.get("name", "")

    await db["pickup_requests"].update_one({"_id": str(pickup_id)}, {"$set": update_data})
    
    # Notify user
    status_msg = "Assigned" if update_data["status"] == "Assigned" else "Verified"
    await notify_status_change(
        user_id=p["user_id"],
        item_type=p["item_type"],
        status=status_msg,
        extra_data={"center_name": assigned_center_name}
    )

    updated_p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    return await enrich_pickup(updated_p, db)

@router.put("/{pickup_id}/assign-center", response_model=PickupResponse)
async def assign_center(
    pickup_id: str,
    payload: PickupAssignCenter,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    center = await db["recycling_centers"].find_one({"_id": str(payload.center_id)})
    if not center:
        raise HTTPException(status_code=404, detail="Recycling center not found")

    now = datetime.now(timezone.utc).isoformat()
    await db["pickup_requests"].update_one(
        {"_id": str(pickup_id)},
        {"$set": {
            "assigned_center_id": str(payload.center_id),
            "status": "Assigned",
            "updated_at": now
        }}
    )

    await notify_status_change(
        user_id=p["user_id"],
        item_type=p["item_type"],
        status="Assigned",
        extra_data={"center_name": center["name"]}
    )

    updated_p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    return await enrich_pickup(updated_p, db)

@router.put("/{pickup_id}/assign-staff", response_model=PickupResponse)
async def assign_staff(
    pickup_id: str,
    payload: PickupAssignStaff,
    current_user: dict = Depends(require_roles(["Admin", "Recycling Center"]))
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    staff = await db["collection_staff"].find_one({"_id": str(payload.staff_id)})
    if not staff:
        raise HTTPException(status_code=404, detail="Collection staff not found")

    now = datetime.now(timezone.utc).isoformat()
    await db["pickup_requests"].update_one(
        {"_id": str(pickup_id)},
        {"$set": {
            "assigned_staff_id": str(payload.staff_id),
            "updated_at": now
        }}
    )

    await notify_status_change(
        user_id=p["user_id"],
        item_type=p["item_type"],
        status="StaffAssigned",
        extra_data={"staff_name": staff["name"]}
    )

    updated_p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    return await enrich_pickup(updated_p, db)

@router.put("/{pickup_id}/status", response_model=PickupResponse)
async def update_pickup_status(
    pickup_id: str,
    status_in: PickupUpdateStatus,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    new_status = status_in.status
    now = datetime.now(timezone.utc).isoformat()

    await db["pickup_requests"].update_one(
        {"_id": str(pickup_id)},
        {"$set": {
            "status": new_status,
            "updated_at": now
        }}
    )

    # Notify User
    await notify_status_change(
        user_id=p["user_id"],
        item_type=p["item_type"],
        status=new_status,
        extra_data={"reason": status_in.rejection_reason or "N/A"}
    )

    updated_p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    return await enrich_pickup(updated_p, db)

@router.delete("/{pickup_id}")
async def delete_pickup_request(
    pickup_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    p = await db["pickup_requests"].find_one({"_id": str(pickup_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    # Authorization check
    if current_user["role"] == "User" and str(p["user_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Cannot delete other users' pickup requests")

    await db["pickup_requests"].delete_one({"_id": str(pickup_id)})
    return {"message": "Pickup request deleted successfully"}
