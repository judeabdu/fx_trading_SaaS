from pydantic import BaseModel


# =========================================================
# USER SCHEMAS
# =========================================================

class UserCreate(BaseModel):

    username: str

    email: str

    password: str


class UserLogin(BaseModel):

    email: str

    password: str


# =========================================================
# BROKER ACCOUNT SCHEMAS
# =========================================================

class BrokerAccountCreate(BaseModel):

    broker_name: str

    api_token: str

    app_id: str

    symbols: str

    risk_per_trade: float


# =========================================================
# OPTIONAL RESPONSE SCHEMAS
# =========================================================

class BrokerResponse(BaseModel):

    message: str


class AuthResponse(BaseModel):

    message: str

    access_token: str

    token_type: str

    user: dict


class StatusResponse(BaseModel):

    running: bool

    broker: str

    mode: str

    server_time: str
