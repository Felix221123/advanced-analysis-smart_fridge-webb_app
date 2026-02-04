# Define your module's models here

from __future__ import annotations

from datetime import datetime, date
from enum import Enum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


# ---------- Enums ----------

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    HEAD_CHEF = "HEAD_CHEF"
    CHEF = "CHEF"
    DELIVERY_PERSON = "DELIVERY_PERSON"
    HEALTH_SAFETY_OFFICER = "HEALTH_SAFETY_OFFICER"
    SERVER = "SERVER"


class DoorType(str, Enum):
    FRONT = "FRONT"
    REAR = "REAR"


class InventoryActionType(str, Enum):
    INSERT = "INSERT"
    REMOVE = "REMOVE"
    ADJUST = "ADJUST"


class AlertType(str, Enum):
    EXPIRY = "EXPIRY"
    LOW_STOCK = "LOW_STOCK"
    REORDER = "REORDER"
    DUE_SHORTAGE = "DUE_SHORTAGE"
    DOOR_ACCESS = "DOOR_ACCESS"


class NotificationChannel(str, Enum):
    PUSH = "PUSH"
    EMAIL = "EMAIL"
    SMS = "SMS"



# ---------- Core domain models ----------

class Restaurant(Base):
    __tablename__ = "restaurant"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    timezone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="restaurant", cascade="all, delete-orphan")
    fridges = relationship("Fridge", back_populates="restaurant", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="restaurant", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "user"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    restaurant = relationship("Restaurant", back_populates="users")
    deliveries = relationship("Delivery", back_populates="delivered_by")
    door_access_events = relationship("DoorAccess", back_populates="user")
    alerts_assigned = relationship("StockAlert", back_populates="assigned_user")
    notifications = relationship("Notification", back_populates="user")


class Fridge(Base):
    __tablename__ = "fridge"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    capacity_liters = Column(Integer, nullable=True)
    location_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    restaurant = relationship("Restaurant", back_populates="fridges")
    doors = relationship("Door", back_populates="fridge", cascade="all, delete-orphan")
    stock = relationship("FridgeStock", back_populates="fridge", cascade="all, delete-orphan")
    inventory_movements = relationship("InventoryMovement", back_populates="fridge")
    alerts = relationship("StockAlert", back_populates="fridge")


class Door(Base):
    __tablename__ = "door"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    fridge_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("fridge.id", ondelete="CASCADE"),
        nullable=False,
    )
    type = Column(SAEnum(DoorType, name="door_type"), nullable=False)
    is_locked = Column(Boolean, default=True, nullable=False)
    last_opened_at = Column(DateTime(timezone=True), nullable=True)

    fridge = relationship("Fridge", back_populates="doors")
    access_events = relationship("DoorAccess", back_populates="door")


class Supplier(Base):
    __tablename__ = "supplier"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    restaurant = relationship("Restaurant", back_populates="suppliers")
    food_items = relationship("FoodItem", back_populates="default_supplier")
    price_list = relationship("FoodItemSupplier", back_populates="supplier")


class FoodItem(Base):
    __tablename__ = "food_item"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    unit = Column(String, nullable=False) 
    pack_size = Column(Numeric, nullable=False)
    shelf_life_days = Column(Integer, nullable=False)
    allergens = Column(Text, nullable=True)
    reorder_point = Column(Integer, nullable=False)
    reorder_qty = Column(Integer, nullable=False)
    default_supplier_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("supplier.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    restaurant = relationship("Restaurant")
    default_supplier = relationship("Supplier", back_populates="food_items")
    batches = relationship("ItemBatch", back_populates="food_item", cascade="all, delete-orphan")
    alerts = relationship("StockAlert", back_populates="food_item")
    suppliers = relationship("FoodItemSupplier", back_populates="food_item")


class FoodItemSupplier(Base):
    __tablename__ = "food_item_supplier"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    food_item_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("food_item.id", ondelete="CASCADE"),
        nullable=False,
    )
    supplier_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("supplier.id", ondelete="CASCADE"),
        nullable=False,
    )
    price_per_unit = Column(Numeric, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)

    food_item = relationship("FoodItem", back_populates="suppliers")
    supplier = relationship("Supplier", back_populates="price_list")


class ItemBatch(Base):
    __tablename__ = "item_batch"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    food_item_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("food_item.id", ondelete="CASCADE"),
        nullable=False,
    )
    batch_code = Column(String, nullable=False)
    expiry_date = Column(Date, nullable=False)
    produced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    food_item = relationship("FoodItem", back_populates="batches")
    fridge_stock_entries = relationship("FridgeStock", back_populates="item_batch")
    inventory_movements = relationship("InventoryMovement", back_populates="item_batch")
    alerts = relationship("StockAlert", back_populates="item_batch")


