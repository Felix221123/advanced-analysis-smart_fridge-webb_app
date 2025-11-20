from sqlalchemy import text
from src.database import engine

def test_connection():
    try:
        with engine.connect() as conn:
            print("Connected:", conn.execute(text("SELECT 1")).scalar() == 1)
    except Exception as e:
        print("FAILED:", e)

if __name__ == "__main__":
    test_connection()
