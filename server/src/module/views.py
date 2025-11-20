# Define your module's routes here

from fastapi import APIRouter
from . import utils, service, models


router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Hello World"}
