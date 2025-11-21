# Users core functionality

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.module import models, schemas
from src.module.utils import hash_password, verify_password



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