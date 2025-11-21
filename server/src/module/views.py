# Define your module's routes here

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from . import schemas
from src.core import user


router = APIRouter()
router = APIRouter(prefix="/users", tags=["Users"])

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