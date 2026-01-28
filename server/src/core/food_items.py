# File: server/src/core/food_items.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from typing import List, Optional
from pydantic import BaseModel
import os

# Create router
router = APIRouter(prefix="/food-items", tags=["Food Items"])

# Database connection function
def get_db():
    # Your Neon connection string
    engine = create_engine(
        "postgresql://neondb_owner:npg_08iLdYRcmoJn@ep-odd-frost-adkvf0ln-pooler.c-2.us-east-1.aws.neon.tech/smart_fridge_app?sslmode=require&channel_binding=require"
    )
    return engine

# Pydantic models
class FoodItem(BaseModel):
    id: int
    name: str
    quantity: Optional[int] = None
    category: Optional[str] = None
    expiration_date: Optional[str] = None

# Routes
@router.get("/", response_model=List[FoodItem])
async def get_food_items(
    category: Optional[str] = None,
    search: Optional[str] = None
):
    engine = get_db()
    
    with engine.connect() as conn:
        query = "SELECT * FROM food_item WHERE 1=1"
        params = {}
        
        if category:
            query += " AND category = :category"
            params['category'] = category
        
        if search:
            query += " AND name ILIKE :search"
            params['search'] = f"%{search}%"
        
        query += " ORDER BY id"
        
        result = conn.execute(text(query), params)
        return [dict(row._mapping) for row in result]

@router.get("/{item_id}", response_model=FoodItem)
async def get_food_item(item_id: int):
    engine = get_db()
    
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM food_item WHERE id = :id"),
            {"id": item_id}
        )
        item = result.fetchone()
        
        if not item:
            raise HTTPException(status_code=404, detail="Food item not found")
        
        return dict(item._mapping)

# For testing purposes
if __name__ == "__main__":
    # Quick test without FastAPI
    engine = get_db()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM food_item"))
        count = result.fetchone()[0]
        print(f"Connected! Food items in database: {count}")
        
        # Show first few items
        result = conn.execute(text("SELECT * FROM food_item LIMIT 3"))
        for row in result:
            print(dict(row._mapping))