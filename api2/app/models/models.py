from pydantic import BaseModel


class UserIn(BaseModel):
    email: str
    password: str
    fullname: str
    role: str = "user"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
