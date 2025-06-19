from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional
import os
import smtplib
import logging
import random
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from prisma.models import User
from .database import prisma, logger  # Import logger as well

# Configure passlib to use argon2 (more modern and stable)
try:
    pwd_context = CryptContext(
        schemes=["argon2", "bcrypt"],
        deprecated="auto",
        argon2__memory_cost=102400,
        argon2__time_cost=2,
        argon2__parallelism=8
    )
except Exception as e:
    logger.warning(f"Failed to initialize argon2 context: {e}")
    # Fallback to bcrypt only
    try:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    except Exception as e2:
        logger.error(f"Failed to initialize any password context: {e2}")
        # Last resort - basic bcrypt without configuration
        pwd_context = CryptContext(schemes=["bcrypt"])
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# Email configuration
EMAIL_HOST = "smtpout.secureserver.net"
EMAIL_PORT = 465
EMAIL_HOST_USER = "samyak.nahar@dolphai.in"
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")  # Ensure this is set in .env

# Token configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30
OTP_EXPIRE_MINUTES = 10
MAX_OTP_ATTEMPTS = 3

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")  # Adjusted tokenUrl to match potential prefix


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},  # Added for standard compliance
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception  # Raise exception if user_id is None
        user = await prisma.user.find_unique(where={"id": int(user_id)})
        if user is None:
            raise credentials_exception  # Raise exception if user is None
        return user
    except JWTError:
        raise credentials_exception
    except ValueError:  # Handle cases where user_id is not a valid integer
        raise credentials_exception


def send_email(to_email: str, subject: str, body: str) -> bool:
    msg = MIMEMultipart()
    msg["From"] = EMAIL_HOST_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT)
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        server.sendmail(EMAIL_HOST_USER, to_email, msg.as_string())
        server.close()
        logging.info(f"Email sent to {to_email} with subject '{subject}'")  # Added logging
        return True
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    subject = "Password Reset Request"
    body = f"""
Dear User,

You have requested to reset your password. Click the link below to reset your password:

{reset_link}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email.

Best regards,
DOLPH AI
"""
    return send_email(to_email, subject, body)  # Simplified to call send_email directly


def create_jwt_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": str(user.id)}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


async def create_user(email: str, password: str, fullname: str, role: str):
    hashed_password = pwd_context.hash(password)
    user = await prisma.user.create(
        data={
            "email": email,
            "password": hashed_password,
            "fullname": fullname,
            "role": role,
            "is_verified": True,  # Consider if new users should be verified by default or via OTP
            "created_at": datetime.utcnow(),
        }
    )
    return user


async def verify_otp(otp: str, user_id: int) -> bool:
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified.")
        
    if not user.otp_code or user.otp_code != otp:
        # Increment OTP attempt count or implement lockout logic if needed
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    
    otp_created_at = user.otp_created_at
    if otp_created_at and (datetime.utcnow() - otp_created_at > timedelta(minutes=OTP_EXPIRE_MINUTES)):
        raise HTTPException(status_code=400, detail="OTP expired.")
    
    # Mark user as verified
    await prisma.user.update(
        where={"id": user_id},
        data={
            "is_verified": True,
            "otp_code": None,  # Clear OTP after successful verification
            "otp_created_at": None  # Clear OTP timestamp
        }
    )
    return True


async def authenticate_user(email: str, password: str):
    user = await prisma.user.find_unique(where={'email': email})
    if not user:
        return None
    if not user.password:  # Handle users created via OAuth who may not have a password
         return None
    if not pwd_context.verify(password, user.password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_tokens(user):
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,  # Added user_id
        "fullname": user.fullname  # Added fullname
    }


async def resend_otp(user_id: int):
    otp = generate_otp()
    # Save OTP to database with expiration
    user = await prisma.user.update(
        where={"id": user_id},
        data={
            "otp_code": otp,
            "otp_created_at": datetime.utcnow()
        }
    )
    if not user:  # Check if user exists
        raise HTTPException(status_code=404, detail="User not found.")

    # Send OTP via email
    email_sent = send_email(user.email, "Your OTP Code", f"Your OTP is: {otp}")
    if not email_sent:
        # Handle email sending failure, perhaps log and raise an internal server error
        logging.error(f"Failed to send OTP email to {user.email} for user_id {user_id}")
        # Depending on policy, you might want to raise an HTTPException here
    return True


