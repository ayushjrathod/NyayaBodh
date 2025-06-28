import asyncio
import base64
import json
import logging
import os
import httpx
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from urllib.parse import urlencode
from typing import Optional, List

import jwt  # This was already here, ensure it's the correct jwt for your jose usage if different
# import requests as python_requests # Consider if this is still needed or if httpx is used elsewhere
from dotenv import load_dotenv
from fastapi import (Cookie, Depends, FastAPI, HTTPException, Query, Request,
                     Response, status, APIRouter)  # Added APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError  # This was already here
from passlib.context import CryptContext
# from prisma import Prisma # Prisma is now managed in database.py
from prisma.errors import ClientNotConnectedError
from prisma.models import User
from pydantic import BaseModel

# Import services and database
from . import auth_service as services  # Import from same directory
from .database import prisma, logger  # Import shared prisma and logger

# Load environment variables - typically done once at the application entry point
# If main.py is the entry point, this might be redundant here if already loaded in main.py
# load_dotenv() # Potentially redundant if loaded in main.py

# Configure logging - similar to load_dotenv, ensure it's configured once appropriately
# logging.basicConfig(level=logging.INFO) # Potentially redundant
# logger = logging.getLogger(__name__) # Use the imported logger

# Initialize password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Ensure bcrypt__rounds is set
)

# FastAPI setup for the router
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])  # Create an APIRouter

# OAuth2 setup - This can remain as it's specific to auth routes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")  # Adjusted tokenUrl to be relative to the router's prefix

# Constants
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')  # Unused in this file
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')  # Ensure this is correctly configured in Google Cloud Console
SECRET_KEY = os.getenv("SECRET_KEY", "your-default-secret-key")  # Ensure a strong default or require it to be set
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic Models for API requests and responses
class UserCreate(BaseModel):
    email: str
    password: str
    fullname: str
    role: str = "USER"


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    fullname: str


class OTPVerifyRequest(BaseModel):
    otp: str
    userId: int


class ResendOTPRequest(BaseModel):
    email: str


class UserOut(BaseModel):  # For admin routes, ensure fields match User model
    id: int
    email: str
    fullname: str
    role: str
    is_verified: bool
    is_google_user: bool  # Added
    # Add other fields as necessary, e.g., created_at


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserUpdateRequest(BaseModel):
    fullname: Optional[str] = None
    role: Optional[str] = None


class GoogleTokenRequest(BaseModel):
    token: str


# Helper functions (consider moving to auth_service.py if not already there and re-importing)
# These helpers for password and token creation might be duplicated from auth_service.py
# If they are, prefer using the versions from auth_service.py to avoid redundancy.

# def hash_password(password: str) -> str: # Potentially redundant
#     """Hash password using bcrypt"""
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool: # Potentially redundant
#     """Verify password hash"""
#     return pwd_context.verify(plain_password, hashed_password)

# def create_access_token(data: dict, expires_delta: timedelta = None) -> str: # Potentially redundant
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# FastAPI routes
@auth_router.post("/register", response_model=TokenResponse)  # Adjusted response model
async def register(user_data: UserCreate):  # Use Pydantic model for request body
    try:
        existing_user = await prisma.user.find_unique(where={"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,  # Use status constants
                detail="Email already registered"
            )

        user = await services.create_user(
            email=user_data.email,
            password=user_data.password,
            fullname=user_data.fullname,
            role=user_data.role
        )
        # After user creation, generate tokens
        return services.create_tokens(user)

    except HTTPException as e:  # Re-raise HTTPExceptions
        raise e
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration."
        )


@auth_router.post("/login", response_model=TokenResponse)
async def login(form_data: UserLogin, response: Response):  # Use Pydantic model
    user = await services.authenticate_user(email=form_data.email, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,  # Or 401, depending on desired UX
            detail="Account not verified. Please verify your OTP.",
        )

    token_data = services.create_tokens(user)

    # Set refresh token in an HTTPOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=token_data["refresh_token"],
        httponly=True,
        secure=True,  # Set to True in production (requires HTTPS)
        samesite="lax",  # Or "strict"
        max_age=timedelta(days=services.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()
    )
    return token_data


