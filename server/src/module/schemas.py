# Define your module's schemas here

from __future__ import annotations

from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID

from pydantic import BaseModel, EmailStr

from .models import (
    UserRole,
    DoorType,
    InventoryActionType,
    AlertType,
    NotificationChannel,
)


# ---------- Restaurant ----------

class RestaurantBase(BaseModel):
    name: str
    address: Optional[str] = None
    timezone: str


class RestaurantCreate(RestaurantBase):
    pass

class RestaurantOption(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class RestaurantRead(RestaurantBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- User ----------

class UserBase(BaseModel):
    full_name: str
    email: str
    role: UserRole
    is_active: bool = True


class UserCreate(UserBase):
    restaurant_id: UUID
    password: str  # plain password from client; hash it in service layer


class UserOption(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    restaurant_id: UUID
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    restaurant_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserRead(UserBase):
    id: UUID
    restaurant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    restaurant_id: UUID
    is_active: bool

    class Config:
        from_attributes = True



# ---------- Supplier / FoodItem ----------

class SupplierBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    restaurant_id: UUID


class SupplierRead(SupplierBase):
    id: UUID
    restaurant_id: UUID

    class Config:
        from_attributes = True


class FoodItemBase(BaseModel):
    name: str
    unit: str
    pack_size: float
    shelf_life_days: int
    allergens: Optional[str] = None
    reorder_point: int
    reorder_qty: int
    notes: Optional[str] = None
    default_supplier_id: Optional[UUID] = None


class FoodItemCreate(FoodItemBase):
    restaurant_id: UUID


class FoodItemRead(FoodItemBase):
    id: UUID
    restaurant_id: UUID

    class Config:
        from_attributes = True


class FoodItemSupplierBase(BaseModel):
    food_item_id: UUID
    supplier_id: UUID
    price_per_unit: float
    is_primary: bool = False


class FoodItemSupplierCreate(FoodItemSupplierBase):
    pass


class FoodItemSupplierRead(FoodItemSupplierBase):
    id: UUID

    class Config:
        from_attributes = True


# ---------- Fridge / Door ----------

class FridgeBase(BaseModel):
    name: str
    capacity_liters: Optional[int] = None
    location_note: Optional[str] = None


class FridgeCreate(FridgeBase):
    restaurant_id: UUID


class FridgeRead(FridgeBase):
    id: UUID
    restaurant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class DoorBase(BaseModel):
    fridge_id: UUID
    type: DoorType
    is_locked: bool = True


class DoorCreate(DoorBase):
    pass


class DoorRead(DoorBase):
    id: UUID
    last_opened_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DoorAccessBase(BaseModel):
    door_id: UUID
    user_id: Optional[UUID] = None
    success: bool
    method: str
    reason: Optional[str] = None


class DoorAccessCreate(DoorAccessBase):
    pass


class DoorAccessRead(DoorAccessBase):
    id: UUID
    opened_at: datetime

    class Config:
        from_attributes = True


# ---------- Inventory / Batches / Stock ----------

class ItemBatchBase(BaseModel):
    food_item_id: UUID
    batch_code: str
    expiry_date: date
    produced_at: Optional[datetime] = None


class ItemBatchCreate(ItemBatchBase):
    pass


class ItemBatchRead(ItemBatchBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class FridgeStockBase(BaseModel):
    fridge_id: UUID
    item_batch_id: UUID
    qty_current: int


class FridgeStockCreate(FridgeStockBase):
    pass


class FridgeStockRead(FridgeStockBase):
    id: UUID
    first_inserted_at: datetime
    last_updated_at: datetime

    class Config:
        from_attributes = True


class InventoryMovementBase(BaseModel):
    fridge_id: UUID
    item_batch_id: UUID
    action_type: InventoryActionType
    quantity: int
    performed_by_user_id: Optional[UUID] = None
    delivery_id: Optional[UUID] = None
    reason: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovementRead(InventoryMovementBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Delivery ----------

class DeliveryBase(BaseModel):
    restaurant_id: UUID
    notes: Optional[str] = None
    delivered_by_user_id: Optional[UUID] = None


class DeliveryCreate(DeliveryBase):
    pass


class DeliveryRead(DeliveryBase):
    id: UUID
    delivered_at: datetime

    class Config:
        from_attributes = True


# ---------- Alerts / Notifications ----------

class StockAlertBase(BaseModel):
    restaurant_id: UUID
    type: AlertType
    fridge_id: Optional[UUID] = None
    food_item_id: Optional[UUID] = None
    item_batch_id: Optional[UUID] = None
    trigger_on: date
    acknowledged: bool = False
    assigned_to: Optional[UUID] = None


class StockAlertCreate(StockAlertBase):
    pass


class StockAlertRead(StockAlertBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    user_id: UUID
    channel: NotificationChannel
    title: str
    body: str
    meta: Optional[Any] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationRead(NotificationBase):
    id: UUID
    sent_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

