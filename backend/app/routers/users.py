from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])

class UpdateRoleSchema(BaseModel):
    role: str

@router.get("", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(require_roles(["Admin"]))):
    db = get_db()
    users_cursor = db["users"].find().sort("created_at", -1)
    users = await users_cursor.to_list(length=200)
    
    res = []
    for u in users:
        res.append({
            "id": str(u["_id"]),
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role", "User"),
            "address": u.get("address", ""),
            "phone": u.get("phone", ""),
            "created_at": u.get("created_at", "")
        })
    return res

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str, 
    role_in: UpdateRoleSchema,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    db = get_db()
    valid_roles = ["User", "Admin", "Recycling Center", "Collection Staff"]
    if role_in.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    result = await db["users"].update_one(
        {"_id": str(user_id)},
        {"$set": {"role": role_in.role}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully", "user_id": user_id, "role": role_in.role}
