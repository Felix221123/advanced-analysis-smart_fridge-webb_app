# Define your module's schemas here

from __future__ import annotations

from datetime import datetime, date
from typing import Optional, Any, List
from uuid import UUID

from pydantic import BaseModel, Field

from .models import (
    UserRole,
    DoorType,
    InventoryActionType,
    AlertType,
    NotificationChannel,
    SupplyOrderStatus,
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
    id: UUID
    restaurant_id: UUID
    name: str
    unit: str
    pack_size: float
    shelf_life_days: int
    allergens: Optional[str] = None
    reorder_point: int
    reorder_qty: int
    notes: Optional[str] = None
    default_supplier_id: Optional[UUID] = None
    notes: str

class FoodItemInventoryRead(BaseModel):
    # Food item core fields
    id: UUID
    restaurant_id: UUID
    name: str
    unit: str
    pack_size: float
    shelf_life_days: int
    allergens: Optional[str] = None
    reorder_point: int
    reorder_qty: int
    notes: Optional[str] = None
    default_supplier_id: Optional[UUID] = None
    qty_total: float = 0.0

    is_active: bool

    # Enriched fields for Inventory UI
    supplier_id: Optional[UUID] = None
    supplier_name: Optional[str] = None
    price_per_unit: Optional[float] = None
    item_batch_id: Optional[UUID] = None
    batch_code: Optional[str] = None

    # From ItemBatch (computed as the soonest expiry among batches)
    expiry_date: Optional[date] = None
    last_inserted_by: Optional[str] = None
    last_inserted_at: Optional[datetime] = None
    last_removed_by: Optional[str] = None
    last_removed_at: Optional[datetime] = None
    last_adjusted_by: Optional[str] = None
    last_adjusted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FoodItemCreateWithInitialStockRequest(BaseModel):
    user_id: UUID

    # FoodItem core
    name: str = Field(..., min_length=1)
    unit: str = Field(..., min_length=1)
    pack_size: float = Field(..., gt=0)
    shelf_life_days: int = Field(..., ge=0)
    allergens: Optional[str] = None
    reorder_point: int = Field(..., ge=0)
    reorder_qty: int = Field(..., ge=0)
    notes: Optional[str] = None

    # Supplier link (optional)
    supplier_id: Optional[UUID] = None
    price_per_unit: Optional[float] = Field(default=None, ge=0)
    is_primary: bool = True

    # / Initial stock (so it's "in the fridge" immediately)
    batch_code: str = Field(..., min_length=1)
    expiry_date: date
    produced_at: Optional[datetime] = None
    qty_initial: float = Field(..., gt=0)

    reason: Optional[str] = None  # stored on InventoryMovement



class FoodItemUpdateRequest(BaseModel):
    user_id: UUID

    # ---- which item to edit ----
    food_item_id: UUID

    # ---- optional "meta" updates ----
    name: Optional[str] = None
    unit: Optional[str] = None
    pack_size: Optional[float] = Field(default=None, gt=0)
    shelf_life_days: Optional[int] = Field(default=None, ge=0)
    allergens: Optional[str] = None
    reorder_point: Optional[int] = Field(default=None, ge=0)
    reorder_qty: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = None

    # supplier link updates (optional)
    default_supplier_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    price_per_unit: Optional[float] = Field(default=None, ge=0)
    is_primary: Optional[bool] = None

    # ---- optional stock adjustment ----
    fridge_id: Optional[UUID] = None  # if None -> pick first fridge for restaurant
    item_batch_id: Optional[UUID] = None

    # Provide ONE of these:
    delta_qty: Optional[float] = None     # + means insert, - means remove
    new_qty: Optional[float] = Field(default=None, ge=0)  # set qty -> ADJUST

    reason: Optional[str] = None



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


class DoorAccessByUserRequest(BaseModel):
    user_id: UUID
    door_type: DoorType = DoorType.REAR

    success: bool = True
    method: str = "app"
    reason: Optional[str] = None

    # you said you’ll set this from frontend, so keep it optional
    set_locked: Optional[bool] = None


class DoorStatusRead(BaseModel):
    id: UUID
    fridge_id: UUID
    door_type: DoorType
    is_locked: bool
    last_opened_at: Optional[datetime] = None


class DoorAccessEventResponse(BaseModel):
    door: dict
    access: dict





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
    quantity: float
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



class ReorderCandidateRead(BaseModel):
    food_item_id: UUID
    name: str
    unit: str
    qty_current: float
    reorder_point: int
    reorder_qty: int
    qty_to_order: float
    supplier_id: Optional[UUID] = None
    supplier_name: Optional[str] = None


class SupplyOrderItemRead(BaseModel):
    id: UUID
    food_item_id: UUID
    food_item_name: Optional[str] = None
    qty_requested: float
    qty_delivered: float
    unit_price: Optional[float] = None

    class Config:
        from_attributes = True


class SupplyOrderRead(BaseModel):
    id: UUID
    restaurant_id: UUID
    supplier_id: UUID
    supplier_name: Optional[str] = None
    created_by_user_id: Optional[UUID] = None
    status: SupplyOrderStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    notes: Optional[str] = None
    items: List[SupplyOrderItemRead] = []

    class Config:
        from_attributes = True


class GenerateOrdersRequest(BaseModel):
    user_id: UUID
    notes: Optional[str] = None


class GenerateOrdersResponse(BaseModel):
    created_orders: List[SupplyOrderRead]
    skipped_items_missing_supplier: List[ReorderCandidateRead] = []


class MarkOrderSentRequest(BaseModel):
    user_id: UUID


class ReceiveOrderItem(BaseModel):
    food_item_id: UUID
    qty_delivered: float = Field(..., gt=0)
    batch_code: str = Field(..., min_length=1)
    expiry_date: date
    produced_at: Optional[datetime] = None


class ReceiveOrderRequest(BaseModel):
    user_id: UUID  # delivery person user id (or head chef if you allow)
    fridge_id: Optional[UUID] = None
    notes: Optional[str] = None
    items: List[ReceiveOrderItem]