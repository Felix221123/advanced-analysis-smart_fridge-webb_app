# File: server/src/core/item_supply_order.py

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from ..module.models import (
    User,
    UserRole,
    Supplier,
    FoodItem,
    FoodItemSupplier,
    ItemBatch,
    Fridge,
    FridgeStock,
    Delivery,
    InventoryMovement,
    InventoryActionType,
    SupplyOrder,
    SupplyOrderItem,
    SupplyOrderStatus,
)

# ---------- small helpers ----------

def _to_float(v) -> float:
    if v is None:
        return 0.0
    if isinstance(v, Decimal):
        return float(v)
    return float(v)

def _get_active_user(db: Session, user_id: UUID) -> User:
    u = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
    return u

def _require_role(u: User, allowed: set[UserRole]) -> None:
    if u.role not in allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

def _pick_fridge_for_restaurant(db: Session, restaurant_id: UUID) -> Fridge:
    fridge = (
        db.query(Fridge)
        .filter(Fridge.restaurant_id == restaurant_id)
        .order_by(Fridge.created_at.asc())
        .first()
    )
    if not fridge:
        raise HTTPException(status_code=400, detail="No fridge exists for this restaurant.")
    return fridge

def _resolve_supplier_for_food_item(db: Session, fi: FoodItem) -> tuple[Optional[UUID], Optional[str], Optional[float]]:
    """
    Prefer:
      1) FoodItemSupplier.is_primary
      2) FoodItem.default_supplier_id
      3) first FoodItemSupplier
    Returns: (supplier_id, supplier_name, unit_price)
    """
    link = (
        db.query(FoodItemSupplier)
        .options(selectinload(FoodItemSupplier.supplier))
        .filter(FoodItemSupplier.food_item_id == fi.id)
        .order_by(FoodItemSupplier.is_primary.desc())
        .first()
    )

    if link and link.supplier:
        return (link.supplier_id, link.supplier.name, _to_float(link.price_per_unit))

    if fi.default_supplier_id:
        sup = db.query(Supplier).filter(Supplier.id == fi.default_supplier_id).first()
        if sup:
            return (sup.id, sup.name, None)

    if link and link.supplier_id:
        # link exists but supplier object not loaded for some reason
        sup = db.query(Supplier).filter(Supplier.id == link.supplier_id).first()
        return (link.supplier_id, sup.name if sup else None, _to_float(link.price_per_unit))

    return (None, None, None)

# ---------- API-facing functions ----------

def list_reorder_candidates(db: Session, *, user_id: UUID) -> list[dict]:
    """
    Returns items where total stock < reorder_point.
    """
    u = _get_active_user(db, user_id)
    _require_role(u, {UserRole.ADMIN, UserRole.HEAD_CHEF, UserRole.CHEF})

    restaurant_id = u.restaurant_id

    qty_total_expr = func.coalesce(func.sum(FridgeStock.qty_current), 0)

    rows = (
        db.query(FoodItem, qty_total_expr.label("qty_total"))
        .outerjoin(ItemBatch, ItemBatch.food_item_id == FoodItem.id)
        .outerjoin(FridgeStock, FridgeStock.item_batch_id == ItemBatch.id)
        .filter(FoodItem.restaurant_id == restaurant_id, FoodItem.is_active == True)
        .group_by(FoodItem.id)
        .having(qty_total_expr < FoodItem.reorder_point)
        .order_by(FoodItem.name.asc())
        .all()
    )

    out: list[dict] = []
    for fi, qty_total in rows:
        supplier_id, supplier_name, unit_price = _resolve_supplier_for_food_item(db, fi)

        qty_current = _to_float(qty_total)
        needed = max(0.0, float(fi.reorder_point) - qty_current)
        qty_to_order = max(float(fi.reorder_qty), needed)  # good default

        out.append({
            "food_item_id": fi.id,
            "name": fi.name,
            "unit": fi.unit,
            "qty_current": qty_current,
            "reorder_point": fi.reorder_point,
            "reorder_qty": fi.reorder_qty,
            "qty_to_order": qty_to_order,
            "supplier_id": supplier_id,
            "supplier_name": supplier_name,
        })

    return out


