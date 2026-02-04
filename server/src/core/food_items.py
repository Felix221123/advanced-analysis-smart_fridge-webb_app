# File: server/src/core/food_items.py

from typing import Optional, Any, Optional
from fastapi import HTTPException, status
from decimal import Decimal
import os
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from ..module.models import (
    User,
    Supplier,
    Fridge,
    FoodItem,
    FoodItemSupplier,
    ItemBatch,
    FridgeStock,
    InventoryMovement,
    InventoryActionType,
)
from uuid import UUID
from datetime import datetime, time


def _to_float(v):
    return float(v) if v is not None else None


def _iso(dt):
    return dt.isoformat() if dt else None


def _date_to_dt(d):
    return datetime.combine(d, time.min) if d else None


def _to_float_opt(v: Any) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, Decimal):
        return float(v)
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _to_float0(v: Any) -> float:
    """Float but default to 0.0 (useful for qty sums)."""
    out = _to_float_opt(v)
    return out if out is not None else 0.0


def _pick_fridge_for_restaurant(db: Session, restaurant_id: UUID) -> Fridge:
    fridges = (
        db.query(Fridge)
        .filter(Fridge.restaurant_id == restaurant_id)
        .order_by(Fridge.created_at.asc())  # deterministic
        .all()
    )

    if not fridges:
        raise HTTPException(
            status_code=400, detail="No fridge exists for this restaurant."
        )

    # If you only ever have 1 fridge per restaurant, this is perfect.
    # If you later support multiple fridges, this still won't be random.
    return fridges[0]


def _validate_supplier(db: Session, restaurant_id: UUID, supplier_id: UUID) -> Supplier:
    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == supplier_id,
            Supplier.restaurant_id == restaurant_id,
            Supplier.is_active == True,
        )
        .first()
    )
    if not supplier:
        raise HTTPException(
            status_code=400, detail="Supplier not found for this restaurant"
        )
    return supplier


def _validate_fridge(db: Session, restaurant_id: UUID, fridge_id: UUID) -> Fridge:
    fridge = (
        db.query(Fridge)
        .filter(Fridge.id == fridge_id, Fridge.restaurant_id == restaurant_id)
        .first()
    )
    if not fridge:
        raise HTTPException(
            status_code=400, detail="Fridge not found for this restaurant"
        )
    return fridge


