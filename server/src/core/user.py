# Users core functionality

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.module import models, schemas
from src.module.utils import hash_password, verify_password
from uuid import UUID 


#  functionality to create users 
def create_user(db: Session, data: schemas.UserCreate):
    # Check if restaurant exists
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == data.restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    # Check if email already exists
    existing = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = models.User(
        restaurant_id=data.restaurant_id,
        full_name=data.full_name,
        email=data.email,
        role=data.role,
        password_hash=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# functionality for users to login
def login_user(db: Session, email: str, password: str):
    # Find user
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return user


# functionality to update users in the database
def update_user(db: Session, user_id: UUID, data: schemas.UserUpdate):
    # Find user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # If restaurant is being changed, verify it exists
    if data.restaurant_id and data.restaurant_id != user.restaurant_id:
        restaurant = db.query(models.Restaurant).filter(
            models.Restaurant.id == data.restaurant_id
        ).first()
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found",
            )
        user.restaurant_id = data.restaurant_id

    # If email is being changed, ensure it's unique
    if data.email and data.email != user.email:
        existing = db.query(models.User).filter(models.User.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user.email = data.email

    # Other fields (only update if provided)
    if data.full_name is not None:
        user.full_name = data.full_name

    if data.role is not None:
        user.role = data.role

    if data.is_active is not None:
        user.is_active = data.is_active

    # Password change (hash it)
    if data.password:
        user.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return user



# functionality to delete users from the database
def delete_user(db: Session, user_id: UUID):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = False
    db.commit()
    return {"detail": "User deactivated successfully"}