@auth_router.post("/verify-otp")
async def verify_otp_endpoint(otp_data: OTPVerifyRequest):  # Use Pydantic model
    try:
        verified = await services.verify_otp(otp=otp_data.otp, user_id=otp_data.userId)
        if verified:
            # Optionally, you could log the user in here by creating tokens,
            # or just confirm verification and let them log in separately.
            return {"message": "OTP verified successfully. You can now log in."}
        else:
            # This case should ideally be handled by exceptions within verify_otp
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP verification failed.")

    except HTTPException as e:
        raise e  # Re-raise HTTPExceptions from the service
    except Exception as e:
        logger.error(f"OTP Verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during OTP verification."
        )


@auth_router.post("/resend-otp")
async def resend_otp_endpoint(request_data: ResendOTPRequest):  # Use Pydantic model
    try:
        user = await prisma.user.find_unique(where={"email": request_data.email})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        if user.is_verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already verified.")

        await services.resend_otp(user.id)
        return {"message": "OTP has been resent."}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while resending OTP."
        )


@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token", httponly=True, secure=True, samesite="lax")
    return {"message": "Successfully logged out"}


@auth_router.post("/refresh", response_model=TokenResponse)  # Define a response model if needed, e.g., just new access_token
async def refresh_token_endpoint(response: Response, refresh_token: Optional[str] = Cookie(None)):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing."
        )
    try:
        new_access_token = await services.refresh_access_token(refresh_token)
        # The refresh_access_token service should return the full token structure or just the access token
        # For now, assuming it returns just the new access token string.
        # We need to fetch the user again to get other details for TokenResponse
        payload = jwt.decode(new_access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = await prisma.user.find_unique(where={"id": int(user_id)})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found for new token.")

        # Create a new full token response. The old refresh token is still valid.
        # If you want to rotate refresh tokens, that logic needs to be added.
        refreshed_token_data = {
            "access_token": new_access_token,
            "refresh_token": refresh_token,  # Or a new one if implementing rotation
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.id,
            "fullname": user.fullname
        }
        return refreshed_token_data

    except HTTPException as e:
        raise e
    except jwt.ExpiredSignatureError:  # More specific error for expired refresh token
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has expired.")
    except jwt.JWTError:  # General JWT error
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while refreshing the token."
        )


@auth_router.get("/profile", response_model=UserOut)  # Use UserOut or a more specific Profile model
async def get_profile(current_user: User = Depends(services.get_current_user)):
    # get_current_user already fetches the user object
    return current_user


@auth_router.post("/forgot-password")
async def forgot_password_endpoint(request_data: ForgotPasswordRequest):
    try:
        user = await prisma.user.find_unique(where={"email": request_data.email})
        if user:
            # Generate a password reset token (JWT is a good option)
            reset_token_payload = {
                "sub": str(user.id),
                "type": "password_reset",
                "exp": datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
            }
            reset_token = jwt.encode(reset_token_payload, SECRET_KEY, algorithm=ALGORITHM)
            reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"  # Ensure frontend route exists

            email_sent = services.send_password_reset_email(user.email, reset_link)
            if not email_sent:
                logger.error(f"Failed to send password reset email to {user.email}")
                # Don't reveal if email exists, but log the error
        # Always return a generic message to prevent email enumeration
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        # Generic message even on server error
        return {"message": "If an account with that email exists, a password reset link has been sent."}


@auth_router.post("/reset-password")
async def reset_password_endpoint(request_data: ResetPasswordRequest):
    try:
        payload = jwt.decode(request_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type.")

        user_id = int(payload.get("sub"))

        hashed_password = pwd_context.hash(request_data.new_password)

        updated_user = await prisma.user.update(
            where={"id": user_id},
            data={"password": hashed_password}
        )
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        return {"message": "Password has been reset successfully."}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password reset token has expired.")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password reset token.")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting the password."
        )