def generate_orders_for_low_stock(db: Session, *, user_id: UUID, notes: Optional[str] = None) -> dict:
    """
    Head Chef/Admin:
    - finds reorder candidates
    - groups by supplier
    - creates SupplyOrder + SupplyOrderItem rows
    """
    u = _get_active_user(db, user_id)
    _require_role(u, {UserRole.ADMIN, UserRole.HEAD_CHEF})

    candidates = list_reorder_candidates(db, user_id=user_id)

    # split: items with supplier vs missing supplier
    with_supplier: dict[UUID, list[dict]] = {}
    missing_supplier: list[dict] = []

    for c in candidates:
        if not c.get("supplier_id"):
            missing_supplier.append(c)
            continue
        sid = c["supplier_id"]
        with_supplier.setdefault(sid, []).append(c)

    created_orders: list[SupplyOrder] = []

    try:
        for supplier_id, items in with_supplier.items():
            order = SupplyOrder(
                restaurant_id=u.restaurant_id,
                supplier_id=supplier_id,
                created_by_user_id=u.id,
                status=SupplyOrderStatus.PENDING,
                notes=notes,
            )
            db.add(order)
            db.flush()  # order.id

            for it in items:
                fi = db.query(FoodItem).filter(FoodItem.id == it["food_item_id"]).first()

                # snapshot unit price if primary link exists
                unit_price = None
                link = (
                    db.query(FoodItemSupplier)
                    .filter(FoodItemSupplier.food_item_id == fi.id, FoodItemSupplier.supplier_id == supplier_id)
                    .order_by(FoodItemSupplier.is_primary.desc())
                    .first()
                )
                if link and link.price_per_unit is not None:
                    unit_price = link.price_per_unit

                line = SupplyOrderItem(
                    supply_order_id=order.id,
                    food_item_id=fi.id,
                    qty_requested=it["qty_to_order"],
                    qty_delivered=0,
                    unit_price=unit_price,
                )
                db.add(line)

            created_orders.append(order)

        db.commit()

    except:
        db.rollback()
        raise

    # return hydrated response
    orders = (
        db.query(SupplyOrder)
        .options(
            selectinload(SupplyOrder.items).selectinload(SupplyOrderItem.food_item),
            selectinload(SupplyOrder.supplier),
        )
        .filter(SupplyOrder.id.in_([o.id for o in created_orders]))
        .order_by(SupplyOrder.created_at.desc())
        .all()
    )

    def _order_to_dict(o: SupplyOrder) -> dict:
        return {
            "id": o.id,
            "restaurant_id": o.restaurant_id,
            "supplier_id": o.supplier_id,
            "supplier_name": o.supplier.name if o.supplier else None,
            "created_by_user_id": o.created_by_user_id,
            "status": o.status,
            "created_at": o.created_at,
            "sent_at": o.sent_at,
            "delivered_at": o.delivered_at,
            "notes": o.notes,
            "items": [
                {
                    "id": li.id,
                    "food_item_id": li.food_item_id,
                    "food_item_name": li.food_item.name if li.food_item else None,
                    "qty_requested": _to_float(li.qty_requested),
                    "qty_delivered": _to_float(li.qty_delivered),
                    "unit_price": _to_float(li.unit_price) if li.unit_price is not None else None,
                }
                for li in (o.items or [])
            ],
        }

    return {
        "created_orders": [_order_to_dict(o) for o in orders],
        "skipped_items_missing_supplier": missing_supplier,
    }


