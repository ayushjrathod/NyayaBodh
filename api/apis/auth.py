from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from prisma import Prisma
from pydantic import BaseModel
from utils.auth import create_access_token, encrypt_password, validate_password

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Constants
SECRET_KEY = "your-secret-key-here"  # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class SignInRequest(BaseModel):
    username: str
    password: str

class SignUpRequest(BaseModel):
    username: str
    password: str
    name: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
async def get_user_by_username(username: str):
    async with Prisma() as prisma:
        return await prisma.user.find_unique(where={"username": username})

async def create_user(user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    async with Prisma() as prisma:
        return await prisma.user.create(
            data={
                "username": user.username,
                "password": hashed_password
            }
        )

async def authenticate_user(username: str, password: str):
    user = await get_user_by_username(username)
    if not user:
        return False
    if not pwd_context.verify(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Endpoints
@router.post("/auth/sign-in", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    async with Prisma() as prisma:
        user = await prisma.user.find_unique(where={"username": request.username})
        password = validate_password(request.password, user.password)
        if not user or not password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(user.id)
        return AuthResponse(
            access_token=access_token,
            user=user.dict()
        )

@router.post("/auth/sign-up", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    async with Prisma() as prisma:
        existing_user = await prisma.user.find_unique(where={"username": request.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_password = encrypt_password(request.password)
        user = await prisma.user.create(
            data={
                "username": request.username,
                "password": hashed_password,
                "name": request.name
            }
        )
        
        access_token = create_access_token(user.id)
        return AuthResponse(
            access_token=access_token,
            user=user.dict()
        )

@router.post("/register")
async def register_user(user: UserCreate):
    db_user = await get_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await create_user(user)

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

@router.get("/verify-token/{token}")
async def verify_user_token(token: str):
    await verify_token(token)
    return {"message": "Token is valid"}
