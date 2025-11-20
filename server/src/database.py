# Define database connection here

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.constants import config

engine = create_engine(
    config["DATABASE_URL"],
    echo=True,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

