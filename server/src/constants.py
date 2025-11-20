import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define global constants here
config = {
    "DATABASE_URL": os.getenv("DATABASE_URL"),
}