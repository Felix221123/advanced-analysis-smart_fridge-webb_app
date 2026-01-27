# File: server/src/module/views.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from . import schemas
from src.core import user
from typing import List, Optional
from sqlalchemy import text

# Router definition
router = APIRouter(prefix="/users", tags=["Users"])

# ---------- Your existing routes ----------
@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.post("/create", response_model=schemas.UserRead)
def create_user_endpoint(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return user.create_user(db, payload)

@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    return user.login_user(db, payload.email, payload.password)

# ---------- UPDATED: Get ALL Food Items with Supplier Names ----------
@router.get("/food-items")
def get_all_food_items(db: Session = Depends(get_db)):
    """
    Get ALL food items from the database WITH supplier names
    - Returns: All food items ordered by name with supplier info
    - Usage: GET /users/food-items
    """
    # Use SQL JOIN to get supplier name
    result = db.execute(text("""
        SELECT 
            fi.id,
            fi.name,
            fi.restaurant_id,
            fi.unit,
            fi.pack_size,
            fi.shelf_life_days,
            fi.reorder_point,
            fi.reorder_qty,
            fi.default_supplier_id,
            s.name as supplier_name,
            s.email as supplier_email,
            s.phone as supplier_phone
        FROM food_item fi
        LEFT JOIN supplier s ON fi.default_supplier_id = s.id
        ORDER BY fi.name
    """))
    
    items = []
    for row in result:
        item = dict(row._mapping)
        # Convert for JSON
        item['id'] = str(item['id'])
        if 'default_supplier_id' in item and item['default_supplier_id']:
            item['default_supplier_id'] = str(item['default_supplier_id'])
        
        if 'pack_size' in item:
            item['pack_size'] = float(item['pack_size'])
        
        # Add supplier info
        item['supplier'] = {
            'name': item.get('supplier_name'),
            'email': item.get('supplier_email'),
            'phone': item.get('supplier_phone')
        }
        
        # Remove duplicate fields
        item.pop('supplier_name', None)
        item.pop('supplier_email', None)
        item.pop('supplier_phone', None)
        
        items.append(item)
    
    return {
        "total": len(items),
        "items": items
    }