def mark_order_sent(db: Session, *, user_id: UUID, supply_order_id: UUID) -> dict:
    u = _get_active_user(db, user_id)
    _require_role(u, {UserRole.ADMIN, UserRole.HEAD_CHEF})

    order = (
        db.query(SupplyOrder)
        .filter(SupplyOrder.id == supply_order_id, SupplyOrder.restaurant_id == u.restaurant_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Supply order not found")

    if order.status in {SupplyOrderStatus.DELIVERED, SupplyOrderStatus.CANCELLED}:
        raise HTTPException(status_code=400, detail="Cannot send an order that is delivered/cancelled")

    try:
        order.status = SupplyOrderStatus.SENT
        order.sent_at = datetime.utcnow()
        db.add(order)
        db.commit()
        db.refresh(order)
    except:
        db.rollback()
        raise

    return {"status": "sent", "supply_order_id": str(order.id), "sent_at": order.sent_at}


def receive_supply_order(db: Session, *, user_id: UUID, supply_order_id: UUID, fridge_id: Optional[UUID], notes: Optional[str], items: list[dict]) -> dict:
    """
    Delivery person:
      - creates Delivery row (linked to supply_order)
      - for each item:
          * creates ItemBatch
          * creates FridgeStock (INSERT qty)
          * creates InventoryMovement (INSERT) with delivery_id
          * updates SupplyOrderItem.qty_delivered
      - marks order PARTIALLY_DELIVERED or DELIVERED
    """
    u = _get_active_user(db, user_id)
    _require_role(u, {UserRole.DELIVERY_PERSON, UserRole.ADMIN, UserRole.HEAD_CHEF})

    order = (
        db.query(SupplyOrder)
        .options(selectinload(SupplyOrder.items))
        .filter(SupplyOrder.id == supply_order_id, SupplyOrder.restaurant_id == u.restaurant_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Supply order not found")

    if order.status in {SupplyOrderStatus.CANCELLED}:
        raise HTTPException(status_code=400, detail="Cannot receive a cancelled order")

    # fridge resolve
    fridge = None
    if fridge_id:
        fridge = db.query(Fridge).filter(Fridge.id == fridge_id, Fridge.restaurant_id == u.restaurant_id).first()
        if not fridge:
            raise HTTPException(status_code=400, detail="Invalid fridge for this restaurant")
    else:
        fridge = _pick_fridge_for_restaurant(db, u.restaurant_id)

    try:
        delivery = Delivery(
            restaurant_id=u.restaurant_id,
            delivered_by_user_id=u.id,
            notes=notes,
            supply_order_id=order.id,  # requires the Delivery model update
        )
        db.add(delivery)
        db.flush()  # delivery.id

        # quick map: food_item_id -> order line
        line_map = {li.food_item_id: li for li in (order.items or [])}

        for it in items:
            food_item_id = it["food_item_id"]
            qty_delivered = float(it["qty_delivered"])

            if food_item_id not in line_map:
                raise HTTPException(status_code=400, detail=f"Food item {food_item_id} not found in this order")

            # create batch
            batch = ItemBatch(
                food_item_id=food_item_id,
                batch_code=it["batch_code"].strip(),
                expiry_date=it["expiry_date"],
                produced_at=it.get("produced_at"),
            )
            db.add(batch)
            db.flush()

            # create stock entry
            stock = FridgeStock(
                fridge_id=fridge.id,
                item_batch_id=batch.id,
                qty_current=qty_delivered,
            )
            db.add(stock)

            # movement log (INSERT linked to delivery)
            mv = InventoryMovement(
                fridge_id=fridge.id,
                item_batch_id=batch.id,
                action_type=InventoryActionType.INSERT,
                quantity=qty_delivered,
                performed_by_user_id=u.id,
                delivery_id=delivery.id,
                reason="Delivery received (supply order)",
            )
            db.add(mv)

            # update delivered qty on order line
            line = line_map[food_item_id]
            line.qty_delivered = _to_float(line.qty_delivered) + qty_delivered
            db.add(line)

        # update order status
        all_fulfilled = True
        for li in (order.items or []):
            if _to_float(li.qty_delivered) < _to_float(li.qty_requested):
                all_fulfilled = False
                break

        order.delivered_at = datetime.utcnow() if all_fulfilled else None
        order.status = SupplyOrderStatus.DELIVERED if all_fulfilled else SupplyOrderStatus.PARTIALLY_DELIVERED
        db.add(order)

        db.commit()

    except:
        db.rollback()
        raise

    return {
        "status": "received",
        "supply_order_id": str(order.id),
        "order_status": str(order.status.value) if hasattr(order.status, "value") else str(order.status),
        "delivery_id": str(delivery.id),
    }


def list_supply_orders(db: Session, *, user_id: UUID, statuses: Optional[list[SupplyOrderStatus]] = None) -> list[dict]:
    u = _get_active_user(db, user_id)
    _require_role(u, {UserRole.DELIVERY_PERSON, UserRole.ADMIN, UserRole.HEAD_CHEF})

    q = (
        db.query(SupplyOrder)
        .options(
            selectinload(SupplyOrder.items).selectinload(SupplyOrderItem.food_item),
            selectinload(SupplyOrder.supplier),
        )
        .filter(SupplyOrder.restaurant_id == u.restaurant_id)
    )

    if statuses:
        q = q.filter(SupplyOrder.status.in_(statuses))

    orders = q.order_by(SupplyOrder.created_at.desc()).all()

    def _order_to_dict(o: SupplyOrder) -> dict:
        return {
            "id": o.id,
            "restaurant_id": o.restaurant_id,
            "supplier_id": o.supplier_id,
            "supplier_name": o.supplier.name if o.supplier else None,
            "created_by_user_id": o.created_by_user_id,
            "status": o.status,
            "created_at": o.created_at,
            "sent_at": o.sent_at,
            "delivered_at": o.delivered_at,
            "notes": o.notes,
            "items": [
                {
                    "id": li.id,
                    "food_item_id": li.food_item_id,
                    "food_item_name": li.food_item.name if li.food_item else None,
                    "qty_requested": _to_float(li.qty_requested),
                    "qty_delivered": _to_float(li.qty_delivered),
                    "unit_price": _to_float(li.unit_price) if li.unit_price is not None else None,
                }
                for li in (o.items or [])
            ],
        }

    return [_order_to_dict(o) for o in orders]
