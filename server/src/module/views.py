from fastapi import APIRouter, Depends, Query
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.core import food_items
from ..database import get_db
from . import schemas
from src.core import user, order_management, item_supply_order
from . import service as services
from uuid import UUID
from ..core.food_items import create_food_item_with_initial_stock
from .schemas import (FoodItemCreateWithInitialStockRequest, FoodItemUpdateRequest, 
    DoorAccessByUserRequest, ReorderCandidateRead,
    GenerateOrdersRequest,
    GenerateOrdersResponse,
    MarkOrderSentRequest,
    ReceiveOrderRequest,
    SupplyOrderRead
)
from ..module.models import DoorType, SupplyOrderStatus




# Router definition
router = APIRouter(prefix="/users", tags=["Users"])
service_router = APIRouter(prefix="/service", tags=["Food Product Api Services"])


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



@router.get("/all_users", response_model=list[schemas.UserOption])
def get_all_users(db: Session = Depends(get_db)):
    return services.list_users(db)


# endpoint to edit users details
@router.put("/edit/{user_id}", response_model=schemas.LoginResponse)
def edit_user(user_id: UUID, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    return user.update_user(db, user_id, data)


# endpoint to delete users details
@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
def remove_user(user_id: UUID, db: Session = Depends(get_db)):
    return user.delete_user(db, user_id)



# ---------- General Api Service Endpoint Route ----------
# api to retrieve all restaurants branches from the database
@service_router.get("/restaurants", response_model=list[schemas.RestaurantOption])
def get_restaurants(db: Session = Depends(get_db)):
    return services.list_restaurants(db)


# api to retrieve all food items in the database 
@service_router.get("/all_food_items", response_model=list[schemas.FoodItemInventoryRead])
def get_food_items(db: Session = Depends(get_db)):
    return food_items.list_all_products_inventory(db)


@service_router.post("/food_items", response_model=schemas.FoodItemInventoryRead, status_code=status.HTTP_201_CREATED)
def create_food_item(payload: FoodItemCreateWithInitialStockRequest, db: Session = Depends(get_db)):
    return create_food_item_with_initial_stock(db, payload)

@service_router.put("/food_items/{food_item_id}", response_model=schemas.FoodItemInventoryRead)
def edit_food_item(food_item_id: UUID, payload: FoodItemUpdateRequest, db: Session = Depends(get_db)):
    # force path id to win
    payload.food_item_id = food_item_id
    return food_items.update_food_item(db, payload)

@service_router.delete("/food_items/{food_item_id}", status_code=status.HTTP_200_OK)
def remove_food_item(food_item_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    return food_items.delete_food_item(db, user_id=user_id, food_item_id=food_item_id)


@service_router.get("/door_status/rear")
def get_rear_door_status(user_id: UUID, db: Session = Depends(get_db)):
    return order_management.get_door_status_for_user(
        db,
        user_id=user_id,
        door_type=DoorType.REAR,
    )



@service_router.post("/door_access", status_code=status.HTTP_201_CREATED)
def door_access(payload: DoorAccessByUserRequest, db: Session = Depends(get_db)):
    return order_management.record_door_access_by_user(
        db,
        user_id=payload.user_id,
        door_type=payload.door_type,
        success=payload.success,
        method=payload.method,
        reason=payload.reason,
        set_locked=payload.set_locked,
    )

@service_router.get("/reorder_candidates", response_model=list[ReorderCandidateRead])
def reorder_candidates(user_id: UUID, db: Session = Depends(get_db)):
    return item_supply_order.list_reorder_candidates(db, user_id=user_id)


@service_router.post("/supply_orders/generate", response_model=GenerateOrdersResponse)
def generate_supply_orders(payload: GenerateOrdersRequest, db: Session = Depends(get_db)):
    return item_supply_order.generate_orders_for_low_stock(db, user_id=payload.user_id, notes=payload.notes)


@service_router.post("/supply_orders/{supply_order_id}/send")
def send_supply_order(supply_order_id: UUID, payload: MarkOrderSentRequest, db: Session = Depends(get_db)):
    return item_supply_order.mark_order_sent(db, user_id=payload.user_id, supply_order_id=supply_order_id)


@service_router.post("/supply_orders/{supply_order_id}/receive")
def receive_supply_order(supply_order_id: UUID, payload: ReceiveOrderRequest, db: Session = Depends(get_db)):
    return item_supply_order.receive_supply_order(
        db,
        user_id=payload.user_id,
        supply_order_id=supply_order_id,
        fridge_id=payload.fridge_id,
        notes=payload.notes,
        items=[i.model_dump() for i in payload.items],
    )

@service_router.get("/supply_orders", response_model=list[SupplyOrderRead])
def list_supply_orders(
    user_id: UUID,
    status: list[SupplyOrderStatus] | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return item_supply_order.list_supply_orders(db, user_id=user_id, statuses=status)