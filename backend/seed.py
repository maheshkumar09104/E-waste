import asyncio
import logging
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db, connect_to_mongo
from app.core.security import hash_password

logger = logging.getLogger("uvicorn")

async def seed_data():
    db = get_db()
    
    # 1. Seed or update demo users so they are always guaranteed to exist with known credentials
    logger.info("Verifying demo accounts...")
    now = datetime.now(timezone.utc).isoformat()
    users_to_insert = [
        {
            "_id": "usr_admin_001",
            "name": "System Administrator",
            "email": "admin@ewaste.com",
            "password_hash": hash_password("admin123"),
            "role": "Admin",
            "address": "Eco HQ, Tech Park Block B",
            "phone": "+1 800 999 0001",
            "created_at": now
        },
        {
            "_id": "usr_citizen_001",
            "name": "John Doe",
            "email": "user@ewaste.com",
            "password_hash": hash_password("user123"),
            "role": "User",
            "address": "742 Evergreen Terrace, Sector 4",
            "phone": "+1 555 019 2831",
            "created_at": now
        },
        {
            "_id": "usr_center_001",
            "name": "EcoHub Manager",
            "email": "center@ewaste.com",
            "password_hash": hash_password("center123"),
            "role": "Recycling Center",
            "address": "45 Industrial Zone, Tech District",
            "phone": "+1 800 555 3927",
            "created_at": now
        },
        {
            "_id": "usr_staff_001",
            "name": "Robert Miller",
            "email": "staff@ewaste.com",
            "password_hash": hash_password("staff123"),
            "role": "Collection Staff",
            "address": "21 Logistics Hub Road",
            "phone": "+1 555 992 4810",
            "created_at": now
        }
    ]
    
    for u in users_to_insert:
        existing = await db["users"].find_one({"email": u["email"]})
        if not existing:
            await db["users"].insert_one(u)
        else:
            await db["users"].update_one(
                {"email": u["email"]},
                {"$set": {"password_hash": u["password_hash"], "role": u["role"]}}
            )
    logger.info("Demo accounts verified and updated successfully.")

    # 2. Seed Recycling Centers
    existing_centers = await db["recycling_centers"].count_documents({})
    if existing_centers == 0:
        logger.info("Seeding initial recycling centers...")
        now = datetime.now(timezone.utc).isoformat()
        
        centers = [
            {
                "_id": "center_001",
                "name": "EcoRecycle Hub Central",
                "location": "45 Industrial Zone, Tech District",
                "geo_location": {"lat": 12.9716, "lng": 77.5946},
                "contact": "+1 800 555 EWASTE",
                "contact_email": "center@ewaste.com",
                "capacity": 5000,
                "created_at": now
            },
            {
                "_id": "center_002",
                "name": "GreenTech E-Waste Processing Plant",
                "location": "88 Clean Tech Boulevard, Koramangala",
                "geo_location": {"lat": 12.9352, "lng": 77.6245},
                "contact": "+1 800 888 GREEN",
                "contact_email": "greentech@ewaste.com",
                "capacity": 8000,
                "created_at": now
            }
        ]
        for c in centers:
            await db["recycling_centers"].insert_one(c)
        logger.info("Recycling centers seeded.")

    # 3. Seed Collection Staff
    existing_staff = await db["collection_staff"].count_documents({})
    if existing_staff == 0:
        logger.info("Seeding collection staff...")
        now = datetime.now(timezone.utc).isoformat()
        
        staff_members = [
            {
                "_id": "staff_001",
                "name": "Robert Miller",
                "center_id": "center_001",
                "phone": "+1 555 992 4810",
                "email": "staff@ewaste.com",
                "availability_status": "Available",
                "created_at": now
            },
            {
                "_id": "staff_002",
                "name": "Sarah Connor",
                "center_id": "center_002",
                "phone": "+1 555 382 1092",
                "email": "sarah.connor@ewaste.com",
                "availability_status": "Available",
                "created_at": now
            }
        ]
        for s in staff_members:
            await db["collection_staff"].insert_one(s)
        logger.info("Collection staff seeded.")

    # 4. Seed Sample Pickup Requests
    existing_pickups = await db["pickup_requests"].count_documents({})
    if existing_pickups == 0:
        logger.info("Seeding sample pickup requests...")
        now = datetime.now(timezone.utc).isoformat()
        
        pickups = [
            {
                "_id": "p_001",
                "user_id": "usr_citizen_001",
                "item_type": "Old Laptops & Chargers (3 items)",
                "quantity": 3,
                "address": "742 Evergreen Terrace, Sector 4",
                "preferred_date": "2026-09-22",
                "geo_location": {"lat": 12.9750, "lng": 77.5990},
                "photo_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
                "notes": "Batteries included, handles with care.",
                "status": "Assigned",
                "assigned_center_id": "center_001",
                "assigned_staff_id": "staff_001",
                "created_at": now,
                "updated_at": now
            },
            {
                "_id": "p_002",
                "user_id": "usr_citizen_001",
                "item_type": "CRT Monitor & Desktop Tower",
                "quantity": 2,
                "address": "124 Innovation Avenue, Indiranagar",
                "preferred_date": "2026-09-24",
                "geo_location": {"lat": 12.9784, "lng": 77.6408},
                "photo_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
                "notes": "Heavy unit. Ground floor access.",
                "status": "Pending",
                "assigned_center_id": None,
                "assigned_staff_id": None,
                "created_at": now,
                "updated_at": now
            },
            {
                "_id": "p_003",
                "user_id": "usr_citizen_001",
                "item_type": "Used Smartphones & Lithium Batteries",
                "quantity": 5,
                "address": "55 Tech Residency, Koramangala",
                "preferred_date": "2026-09-20",
                "geo_location": {"lat": 12.9350, "lng": 77.6240},
                "photo_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
                "notes": "Batteries safely packaged.",
                "status": "Recycled",
                "assigned_center_id": "center_002",
                "assigned_staff_id": "staff_002",
                "created_at": now,
                "updated_at": now
            }
        ]
        for p in pickups:
            await db["pickup_requests"].insert_one(p)

        # Seed sample notifications
        notifs = [
            {
                "_id": "n_001",
                "user_id": "usr_citizen_001",
                "message": "Welcome to E-Waste Collection Platform! Submit your first pickup request anytime.",
                "status": "read",
                "type": "info",
                "created_at": now
            },
            {
                "_id": "n_002",
                "user_id": "usr_citizen_001",
                "message": "Your pickup request for Old Laptops & Chargers (3 items) has been ASSIGNED to EcoRecycle Hub Central.",
                "status": "unread",
                "type": "info",
                "created_at": now
            }
        ]
        for n in notifs:
            await db["notifications"].insert_one(n)
            
        logger.info("Sample pickup requests and notifications seeded.")

if __name__ == "__main__":
    asyncio.run(connect_to_mongo())
    asyncio.run(seed_data())
