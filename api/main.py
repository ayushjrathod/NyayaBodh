import asyncio
import base64
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from urllib.parse import urlencode

import jwt
import requests as python_requests
from dotenv import load_dotenv
from fastapi import (Cookie, Depends, FastAPI, HTTPException, Query, Request,
                     Response, status)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from passlib.context import CryptContext
from prisma import Prisma
from prisma.errors import ClientNotConnectedError
from pydantic import BaseModel
from services import (authenticate_user, create_tokens, create_user,
                      get_current_user, refresh_access_token)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

# Initialize Prisma client
prisma = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database connections with retry logic"""
    retries = 5
    retry_delay = 1
    
    for attempt in range(retries):
        try:
            logger.info(f"Connecting to database (attempt {attempt + 1}/{retries})")
            await prisma.connect()
            logger.info("Database connection successful")
            break
        except Exception as e:
            if attempt == retries - 1:
                logger.error(f"Failed to connect after {retries} attempts: {e}")
                raise
            logger.warning(f"Connection failed: {e}")
            await asyncio.sleep(retry_delay)
    
    try:
        yield
    finally:
        await prisma.disconnect()
        logger.info("Database disconnected")

# FastAPI setup
app = FastAPI(
    title="Authentication API",
    description="API for user authentication and management",
    debug=True,
    lifespan=lifespan
)

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be explicit about allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)


# Constants
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
SECRET_KEY = os.getenv("SECRET_KEY", "secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Routes and logic (example Google OAuth route shown)
@app.get("/auth/google")
async def auth_google(remember_me: bool = Query(False)):
    redirect_uri = GOOGLE_REDIRECT_URI
    google_auth_endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": "remember_me" if remember_me else "regular"
    }
    url = f"{google_auth_endpoint}?{urlencode(params)}"
    return RedirectResponse(url)

@app.post("/api/auth/check-oauth")
async def check_oauth(email: str):
    user = await prisma.user.find_unique(
        where={"email": email}
    )
    return {
        "isOAuthUser": user.is_google_user if user else False
    }

@app.get("/auth/google/callback")
async def auth_google_callback(request: Request, response: Response, code: str, state: str):
    redirect_uri = GOOGLE_REDIRECT_URI
    token_endpoint = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    # Exchange authorization code for access token
    token_response = await aiohttp_post(token_endpoint, data=token_data)
    token_json = await token_response.json()

    if 'error' in token_json:
        raise HTTPException(status_code=400, detail=f"Error from Google: {token_json.get('error_description', 'Unknown error')}")

    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to obtain access token from Google")

    # Fetch user information using access token
    userinfo_endpoint = 'https://www.googleapis.com/oauth2/v2/userinfo'
    userinfo_response = await aiohttp_get(
        userinfo_endpoint,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    userinfo = await userinfo_response.json()

    if 'error' in userinfo:
        raise HTTPException(status_code=400, detail=f"Error fetching user info: {userinfo.get('error_description', 'Unknown error')}")

    email = userinfo.get('email')
    fullname = userinfo.get('fullname', '')

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # Check if user exists, or create new Google user
    user = await prisma.user.upsert(
        where={"email": email},
        update={},
        create={
            "email": email,
            "fullname": fullname,
            "is_google_user": True
        }
    )

    # Generate tokens
    access_token = services.create_access_token(user.id)
    refresh_token = services.create_refresh_token(user.id)
    expires_in = 3600  # Example expiration time

    # Prepare auth data
    auth_data = {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullname": user.fullname,
            "is_google_user": True,
            "avatar_url": userinfo.get('picture')
        }
    }

    auth_data_json = json.dumps(auth_data)
    auth_data_b64 = base64.b64encode(auth_data_json.encode('utf-8')).decode('utf-8')
    redirect_url = f"{FRONTEND_URL}/oauth/callback?data={auth_data_b64}"

    return RedirectResponse(url=redirect_url)



@app.post("/api/auth/register")
async def register(request: Request):
    try:
        # Parse request data
        data = await request.json()
        
        # Extract and validate required fields
        email = data.get("email")
        password = data.get("password")
        fullname = data.get("fullname")  # Match frontend field name
        role = data.get("role")

        # Validate required fields
        if not all([email, password, fullname, role]):
            raise HTTPException(
                status_code=400,
                detail="Missing required fields"
            )
        

        # Check for existing user
        existing_user = await prisma.user.find_unique(
            where={"email": email}
        )
        print(existing_user)
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        print("hi")
        # Create new user
        user = await create_user(email, password, fullname, role)
        print(user)
        # Generate access token
        access_token = create_access_token({"sub": str(user.id)})
        print(access_token)
        return {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "fullname": user.fullname,
                "role": user.role
            }
        }

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/auth/verify-otp")
async def verify_otp(request: Request):
    try:
        # Extract data from request
        data = await request.json()
        otp = data.get("otp")
        userId = data.get("userId")
        
        # Verify OTP
        otp_verified = await services.verify_otp(otp, userId)
        
        if otp_verified:
            # Fetch user from database using Prisma
            user = await prisma.user.find_unique(where={"id": userId})
            if user:
                # Create access and refresh tokens
                access_token, refresh_token, expires_in = services.create_tokens(user)
                return {
                    "token": access_token,
                    "expires_in": expires_in
                }
            else:
                raise HTTPException(status_code=404, detail="User not found")
        
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="OTP verification failed")


@app.post("/api/auth/login")
async def login(request: Request):
    """Handle user login"""
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise HTTPException(
                status_code=400,
                detail="Missing email or password"
            )

        # Find user
        user = await prisma.user.find_unique(
            where={"email": email}
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        # Verify password
        if not pwd_context.verify(password, user.password):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)}
        )

        # Return user data without password
        return {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "fullname": user.fullname,
                "role": user.role,
                "is_verified": user.is_verified
            }
        }

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}


@app.get("/users/{user_id}")
async def read_user(user_id: int):
    user = await prisma.user.find_unique(
        where={'id': user_id}
    )
    return user

# Admin routes
class UserOut(BaseModel):
    id: int
    email: str
    fullname: str
    role: str
    is_verified: bool

class User(BaseModel):
    id: int
    email: str
    fullname: str
    role: str
    is_verified: bool
    
from typing import List

from services import get_current_admin


@app.get("/api/admin/users", response_model=List[UserOut])
async def get_all_users(current_user: User = Depends(get_current_admin)):
    users = await prisma.user.find_many()
    return users

class RoleUpdate(BaseModel):
    role: str

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: int, role_data: RoleUpdate, current_user: User = Depends(get_current_admin)):
    updated_user = await prisma.user.update(
        where={'id': user_id},
        data={'role': role_data.role}
    )
    return updated_user

@app.post("/api/auth/resend-otp")
async def resend_otp(request: Request):
    try:
        # Extract data from request
        data = await request.json()
        userId = data.get("userId")
        
        # Use Prisma to find the user by ID
        user = await prisma.user.find_unique(where={"id": userId})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Call the service to resend the OTP
        result = services.resend_otp(user)
        
        return result

    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resend OTP")


@app.get("/api/auth/profile")
async def get_profile(current_user=Depends(get_current_user)):
    return current_user

@app.put("/api/user/profile")
async def update_profile(profile_data: dict, current_user=Depends(get_current_user)):
    updated_user = await update_user_profile(current_user.id, profile_data)
    return updated_user

@app.post("/api/auth/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        # Use Prisma to refresh the access token
        new_access_token = await services.refresh_access_token(refresh_token)
        
        return {"access_token": new_access_token, "token_type": "bearer"}
    
    except Exception as e:
        logger.error(f"Error refreshing access token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refresh token")


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    try:
        # Check if the user exists using Prisma
        user = await prisma.user.find_unique(where={"email": request.email})
        
        if user:
            # Create the reset token
            token = services.create_jwt_token(user, expires_delta=timedelta(hours=24))
            reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
            
            # Send the reset email
            if services.send_password_reset_email(user.email, reset_link):
                return {"message": "If the email exists, a reset link will be sent"}
            raise HTTPException(status_code=500, detail="Failed to send reset email")
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(status_code=500, detail="Password reset failed")
    
    return {"message": "If the email exists, a reset link will be sent"}


@app.post("/api/auth/reset-password")
async def reset_password(token: str, new_password: str):
    try:
        # Decode the token
        payload = jwt.decode(token, services.SECRET_KEY, algorithms=[services.ALGORITHM])
        email = payload.get("sub")
        
        # Find user by email using Prisma
        user = await prisma.user.find_unique(where={"email": email})
        
        if user:
            # Hash and update the new password
            user.hashed_password = services.pwd_context.hash(new_password)
            
            # Update the user's password in Prisma
            await prisma.user.update(
                where={"id": user.id},
                data={"hashed_password": user.hashed_password}
            )
            return {"message": "Password reset successful"}
        
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    raise HTTPException(status_code=404, detail="User not found")

# Add error handling for database connections
@app.exception_handler(Exception)
async def database_exception_handler(request, exc):
    if "Connection" in str(exc):
        return JSONResponse(
            status_code=503,
            content={"detail": "Database connection error"}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )


# Add database connection check middleware
@app.middleware("http")
async def db_connection_check(request: Request, call_next):
    try:
        if not prisma.is_connected():
            await prisma.connect()
        return await call_next(request)
    except Exception as e:
        logger.error(f"Database connection error in middleware: {e}")
        return JSONResponse(
            status_code=503,
            content={"detail": "Database connection error"}
        )
