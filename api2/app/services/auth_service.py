import logging
import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from prisma import Prisma
from prisma.models import User

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

prisma = Prisma()


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = await prisma.user.find_unique(where={"id": int(user_id)})
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
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
        return True
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
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
    try:
        return send_email(to_email, subject, body)
    except Exception as e:
        logging.error(f"Failed to send password reset email: {str(e)}")
        return False


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
    await prisma.connect()
    user = await prisma.user.create(
        data={
            "email": email,
            "password": hashed_password,
            "fullname": fullname,
            "role": role,
            "is_verified": True,
            "created_at": datetime.utcnow(),
        }
    )
    await prisma.disconnect()
    return user


async def verify_otp(otp: str, user_id: int) -> bool:
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified.")
        
    if not user.otp_code or user.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    
    otp_created_at = user.otp_created_at
    if otp_created_at and (datetime.utcnow() - otp_created_at > timedelta(minutes=OTP_EXPIRE_MINUTES)):
        raise HTTPException(status_code=400, detail="OTP expired.")
    
    # Mark user as verified
    await prisma.user.update(
        where={"id": user_id},
        data={
            "is_verified": True,
            "otp_code": None,
            "otp_created_at": None
        }
    )
        
    return True


async def authenticate_user(email: str, password: str):
    user = await prisma.user.find_unique(where={'email': email})
    if not user:
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
        "role": user.role
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
    # Send OTP via email
    send_email(user.email, "Your OTP Code", f"Your OTP is: {otp}")
    return True


async def refresh_access_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
    
    user = await prisma.user.find_unique(where={"id": int(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_expires
    )
    return new_access_token


async def get_or_create_google_user(email: str, name: str):
    user = await prisma.user.find_unique(where={"email": email})
    if user:
        return user
    user = await prisma.user.create(
        data={
            "email": email,
            "fullname": name,
            "password": "",  # Or handle OAuth specifics
            "role": "USER",
            "is_verified": True,
            "created_at": datetime.utcnow(),
        }
    )
    return user


async def update_user_profile(user_id: int, profile_data: dict):
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
        raise HTTPException(status_code=404, detail="User not found.")
    
    updated_user = await prisma.user.update(
        where={"id": user_id},
        data=user_data
    )
    return updated_user


async def delete_user(user_id: int):
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    await prisma.user.delete(where={"id": user_id})
    return {"message": "User deleted successfully"}


async def create_audit_log(user: User, action: str, details: dict):
    log = await prisma.auditlog.create(
        data={
            "user_id": user.id,
            "action": action,
            "details": details
        }
    )
    return log


async def create_staff_user(creator: User, user_data: Dict[str, Any]):
    check_permissions(creator, "ADMIN")
    
    # Generate random password if not provided
    if not user_data.get("password"):
        user_data["password"] = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=12))
    
    hashed_password = pwd_context.hash(user_data["password"])
    
    user = await prisma.user.create(
        data={
            "email": user_data["email"],
            "fullname": user_data["name"],
            "role": user_data["role"],
            "password": hashed_password,
            "is_verified": True,
            "created_by_id": creator.id
        }
    )
    
    # Create audit log
    await create_audit_log(
        creator,
        "create_staff_user",
        {"staff_id": user.id, "role": user.role}
    )
    
    return user


async def get_current_admin(token: str = Depends(oauth2_scheme)) -> User:
    user = await get_current_user(token)
    if user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user
