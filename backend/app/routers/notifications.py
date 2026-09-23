from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.notification import NotificationResponse
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def get_user_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1)
    notifs = await cursor.to_list(length=100)

    res = []
    for n in notifs:
        res.append({
            "id": str(n["_id"]),
            "user_id": str(n.get("user_id", "")),
            "message": n.get("message", ""),
            "status": n.get("status", "unread"),
            "type": n.get("type", "info"),
            "created_at": n.get("created_at", "")
        })
    return res

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    result = await db["notifications"].update_one(
        {"_id": str(notification_id), "user_id": str(current_user["_id"])},
        {"$set": {"status": "read"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    # Use update_many to mark ALL unread notifications, not just one
    await db["notifications"].update_many(
        {"user_id": str(current_user["_id"]), "status": "unread"},
        {"$set": {"status": "read"}}
    )
    return {"message": "All notifications marked as read"}