class FridgeStock(Base):
    __tablename__ = "fridge_stock"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    fridge_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("fridge.id", ondelete="CASCADE"),
        nullable=False,
    )
    item_batch_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("item_batch.id", ondelete="CASCADE"),
        nullable=False,
    )
    qty_current = Column(Numeric, nullable=False)
    first_inserted_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    last_updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    fridge = relationship("Fridge", back_populates="stock")
    item_batch = relationship("ItemBatch", back_populates="fridge_stock_entries")


class Delivery(Base):
    __tablename__ = "delivery"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    delivered_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    delivered_by_user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes = Column(Text, nullable=True)
    supply_order_id = Column(
    PGUUID(as_uuid=True),
    ForeignKey("supply_order.id", ondelete="SET NULL"),
    nullable=True,
)

    # optional relationship:
    supply_order = relationship("SupplyOrder")
    restaurant = relationship("Restaurant")
    delivered_by = relationship("User", back_populates="deliveries")
    inventory_movements = relationship("InventoryMovement", back_populates="delivery")


class InventoryMovement(Base):
    __tablename__ = "inventory_movement"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    fridge_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("fridge.id", ondelete="CASCADE"),
        nullable=False,
    )
    item_batch_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("item_batch.id", ondelete="CASCADE"),
        nullable=False,
    )
    action_type = Column(SAEnum(InventoryActionType, name="inventory_action_type"), nullable=False)
    quantity = Column(Numeric, nullable=False)
    performed_by_user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    delivery_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("delivery.id", ondelete="SET NULL"),
        nullable=True,
    )
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    fridge = relationship("Fridge", back_populates="inventory_movements")
    item_batch = relationship("ItemBatch", back_populates="inventory_movements")
    performed_by = relationship("User")
    delivery = relationship("Delivery", back_populates="inventory_movements")


class DoorAccess(Base):
    __tablename__ = "door_access"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    door_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("door.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    opened_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    success = Column(Boolean, nullable=False)
    method = Column(String, nullable=False)  # app, otp, admin_override
    reason = Column(Text, nullable=True)

    door = relationship("Door", back_populates="access_events")
    user = relationship("User", back_populates="door_access_events")


class StockAlert(Base):
    __tablename__ = "stock_alert"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )
    type = Column(SAEnum(AlertType, name="alert_type"), nullable=False)
    fridge_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("fridge.id", ondelete="SET NULL"),
        nullable=True,
    )
    food_item_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("food_item.id", ondelete="SET NULL"),
        nullable=True,
    )
    item_batch_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("item_batch.id", ondelete="SET NULL"),
        nullable=True,
    )
    trigger_on = Column(Date, nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    assigned_to = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    fridge = relationship("Fridge", back_populates="alerts")
    food_item = relationship("FoodItem", back_populates="alerts")
    item_batch = relationship("ItemBatch", back_populates="alerts")
    assigned_user = relationship("User", back_populates="alerts_assigned")


class Notification(Base):
    __tablename__ = "notification"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    channel = Column(SAEnum(NotificationChannel, name="notification_channel"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    meta = Column(JSONB, nullable=False, default=dict)

    user = relationship("User", back_populates="notifications")



# ---------- Enums ----------
class SupplyOrderStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class SupplyOrder(Base):
    __tablename__ = "supply_order"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    restaurant_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("restaurant.id", ondelete="CASCADE"),
        nullable=False,
    )

    supplier_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("supplier.id", ondelete="RESTRICT"),
        nullable=False,
    )

    created_by_user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )

    status = Column(SAEnum(SupplyOrderStatus, name="supply_order_status"), nullable=False, default=SupplyOrderStatus.PENDING)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    restaurant = relationship("Restaurant")
    supplier = relationship("Supplier")
    created_by = relationship("User")
    items = relationship("SupplyOrderItem", back_populates="order", cascade="all, delete-orphan")


class SupplyOrderItem(Base):
    __tablename__ = "supply_order_item"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    supply_order_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("supply_order.id", ondelete="CASCADE"),
        nullable=False,
    )

    food_item_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("food_item.id", ondelete="RESTRICT"),
        nullable=False,
    )

    qty_requested = Column(Numeric, nullable=False)
    qty_delivered = Column(Numeric, nullable=False, default=0)
    unit_price = Column(Numeric, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    order = relationship("SupplyOrder", back_populates="items")
    food_item = relationship("FoodItem")



