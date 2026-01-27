# Define your module's routes here

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from . import schemas
from src.core import user
from . import service as services
from uuid import UUID


router = APIRouter()
router = APIRouter(prefix="/users", tags=["Users"])
service_router = APIRouter(prefix="/service", tags=["Api Services"])


# default
@router.get("/")
async def root():
    return {"message": "Hello World"}



# ---------- Users Endpoint Route ----------

# endpoint to create users logic
@router.post("/create", response_model=schemas.UserRead)
def create_user_endpoint(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    return user.create_user(db, payload)


# endpoint to login users logic
@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    return user.login_user(db, payload.email, payload.password)


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


# api to retrieve to all users from the database
@router.get("/all_users", response_model=list[schemas.UserOption])
def get_all_users(db: Session = Depends(get_db)):
    return services.list_users(db)

