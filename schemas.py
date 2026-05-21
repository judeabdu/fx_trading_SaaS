from pydantic import BaseModel

class UserCreate(BaseModel):

    email: str

    password: str

class UserLogin(BaseModel):

    email: str

    password: str

class MT5AccountCreate(BaseModel):

    login: str

    password: str

    server: str