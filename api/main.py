from typing import Optional

from apis import apis
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(apis, prefix="/api")

class TokenData(BaseModel):
    username: Optional[str] = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

AUTH0_DOMAIN = "your-auth0-domain"
API_IDENTIFIER = "your-api-identifier"
ALGORITHMS = ["RS256"]

def get_public_key():
    # Fetch the public key from Auth0
    pass

def verify_token(token: str):
    try:
        payload = jwt.decode(token, get_public_key(), algorithms=ALGORITHMS, audience=API_IDENTIFIER)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/public")
def public_route():
    return {"message": "This is a public route"}

@app.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    verify_token(token)
    return {"message": "This is a protected route"}