def _build_inventory_row(db: Session, fi_id: UUID) -> dict:
    """
    Build the response in your AllFoodItemProps shape:
    - supplier info
    - qty_total
    - soonest expiry
    - last inserted/removed/adjusted user+time
    """
    fi = (
        db.query(FoodItem)
        .options(
            selectinload(FoodItem.default_supplier),
            selectinload(FoodItem.suppliers).selectinload(FoodItemSupplier.supplier),
            selectinload(FoodItem.batches).selectinload(ItemBatch.fridge_stock_entries),
            selectinload(FoodItem.batches)
            .selectinload(ItemBatch.inventory_movements)
            .selectinload(InventoryMovement.performed_by),
        )
        .filter(FoodItem.id == fi_id)
        .first()
    )
    if not fi:
        raise HTTPException(status_code=404, detail="Food item not found")

    # supplier link resolution: primary -> default -> first
    supplier_link = None
    if fi.suppliers:
        supplier_link = next((s for s in fi.suppliers if s.is_primary), None)
        if supplier_link is None and fi.default_supplier_id:
            supplier_link = next(
                (s for s in fi.suppliers if s.supplier_id == fi.default_supplier_id),
                None,
            )
        if supplier_link is None:
            supplier_link = fi.suppliers[0]

    supplier_id = None
    supplier_name = None
    price_per_unit = None
    if supplier_link:
        supplier_id = supplier_link.supplier_id
        supplier_name = supplier_link.supplier.name if supplier_link.supplier else None
        price_per_unit = _to_float(supplier_link.price_per_unit)
    elif fi.default_supplier:
        supplier_id = fi.default_supplier.id
        supplier_name = fi.default_supplier.name

    chosen_batch_id = None
    chosen_batch_code = None
    chosen_expiry = None

    chosen_any_id = None
    chosen_any_code = None
    chosen_any_expiry = None


    # qty_total + soonest expiry
    qty_total = 0.0
    expiry_dates = []
    for b in fi.batches or []:
        batch_qty = 0.0
        for se in b.fridge_stock_entries or []:
            batch_qty += _to_float(se.qty_current)

        qty_total += batch_qty

        if b.expiry_date:
            # track earliest expiry among ANY batches
            if chosen_any_expiry is None or b.expiry_date < chosen_any_expiry:
                chosen_any_expiry = b.expiry_date
                chosen_any_id = b.id
                chosen_any_code = b.batch_code

            # track earliest expiry among batches that have stock
            if batch_qty > 0:
                if chosen_expiry is None or b.expiry_date < chosen_expiry:
                    chosen_expiry = b.expiry_date
                    chosen_batch_id = b.id
                    chosen_batch_code = b.batch_code


    expiry_date = chosen_expiry if chosen_expiry else chosen_any_expiry
    item_batch_id = chosen_batch_id if chosen_batch_id else chosen_any_id
    batch_code = chosen_batch_code if chosen_batch_code else chosen_any_code


    # last movement by type across ALL batches
    last_by_type = {
        InventoryActionType.INSERT: None,
        InventoryActionType.REMOVE: None,
        InventoryActionType.ADJUST: None,
    }

    # collect movements
    all_moves = []
    for b in fi.batches or []:
        for mv in b.inventory_movements or []:
            all_moves.append(mv)

    # sort latest first
    all_moves.sort(key=lambda m: m.created_at or datetime.min, reverse=True)

    for mv in all_moves:
        if last_by_type.get(mv.action_type) is None:
            last_by_type[mv.action_type] = mv

    def mv_name(mv):
        if not mv or not mv.performed_by:
            return None
        return mv.performed_by.full_name

    def mv_time(mv):
        return _iso(mv.created_at) if mv else None

    last_insert = last_by_type[InventoryActionType.INSERT]
    last_remove = last_by_type[InventoryActionType.REMOVE]
    last_adjust = last_by_type[InventoryActionType.ADJUST]

    return {
        "id": fi.id,
        "restaurant_id": fi.restaurant_id,
        "name": fi.name,
        "unit": fi.unit,
        "pack_size": float(fi.pack_size),
        "shelf_life_days": fi.shelf_life_days,
        "allergens": fi.allergens,
        "reorder_point": fi.reorder_point,
        "reorder_qty": fi.reorder_qty,
        "notes": fi.notes,
        "default_supplier_id": fi.default_supplier_id,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "price_per_unit": price_per_unit,
        "is_active": fi.is_active,
        "qty_total": qty_total,
        "expiry_date": expiry_date,
        "item_batch_id": item_batch_id,
        "batch_code": batch_code,
        "last_inserted_by": mv_name(last_insert),
        "last_inserted_at": mv_time(last_insert),
        "last_removed_by": mv_name(last_remove),
        "last_removed_at": mv_time(last_remove),
        "last_adjusted_by": mv_name(last_adjust),
        "last_adjusted_at": mv_time(last_adjust),
    }


def _latest_movement_by_action(db: Session) -> dict:
    """
    Returns:
      {
        food_item_id: {
          "INSERT": {"by": "Name", "at": datetime},
          "REMOVE": {...},
          "ADJUST": {...}
        }
      }
    """
    rn = (
        func.row_number()
        .over(
            partition_by=(ItemBatch.food_item_id, InventoryMovement.action_type),
            order_by=InventoryMovement.created_at.desc(),
        )
        .label("rn")
    )

    q = (
        db.query(
            ItemBatch.food_item_id.label("food_item_id"),
            InventoryMovement.action_type.label("action_type"),
            User.full_name.label("full_name"),
            InventoryMovement.created_at.label("created_at"),
            rn,
        )
        .join(ItemBatch, ItemBatch.id == InventoryMovement.item_batch_id)
        .outerjoin(User, User.id == InventoryMovement.performed_by_user_id)
    ).subquery()

    rows = db.query(q).filter(q.c.rn == 1).all()

    out: dict = {}
    for r in rows:
        fid = str(r.food_item_id)
        action = (
            str(r.action_type.value)
            if hasattr(r.action_type, "value")
            else str(r.action_type)
        )

        if fid not in out:
            out[fid] = {}

        out[fid][action] = {
            "by": r.full_name,
            "at": r.created_at,
        }

    return out


