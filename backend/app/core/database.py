import logging
import asyncio
from typing import Dict, List, Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class InMemoryCollection:
    """Fallback Async In-Memory MongoDB-like collection for zero-setup local dev/testing."""
    def __init__(self, name: str):
        self.name = name
        self.documents: Dict[str, Dict[str, Any]] = {}

    async def insert_one(self, doc: dict):
        d = doc.copy()
        if "_id" not in d or not d["_id"]:
            d["_id"] = str(ObjectId())
        elif isinstance(d["_id"], ObjectId):
            d["_id"] = str(d["_id"])
        self.documents[str(d["_id"])] = d
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(d["_id"])

    def _doc_matches(self, doc: dict, filter_dict: dict) -> bool:
        """Evaluate a filter dict against a document, supporting MongoDB operators."""
        for k, v in filter_dict.items():
            if k == "$or":
                # v is a list of sub-filters — at least one must match
                if not any(self._doc_matches(doc, sub) for sub in v):
                    return False
            elif k == "$and":
                if not all(self._doc_matches(doc, sub) for sub in v):
                    return False
            else:
                # Field-level value
                doc_val = doc.get(k)
                if k == "_id":
                    doc_val = str(doc_val)
                if isinstance(v, dict):
                    # Operator dict e.g. {"$in": [...], "$ne": ..., "$nin": [...]}
                    for op, operand in v.items():
                        if op == "$in":
                            str_operand = [str(x) for x in operand]
                            if doc_val not in operand and str(doc_val) not in str_operand:
                                return False
                        elif op == "$nin":
                            str_operand = [str(x) for x in operand]
                            if doc_val in operand or str(doc_val) in str_operand:
                                return False
                        elif op == "$ne":
                            if doc_val == operand or str(doc_val) == str(operand):
                                return False
                        elif op == "$gt":
                            if not (doc_val is not None and doc_val > operand):
                                return False
                        elif op == "$gte":
                            if not (doc_val is not None and doc_val >= operand):
                                return False
                        elif op == "$lt":
                            if not (doc_val is not None and doc_val < operand):
                                return False
                        elif op == "$lte":
                            if not (doc_val is not None and doc_val <= operand):
                                return False
                else:
                    # Exact match (handle _id string coercion)
                    if v is None:
                        if doc_val is not None:
                            return False
                    elif doc_val != v and str(doc_val) != str(v):
                        return False
        return True

    async def find_one(self, filter_dict: dict) -> Optional[dict]:
        for doc in self.documents.values():
            if self._doc_matches(doc, filter_dict):
                return doc.copy()
        return None

    def find(self, filter_dict: Optional[dict] = None):
        filter_dict = filter_dict or {}
        matched = [
            doc.copy()
            for doc in self.documents.values()
            if self._doc_matches(doc, filter_dict)
        ]

        class Cursor:
            def __init__(self, items):
                self.items = items
                self._sort_key = None
                self._sort_dir = 1

            def sort(self, key_or_list, direction=1):
                if isinstance(key_or_list, str):
                    self._sort_key = key_or_list
                    self._sort_dir = direction
                elif isinstance(key_or_list, list) and key_or_list:
                    self._sort_key = key_or_list[0][0]
                    self._sort_dir = key_or_list[0][1]
                
                if self._sort_key:
                    self.items.sort(
                        key=lambda x: x.get(self._sort_key, ""),
                        reverse=(self._sort_dir == -1)
                    )
                return self

            async def to_list(self, length=None):
                if length is not None:
                    return self.items[:length]
                return self.items

            def __aiter__(self):
                self._iter = iter(self.items)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return Cursor(matched)

    async def update_one(self, filter_dict: dict, update_dict: dict):
        target = await self.find_one(filter_dict)
        if not target:
            class UpdateResult:
                modified_count = 0
            return UpdateResult()
        
        doc_id = str(target["_id"])
        doc = self.documents[doc_id]
        if "$set" in update_dict:
            for k, v in update_dict["$set"].items():
                doc[k] = v
        
        class UpdateResult:
            modified_count = 1
        return UpdateResult()

    async def update_many(self, filter_dict: dict, update_dict: dict):
        """Update all documents matching the filter."""
        matched = [
            doc for doc in self.documents.values()
            if self._doc_matches(doc, filter_dict)
        ]
        count = 0
        for target in matched:
            doc_id = str(target["_id"])
            doc = self.documents[doc_id]
            if "$set" in update_dict:
                for k, v in update_dict["$set"].items():
                    doc[k] = v
            count += 1

        class UpdateResult:
            def __init__(self, n):
                self.modified_count = n
        return UpdateResult(count)

    async def delete_one(self, filter_dict: dict):
        target = await self.find_one(filter_dict)
        if target:
            doc_id = str(target["_id"])
            if doc_id in self.documents:
                del self.documents[doc_id]
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    async def count_documents(self, filter_dict: dict) -> int:
        return sum(
            1 for doc in self.documents.values()
            if self._doc_matches(doc, filter_dict)
        )

class InMemoryDB:
    """Fallback Async MongoDB Database."""
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def get_collection(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

    def __getitem__(self, name: str) -> InMemoryCollection:
        return self.get_collection(name)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None
    is_fallback: bool = False

db_manager = DatabaseManager()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=2000
        )
        # Verify ping
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        db_manager.is_fallback = False
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}'!")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB server ({e}). Activating high-performance Async In-Memory Database Fallback.")
        db_manager.client = None
        db_manager.db = InMemoryDB()
        db_manager.is_fallback = True

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    return db_manager.db
