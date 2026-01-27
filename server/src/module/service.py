from sqlalchemy.orm import Session
from .models import Restaurant, User




# Define your service crud operations here


# create a service to retrieve all restaurants
def list_restaurants(db: Session) -> list[Restaurant]:
    """
    Returns restaurants ordered by name.
    Pydantic response model will pick only the fields it needs (id, name).
    """
    return (
        db.query(Restaurant)
        .order_by(Restaurant.name.asc())
        .all()
    )


def list_users(db: Session) -> list[User]:
    """
    Returns all users in the database.
    """
    return (
        db.query(User)
        .order_by(User.email.asc())
        .all()
    )
