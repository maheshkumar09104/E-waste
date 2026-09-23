from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister):
    db = get_db()
    existing = await db["users"].find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_id = str(ObjectId())
    now = datetime.now(timezone.utc).isoformat()
    
    # Valid roles check
    valid_roles = ["User", "Admin", "Recycling Center", "Collection Staff"]
    role = user_in.role if user_in.role in valid_roles else "User"

    user_doc = {
        "_id": user_id,
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "role": role,
        "address": user_in.address or "",
        "phone": user_in.phone or "",
        "created_at": now
    }
    
    await db["users"].insert_one(user_doc)

    access_token = create_access_token(data={"sub": user_id, "role": role, "email": user_in.email.lower()})
    
    user_resp = {
        "id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "address": user_doc["address"],
        "phone": user_doc["phone"],
        "created_at": user_doc["created_at"]
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_resp}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id, "role": user["role"], "email": user["email"]})
    
    user_resp = {
        "id": user_id,
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "address": user.get("address", ""),
        "phone": user.get("phone", ""),
        "created_at": user.get("created_at", "")
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_resp}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "address": current_user.get("address", ""),
        "phone": current_user.get("phone", ""),
        "created_at": current_user.get("created_at", "")
    }