async def refresh_access_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token: no user_id.") # More specific error
            
    except JWTError as e: # Catch specific JWTError
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid refresh token: {e}.")
    
    user = await prisma.user.find_unique(where={"id": int(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.") # Use 404
    
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_expires
    )
    return new_access_token


async def get_or_create_google_user(email: str, name: str):
    """Get existing user or create new Google user"""
    try:
        logger.info(f"Looking for user with email: {email}")
        
        # Check if user already exists
        user = await prisma.user.find_unique(where={"email": email})
        
        if user:
            logger.info(f"Found existing user: {email}")
            # Update existing user to mark as Google user if not already
            if hasattr(user, 'is_google_user') and not user.is_google_user:
                user = await prisma.user.update(
                    where={"email": email},
                    data={"is_google_user": True}
                )
                logger.info(f"Updated user {email} to mark as Google user")
            return user
        
        # Create new user
        logger.info(f"Creating new Google user: {email}")
        
        # Prepare user data
        user_data = {
            "email": email,
            "fullname": name,
            "password": "",  # No password for Google OAuth users
            "role": "USER",  # Default role
            "is_verified": True,  # Google users are considered verified
        }
        
        # Add Google user field if it exists in schema
        try:
            user_data["is_google_user"] = True
        except:
            logger.warning("is_google_user field not available in schema")
        
        user = await prisma.user.create(data=user_data)
        logger.info(f"Successfully created Google user: {email} with ID: {user.id}")
        return user
        
    except Exception as e:
        logger.error(f"Error in get_or_create_google_user: {type(e).__name__}: {str(e)}")
        # Re-raise with more specific error message
        if "violates unique constraint" in str(e):
            raise Exception(f"User with email {email} already exists but couldn't be retrieved")
        else:
            raise Exception(f"Database error: {str(e)}")


async def update_user_profile(user_id: int, profile_data: dict):
    # Ensure 'email' is not in profile_data or handle it carefully if it is allowed to change
    if 'email' in profile_data:
        existing_user_with_email = await prisma.user.find_unique(where={'email': profile_data['email']})
        if existing_user_with_email and existing_user_with_email.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use by another account.")

    user = await prisma.user.update(
        where={"id": user_id},
        data=profile_data
    )
    return user


async def update_user_preferences(user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
    prefs = await prisma.preferences.upsert(
        where={"user_id": user_id},
        update=preferences,
        create={**preferences, "user": {"connect": {"id": user_id}}}
    )
    return prefs


def check_permissions(user: User, required_role: str) -> None:
    if not user or user.role != required_role:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")


async def get_users_by_role(role: Optional[str] = None) -> List[User]:
    if role:
        users = await prisma.user.find_many(where={"role": role})
    else:
        users = await prisma.user.find_many()
    return users


async def update_user(user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        return None # Or raise HTTPException(status_code=404, detail="User not found")
    
    # Handle password hashing if password is being updated
    if "password" in user_data and user_data["password"]:
        user_data["password"] = pwd_context.hash(user_data["password"])
    elif "password" in user_data: # If password is empty or None, remove it to avoid issues
        del user_data["password"]

    updated_user = await prisma.user.update(
        where={"id": user_id},
        data=user_data
    )
    return updated_user


async def delete_user(user_id: int):
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Add any related data cleanup here if necessary (e.g., audit logs, preferences)
    await prisma.user.delete(where={"id": user_id})
    return {"message": "User deleted successfully"}


async def create_audit_log(user: User, action: str, details: dict):
    log = await prisma.auditlog.create(
        data={
            "user_id": user.id,
            "action": action,
            "details": details # Ensure details is a JSON serializable dict
        }
    )
    return log


async def create_staff_user(creator: User, user_data: Dict[str, Any]):
    check_permissions(creator, "ADMIN") # Ensure creator has ADMIN role
    
    # Generate random password if not provided
    if not user_data.get("password"):
        user_data["password"] = secrets.token_urlsafe(12) # Generate a secure random password
        # Consider logging this password or sending it to the new user securely
    
    hashed_password = pwd_context.hash(user_data["password"])
    
    user = await prisma.user.create(
        data={
            "email": user_data["email"],
            "fullname": user_data["name"], # Ensure 'name' key exists or use 'fullname'
            "role": user_data["role"], # Ensure 'role' key exists
            "password": hashed_password,
            "is_verified": True, # Staff users are typically pre-verified
            "created_by_id": creator.id
        }
    )
    
    # Create audit log
    await create_audit_log(
        creator,
        "create_staff_user",
        {"staff_user_id": user.id, "role": user.role} # Corrected key to staff_user_id
    )
    
    return user


async def get_current_admin(token: str = Depends(oauth2_scheme)) -> User:
    user = await get_current_user(token)
    if user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user