# Google OAuth Routes
@auth_router.get("/google")
async def auth_google(remember_me: bool = Query(False)):  # remember_me might not be standard, state is better
    # The 'state' parameter is crucial for security (CSRF protection) and can also carry app-specific state.
    # For simplicity, we'll use a basic state or pass 'remember_me' if needed by the callback.
    # A more robust solution would involve generating a secure, unguessable state token.
    app_state = "remember_me" if remember_me else "default_oauth_state"

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,  # This must match exactly what's in Google Cloud Console
        "response_type": "code",
        "scope": "openid email profile",  # Standard scopes
        "access_type": "offline",  # To get a refresh token from Google if needed
        "prompt": "consent",  # Can be 'select_account' or 'consent'
        "state": app_state  # Include state for CSRF protection and passing info
    }
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    auth_url_with_params = f"{google_auth_url}?{urlencode(params)}"
    return RedirectResponse(auth_url_with_params)


@auth_router.get("/google/callback", response_model=TokenResponse)  # Or a specific OAuth callback response model
async def auth_google_callback(request: Request, response: Response, code: str, state: Optional[str] = None):
    # 1. Validate the 'state' parameter if you used one for CSRF protection.
    #    (Skipped here for brevity, but important in production)

    # 2. Exchange authorization code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,  # Must match the one used in the initial auth request
        "grant_type": "authorization_code",
    }    # Using httpx for async requests (httpx already imported at top)
    async with httpx.AsyncClient() as client:
        try:
            token_r = await client.post(token_url, data=token_payload)
            token_r.raise_for_status()  # Raises an HTTPStatusError for bad responses (4xx or 5xx)
            token_json = token_r.json()
        except httpx.HTTPStatusError as exc:
            logger.error(f"Google token exchange failed: {exc.response.text}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error exchanging Google code: {exc.response.json().get('error_description', 'Unknown error')}")
        except Exception as exc:
            logger.error(f"Google token exchange request failed: {exc}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to communicate with Google for token exchange.")

    google_access_token = token_json.get("access_token")
    # id_token = token_json.get("id_token") # Contains user info, can be decoded and verified

    if not google_access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to get access token from Google.")

    # 3. Fetch user information from Google
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo" # v3 is common
    headers = {"Authorization": f"Bearer {google_access_token}"}
    async with httpx.AsyncClient() as client:
        try:
            userinfo_r = await client.get(userinfo_url, headers=headers)
            userinfo_r.raise_for_status()
            userinfo = userinfo_r.json()
        except httpx.HTTPStatusError as exc:
            logger.error(f"Google userinfo fetch failed: {exc.response.text}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error fetching user info from Google: {exc.response.json().get('error_description', 'Unknown error')}")
        except Exception as exc:
            logger.error(f"Google userinfo request failed: {exc}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to communicate with Google for user info.")

    email = userinfo.get("email")
    fullname = userinfo.get("name") or userinfo.get("given_name") # Google provides 'name', 'given_name', 'family_name'
    # picture = userinfo.get("picture") # Avatar URL

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided by Google.")

    # 4. Get or create user in your database
    user = await services.get_or_create_google_user(email=email, name=fullname)

    # 5. Create your application's tokens (access and refresh)
    app_tokens = services.create_tokens(user)

    # Set refresh token in cookie
    response.set_cookie(
        key="refresh_token",
        value=app_tokens["refresh_token"],
        httponly=True,
        secure=True, # Production
        samesite="lax",
        max_age=timedelta(days=services.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()
    )

    # Instead of redirecting with tokens in URL, return them in the response body.
    # The frontend, after being redirected to a specific callback URL (e.g., /oauth-success),
    # can then make a request to an endpoint on this backend to finalize login if needed,
    # or directly use the tokens if the callback itself returns them.
    # For a pure API, returning tokens directly is common.
    # If you must redirect to frontend with data, use query params carefully or a short-lived code.

    # Option 1: Return tokens directly (if frontend handles this post-redirect)
    # return app_tokens

    # Option 2: Redirect to a frontend page with tokens (less secure for access token)
    # auth_data_json = json.dumps(app_tokens)
    # auth_data_b64 = base64.b64encode(auth_data_json.encode('utf-8')).decode('utf-8')
    # final_redirect_url = f"{FRONTEND_URL}/oauth/callback?data={auth_data_b64}" # Frontend handles this
    # return RedirectResponse(url=final_redirect_url)

    # Option 3: (Recommended for SPAs) Redirect to a frontend route that then knows the user is authenticated
    # or makes a call to /api/auth/profile to get user data using the cookie.
    # The tokens are returned in the body of *this* /google/callback response.
    # The frontend receives this response if it initiated the OAuth flow in a popup or new tab
    # and can then store the tokens. If it was a full page redirect, the frontend page
    # loaded after redirect won't see this response directly.
    # A common pattern is to redirect to a simple frontend page that then closes the popup
    # and signals the main app, or stores a flag and redirects to the main app.

    # For now, let's assume the frontend can handle the tokens from this response if it's not a full redirect.
    # If it IS a full redirect, the frontend page at GOOGLE_REDIRECT_URI (if it's a frontend page)
    # would need to handle the 'code' and 'state' itself by calling this backend endpoint.
    # The current setup implies GOOGLE_REDIRECT_URI is this backend endpoint.

    # Returning tokens directly in the response body of the callback.
    # The client that initiated the Google login flow (e.g., a frontend) will receive this.
    return app_tokens


@auth_router.post("/google/verify", response_model=TokenResponse)
async def verify_google_token(token_request: GoogleTokenRequest):
    """Verify Google access token and login/register user"""
    try:
        logger.info(f"Starting Google token verification")
        
        # Verify the Google token using the userinfo endpoint directly
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={token_request.token}"
        
        async with httpx.AsyncClient() as client:
            try:
                user_response = await client.get(user_info_url)
                user_response.raise_for_status()
                user_data = user_response.json()
                logger.info(f"Google user data retrieved: email={user_data.get('email', 'unknown')}, name={user_data.get('name', 'unknown')}")
                
                # Validate required fields
                if not user_data.get("email") or not user_data.get("name"):
                    logger.error(f"Missing required fields in Google response: {user_data}")
                    raise HTTPException(status_code=400, detail="Invalid Google token - missing user data")
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Google API HTTP error: {e.response.status_code} - {e.response.text}")
                raise HTTPException(status_code=400, detail="Invalid Google token")
            except Exception as e:
                logger.error(f"Error calling Google API: {e}")
                raise HTTPException(status_code=500, detail="Google authentication service error")

        # Get or create user
        try:
            user = await services.get_or_create_google_user(
                email=user_data["email"],
                name=user_data["name"]
            )
            logger.info(f"User retrieved/created: email={user.email}, name={user.fullname}, id={user.id}")
        except Exception as e:
            logger.error(f"Error creating/getting user: {e}")
            raise HTTPException(status_code=500, detail="Failed to create user account")

        # Create JWT tokens
        try:
            token_data = services.create_tokens(user)
            logger.info(f"Tokens created successfully for user: {user.email}")
            return token_data
        except Exception as e:
            logger.error(f"Error creating tokens: {e}")
            raise HTTPException(status_code=500, detail="Failed to create authentication tokens")

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in Google token verification: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")


# Admin Routes (example, ensure proper admin authentication/authorization)
# These should be protected by a dependency that checks for ADMIN role.
async def get_current_admin_user(current_user: User = Depends(services.get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this action.")
    return current_user

admin_router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)])

@admin_router.get("/users", response_model=List[UserOut])
async def get_all_users():
    users = await prisma.user.find_many()
    return users

@admin_router.put("/users/{user_id}", response_model=UserOut)
async def update_user_endpoint(user_id: int, user_data: UserUpdateRequest):
    # Ensure password is not updated directly here or hash it if it is
    update_data = user_data.dict(exclude_unset=True)
    if "password" in update_data:
        # Handle password update securely, e.g., by hashing or disallowing
        del update_data["password"]  # Or use a specific service for password changes

    updated_user = await services.update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return updated_user

@admin_router.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: int):
    try:
        result = await services.delete_user(user_id)
        return result
    except HTTPException as e:  # Catch specific 404 from service
        raise e
    except Exception as e:
        logger.error(f"Admin delete user error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting user.")

# The main.py will include these routers:
# from api.app.auth_main import auth_router, admin_router
# app.include_router(auth_router)
# app.include_router(admin_router)

# Remove the lifespan and app instantiation from here, as it will be in main.py
# @asynccontextmanager
# async def lifespan(app: FastAPI): ...
# app = FastAPI(...)
# app.add_middleware(CORSMiddleware, ...