def list_all_products_inventory(db: Session) -> list[dict]:
    items: list[FoodItem] = (
        db.query(FoodItem)
        .filter(FoodItem.is_active == True)
        .options(
            selectinload(FoodItem.suppliers).selectinload(FoodItemSupplier.supplier),
            selectinload(FoodItem.default_supplier),
            selectinload(FoodItem.batches).selectinload(ItemBatch.fridge_stock_entries),
        )
        .order_by(FoodItem.name.asc())
        .all()
    )

    results: list[dict] = []
    movement_map = _latest_movement_by_action(db)

    for fi in items:
        chosen_batch_id = None
        chosen_batch_code = None
        chosen_expiry = None

        chosen_any_id = None
        chosen_any_code = None
        chosen_any_expiry = None

        # ---------- supplier selection ----------
        supplier_link: Optional[FoodItemSupplier] = None
        if fi.suppliers:
            supplier_link = next((s for s in fi.suppliers if s.is_primary), None)
            if supplier_link is None and fi.default_supplier_id:
                supplier_link = next(
                    (s for s in fi.suppliers if s.supplier_id == fi.default_supplier_id),
                    None,
                )
            if supplier_link is None:
                supplier_link = fi.suppliers[0]

        supplier_id = None
        supplier_name = None
        price_per_unit = None

        if supplier_link:
            supplier_id = supplier_link.supplier_id
            supplier_name = supplier_link.supplier.name if supplier_link.supplier else None
            price_per_unit = _to_float_opt(supplier_link.price_per_unit)
        elif fi.default_supplier:
            supplier_id = fi.default_supplier.id
            supplier_name = fi.default_supplier.name

        # ---------- qty_total + expiry_date (prefer batches with stock) ----------
        qty_total = 0.0

        for b in fi.batches or []:
            batch_qty = 0.0
            for se in b.fridge_stock_entries or []:
                batch_qty += _to_float0(se.qty_current)

            qty_total += batch_qty

            if b.expiry_date:
                # earliest expiry among ANY batches
                if chosen_any_expiry is None or b.expiry_date < chosen_any_expiry:
                    chosen_any_expiry = b.expiry_date
                    chosen_any_id = b.id
                    chosen_any_code = b.batch_code

                # earliest expiry among batches WITH STOCK
                if batch_qty > 0:
                    if chosen_expiry is None or b.expiry_date < chosen_expiry:
                        chosen_expiry = b.expiry_date
                        chosen_batch_id = b.id
                        chosen_batch_code = b.batch_code

        # / choose stock-based expiry first, else fallback to any batch expiry
        expiry_date = chosen_expiry if chosen_expiry else chosen_any_expiry
        item_batch_id = chosen_batch_id if chosen_batch_id else chosen_any_id
        batch_code = chosen_batch_code if chosen_batch_code else chosen_any_code

        mv = movement_map.get(str(fi.id), {})

        results.append(
            {
                "id": fi.id,
                "restaurant_id": fi.restaurant_id,
                "name": fi.name,
                "unit": fi.unit,
                "pack_size": _to_float(fi.pack_size),
                "shelf_life_days": fi.shelf_life_days,
                "allergens": fi.allergens,
                "reorder_point": fi.reorder_point,
                "reorder_qty": fi.reorder_qty,
                "notes": fi.notes,
                "default_supplier_id": fi.default_supplier_id,
                "supplier_id": supplier_id,
                "supplier_name": supplier_name,
                "price_per_unit": price_per_unit,
                "qty_total": qty_total,
                "is_active": fi.is_active,
                "expiry_date": expiry_date,       
                "item_batch_id": item_batch_id,   
                "batch_code": batch_code,
                "last_inserted_by": (mv.get("INSERT") or {}).get("by"),
                "last_inserted_at": (mv.get("INSERT") or {}).get("at"),
                "last_removed_by": (mv.get("REMOVE") or {}).get("by"),
                "last_removed_at": (mv.get("REMOVE") or {}).get("at"),
                "last_adjusted_by": (mv.get("ADJUST") or {}).get("by"),
                "last_adjusted_at": (mv.get("ADJUST") or {}).get("at"),
            }
        )

    return results



