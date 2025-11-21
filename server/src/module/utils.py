# Define your module's utils here

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# sub function to hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# sub function to de hash password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)