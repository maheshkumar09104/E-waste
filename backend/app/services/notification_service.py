from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db

STATUS_MESSAGES = {
    "Verified": "Your pickup request for {item_type} has been VERIFIED by admin and is queued for center assignment.",
    "Assigned": "Your pickup request for {item_type} has been ASSIGNED to {center_name}.",
    "StaffAssigned": "Collection staff member {staff_name} has been assigned to pick up your {item_type}.",
    "Collected": "Collection staff has COLLECTED your {item_type}! It is currently in transit.",
    "Delivered": "Your e-waste ({item_type}) has been DELIVERED safely to the recycling center.",
    "Recycled": "🎉 Congratulations! Your {item_type} has been RECYCLED sustainably. Thank you for protecting our environment!",
    "Rejected": "Your pickup request for {item_type} was rejected. Reason: {reason}"
}

async def send_notification(user_id: str, message: str, n_type: str = "info"):
    db = get_db()
    notif_doc = {
        "_id": str(ObjectId()),
        "user_id": str(user_id),
        "message": message,
        "status": "unread",
        "type": n_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db["notifications"].insert_one(notif_doc)
    return notif_doc

async def notify_status_change(user_id: str, item_type: str, status: str, extra_data: dict = None):
    extra_data = extra_data or {}
    template = STATUS_MESSAGES.get(status, f"Your pickup request status changed to: {status}")
    
    msg = template.format(
        item_type=item_type,
        center_name=extra_data.get("center_name", "a Recycling Center"),
        staff_name=extra_data.get("staff_name", "Collection Staff"),
        reason=extra_data.get("reason", "N/A")
    )
    
    n_type = "success" if status in ["Recycled", "Delivered"] else ("warning" if status == "Rejected" else "info")
    await send_notification(user_id, msg, n_type)