# functionality for creating food item
def create_food_item_with_initial_stock(db: Session, payload) -> dict:
    # 1) resolve user -> restaurant_id
    u = (
        db.query(User)
        .filter(User.id == payload.user_id, User.is_active == True)
        .first()
    )
    if not u:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user"
        )

    restaurant_id = u.restaurant_id

    # 2) avoid duplicates (simple: same name in same restaurant, case-insensitive)
    existing = (
        db.query(FoodItem)
        .filter(
            FoodItem.restaurant_id == restaurant_id,
            FoodItem.is_active == True,
            func.lower(FoodItem.name) == payload.name.strip().lower(),
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Food item with this name already exists in this restaurant",
        )

    # 3) supplier validation (optional)
    if payload.supplier_id is not None:
        _validate_supplier(db, restaurant_id, payload.supplier_id)
        if payload.price_per_unit is None:
            raise HTTPException(
                status_code=400,
                detail="price_per_unit is required when supplier_id is provided",
            )

    # 4) fridge: always pick from restaurant (no fridge_id from client)
    fridge = _pick_fridge_for_restaurant(db, restaurant_id)

    try:
        # 5) create FoodItem
        fi = FoodItem(
            restaurant_id=restaurant_id,
            name=payload.name.strip(),
            unit=payload.unit.strip(),
            pack_size=payload.pack_size,
            shelf_life_days=payload.shelf_life_days,
            allergens=payload.allergens,
            reorder_point=payload.reorder_point,
            reorder_qty=payload.reorder_qty,
            notes=payload.notes,
            default_supplier_id=payload.supplier_id,
        )
        db.add(fi)
        db.flush()  # fi.id available

        # 6) create FoodItemSupplier (optional)
        if payload.supplier_id is not None:
            link = FoodItemSupplier(
                food_item_id=fi.id,
                supplier_id=payload.supplier_id,
                price_per_unit=payload.price_per_unit,
                is_primary=payload.is_primary,
            )
            db.add(link)

        # 7) create ItemBatch (required)
        batch = ItemBatch(
            food_item_id=fi.id,
            batch_code=payload.batch_code.strip(),
            expiry_date=payload.expiry_date,
            produced_at=_date_to_dt(payload.produced_at),
        )
        db.add(batch)
        db.flush()  # batch.id available

        # 8) create FridgeStock (required)
        stock = FridgeStock(
            fridge_id=fridge.id,
            item_batch_id=batch.id,
            qty_current=payload.qty_initial,
        )
        db.add(stock)

        # 9) create InventoryMovement (INSERT)
        mv = InventoryMovement(
            fridge_id=fridge.id,
            item_batch_id=batch.id,
            action_type=InventoryActionType.INSERT,
            quantity=payload.qty_initial,
            performed_by_user_id=u.id,
            reason=payload.reason,
        )
        db.add(mv)

        db.commit()

    except:
        db.rollback()
        raise

    # 10) return in your inventory UI shape
    return _build_inventory_row(db, fi.id)


# functionality for updating food item
def update_food_item(db: Session, payload) -> dict:
    # 1) resolve user
    u = (
        db.query(User)
        .filter(User.id == payload.user_id, User.is_active == True)
        .first()
    )
    if not u:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user"
        )

    restaurant_id = u.restaurant_id

    # 2) get food item (must belong to restaurant)
    fi = (
        db.query(FoodItem)
        .filter(
            FoodItem.id == payload.food_item_id, FoodItem.restaurant_id == restaurant_id
        )
        .first()
    )
    if not fi:
        raise HTTPException(
            status_code=404, detail="Food item not found for this restaurant"
        )

    # 3) optional supplier validations
    if payload.default_supplier_id is not None:
        _validate_supplier(db, restaurant_id, payload.default_supplier_id)

    if payload.supplier_id is not None:
        _validate_supplier(db, restaurant_id, payload.supplier_id)
        if payload.price_per_unit is None and payload.is_primary is not None:
            # if they’re touching supplier link, price is needed (you can loosen this if you want)
            raise HTTPException(
                status_code=400,
                detail="price_per_unit is required when supplier_id is provided",
            )

    # 4) fridge resolve (only needed if adjusting stock)
    fridge = None
    if (
        payload.item_batch_id
        or payload.delta_qty is not None
        or payload.new_qty is not None
    ):
        if payload.fridge_id:
            fridge = _validate_fridge(db, restaurant_id, payload.fridge_id)
        else:
            fridge = _pick_fridge_for_restaurant(db, restaurant_id)

    try:
        # ----------------------------
        # A) update FoodItem "meta"
        # ----------------------------
        if payload.name is not None:
            fi.name = payload.name.strip()

        if payload.unit is not None:
            fi.unit = payload.unit.strip()

        if payload.pack_size is not None:
            fi.pack_size = payload.pack_size

        if payload.shelf_life_days is not None:
            fi.shelf_life_days = payload.shelf_life_days

        if payload.allergens is not None:
            fi.allergens = payload.allergens

        if payload.reorder_point is not None:
            fi.reorder_point = payload.reorder_point

        if payload.reorder_qty is not None:
            fi.reorder_qty = payload.reorder_qty

        if payload.notes is not None:
            fi.notes = payload.notes

        if payload.default_supplier_id is not None:
            fi.default_supplier_id = payload.default_supplier_id

        db.add(fi)

        # ----------------------------
        # B) update supplier link (optional)
        # ----------------------------
        if payload.supplier_id is not None:
            link = (
                db.query(FoodItemSupplier)
                .filter(
                    FoodItemSupplier.food_item_id == fi.id,
                    FoodItemSupplier.supplier_id == payload.supplier_id,
                )
                .first()
            )

            if not link:
                # create link if it doesn't exist
                if payload.price_per_unit is None:
                    raise HTTPException(
                        status_code=400,
                        detail="price_per_unit is required to create a supplier link",
                    )
                link = FoodItemSupplier(
                    food_item_id=fi.id,
                    supplier_id=payload.supplier_id,
                    price_per_unit=payload.price_per_unit,
                    is_primary=(
                        bool(payload.is_primary)
                        if payload.is_primary is not None
                        else False
                    ),
                )
                db.add(link)
            else:
                if payload.price_per_unit is not None:
                    link.price_per_unit = payload.price_per_unit
                if payload.is_primary is not None:
                    link.is_primary = payload.is_primary
                db.add(link)

        # Optional: if they set a supplier as primary, unset others
        if payload.supplier_id is not None and payload.is_primary is True:
            (
                db.query(FoodItemSupplier)
                .filter(
                    FoodItemSupplier.food_item_id == fi.id,
                    FoodItemSupplier.supplier_id != payload.supplier_id,
                )
                .update({"is_primary": False})
            )

        # ----------------------------
        # C) stock adjust (optional) -> MUST write InventoryMovement
        # ----------------------------
        if payload.item_batch_id is not None and (
            payload.delta_qty is not None or payload.new_qty is not None
        ):
            batch = (
                db.query(ItemBatch)
                .filter(
                    ItemBatch.id == payload.item_batch_id,
                    ItemBatch.food_item_id == fi.id,
                )
                .first()
            )
            if not batch:
                raise HTTPException(
                    status_code=404, detail="Batch not found for this food item"
                )

            stock = (
                db.query(FridgeStock)
                .filter(
                    FridgeStock.fridge_id == fridge.id,
                    FridgeStock.item_batch_id == batch.id,
                )
                .first()
            )
            if not stock:
                raise HTTPException(
                    status_code=404,
                    detail="Stock entry not found for this batch in this fridge",
                )

            old_qty = _to_float0(stock.qty_current)

            # Decide new qty + action
            if payload.new_qty is not None:
                new_qty = float(payload.new_qty)
                delta = new_qty - old_qty
                action = InventoryActionType.ADJUST
                qty_for_movement = abs(delta)
            else:
                delta = float(payload.delta_qty)
                new_qty = old_qty + delta
                if new_qty < 0:
                    raise HTTPException(
                        status_code=400, detail="Resulting quantity cannot be negative"
                    )

                if delta > 0:
                    action = InventoryActionType.INSERT
                elif delta < 0:
                    action = InventoryActionType.REMOVE
                else:
                    action = InventoryActionType.ADJUST  # no-op, but we can skip
                qty_for_movement = abs(delta)

            # if delta == 0, skip movement and qty update
            if abs(delta) > 0:
                stock.qty_current = new_qty
                stock.last_updated_at = datetime.utcnow()
                db.add(stock)

                mv = InventoryMovement(
                    fridge_id=fridge.id,
                    item_batch_id=batch.id,
                    action_type=action,
                    quantity=qty_for_movement,
                    performed_by_user_id=u.id,
                    reason=payload.reason,
                )
                db.add(mv)

        db.commit()

    except:
        db.rollback()
        raise

    return _build_inventory_row(db, fi.id)


# functionality for deleting food item
def delete_food_item(db: Session, user_id: UUID, food_item_id: UUID) -> dict:
    u = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not u:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user"
        )

    restaurant_id = u.restaurant_id

    fi = (
        db.query(FoodItem)
        .filter(
            FoodItem.id == food_item_id,
            FoodItem.restaurant_id == restaurant_id,
            FoodItem.is_active == True,
        )
        .first()
    )
    if not fi:
        raise HTTPException(
            status_code=404, detail="Food item not found for this restaurant"
        )

    try:
        fi.is_active = False
        db.add(fi)
        db.commit()
    except:
        db.rollback()
        raise

    return {"status": "soft_deleted", "food_item_id": str(food_item_id)}
