# File: server/src/core/order_management.py

from datetime import datetime
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..module.models import User, Fridge, Door, DoorAccess, DoorType


def _get_active_user(db: Session, user_id: UUID) -> User:
    u = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
    return u


def _pick_fridge_for_restaurant(db: Session, restaurant_id: UUID, fridge_id: Optional[UUID] = None) -> Fridge:
    q = db.query(Fridge).filter(Fridge.restaurant_id == restaurant_id)
    if fridge_id:
        q = q.filter(Fridge.id == fridge_id)

    fridge = q.order_by(Fridge.created_at.asc()).first()
    if not fridge:
        raise HTTPException(status_code=400, detail="No fridge found for this restaurant")
    return fridge



def _get_door(db: Session, fridge_id: UUID, door_type: DoorType) -> Door:
    door = (
        db.query(Door)
        .filter(Door.fridge_id == fridge_id, Door.type == door_type)
        .first()
    )
    if not door:
        raise HTTPException(status_code=404, detail="Door not found. Seed the door table first.")
    return door


def record_door_access_by_user(
    db: Session,
    *,
    user_id: UUID,
    door_type: DoorType = DoorType.REAR,
    success: bool = True,
    method: str = "app",
    reason: Optional[str] = None,
    set_locked: Optional[bool] = None,
) -> dict:
    """
    No fridge_id needed:
    user -> restaurant -> first fridge -> door (by type)
    """
    u = _get_active_user(db, user_id)
    fridge = _pick_fridge_for_restaurant(db, u.restaurant_id)
    door = _get_door(db, fridge.id, door_type)

    now = datetime.utcnow()

    try:
        # update door state if requested
        if set_locked is not None:
            door.is_locked = bool(set_locked)

        # update last opened timestamp on success
        if success:
            door.last_opened_at = now

        db.add(door)

        access = DoorAccess(
            door_id=door.id,
            user_id=u.id,
            opened_at=now,
            success=bool(success),
            method=method,
            reason=reason,
        )
        db.add(access)

        db.commit()
        db.refresh(access)
        db.refresh(door)

    except:
        db.rollback()
        raise

    return {
        "door": {
            "id": str(door.id),
            "fridge_id": str(door.fridge_id),
            "type": str(door.type),
            "is_locked": door.is_locked,
            "last_opened_at": door.last_opened_at,
        },
        "access": {
            "id": str(access.id),
            "door_id": str(access.door_id),
            "user_id": str(access.user_id) if access.user_id else None,
            "opened_at": access.opened_at,
            "success": access.success,
            "method": access.method,
            "reason": access.reason,
        },
    }


def get_door_status_for_user(
    db: Session,
    *,
    user_id: UUID,
    door_type: DoorType = DoorType.REAR,
    fridge_id: Optional[UUID] = None,
) -> dict:
    u = _get_active_user(db, user_id)
    fridge = _pick_fridge_for_restaurant(db, u.restaurant_id, fridge_id)
    door = _get_door(db, fridge.id, door_type)

    return {
        "id": door.id,
        "fridge_id": door.fridge_id,
        "type": door.type,
        "is_locked": door.is_locked,
        "last_opened_at": door.last_opened_at,
    }
