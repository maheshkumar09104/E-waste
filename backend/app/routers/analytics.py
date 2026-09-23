from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.core.deps import require_roles

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
async def get_analytics(current_user: dict = Depends(require_roles(["Admin"]))):
    """System-wide analytics summary for the Admin dashboard."""
    db = get_db()

    # Status breakdown
    all_pickups_cursor = db["pickup_requests"].find()
    all_pickups = await all_pickups_cursor.to_list(length=1000)

    status_counts = {}
    for p in all_pickups:
        s = p.get("status", "Unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    # Totals
    total_pickups = len(all_pickups)
    total_recycled = status_counts.get("Recycled", 0)
    total_in_progress = sum(
        status_counts.get(s, 0)
        for s in ["Pending", "Verified", "Assigned", "Collected", "Delivered"]
    )

    # Center stats
    centers_cursor = db["recycling_centers"].find()
    centers = await centers_cursor.to_list(length=100)
    total_centers = len(centers)

    # Users
    users_cursor = db["users"].find()
    users = await users_cursor.to_list(length=1000)
    total_users = len(users)
    citizen_users = sum(1 for u in users if u.get("role") == "User")

    # CO2 saved estimate (12.5 kg per recycled item × avg quantity)
    recycled_pickups = [p for p in all_pickups if p.get("status") == "Recycled"]
    total_items_recycled = sum(p.get("quantity", 1) for p in recycled_pickups)
    co2_saved_kg = total_items_recycled * 12.5

    # Per-center breakdown
    center_stats = []
    for c in centers:
        center_id = str(c["_id"])
        center_pickups = [p for p in all_pickups if p.get("assigned_center_id") == center_id]
        center_stats.append({
            "id": center_id,
            "name": c.get("name", ""),
            "total_assigned": len(center_pickups),
            "recycled": sum(1 for p in center_pickups if p.get("status") == "Recycled"),
            "in_progress": sum(1 for p in center_pickups if p.get("status") not in ("Recycled", "Pending")),
            "capacity": c.get("capacity", 0),
        })

    return {
        "total_pickups": total_pickups,
        "total_recycled": total_recycled,
        "total_in_progress": total_in_progress,
        "total_centers": total_centers,
        "total_users": total_users,
        "citizen_users": citizen_users,
        "co2_saved_kg": round(co2_saved_kg, 1),
        "total_items_recycled": total_items_recycled,
        "status_breakdown": status_counts,
        "center_stats": center_stats,
    }
