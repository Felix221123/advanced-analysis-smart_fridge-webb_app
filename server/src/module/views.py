

# Router definition
router = APIRouter(prefix="/users", tags=["Users"])
service_router = APIRouter(prefix="/service", tags=["Api Services"])


# ---------- Your existing routes ----------
@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.post("/create", response_model=schemas.UserRead)
def create_user_endpoint(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return user.create_user(db, payload)

@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    return user.login_user(db, payload.email, payload.password)

