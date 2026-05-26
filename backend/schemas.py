from pydantic import BaseModel


# =========================
# USER SCHEMAS
# =========================

class UserCreate(BaseModel):

    email: str

    password: str


class UserLogin(BaseModel):

    email: str

    password: str


# =========================
# BROKER ACCOUNT SCHEMAS
# =========================

class BrokerAccountCreate(BaseModel):

    broker_name: str

    api_token: str

    app_id: str

    symbols: str

    risk_per_trade: float


# =========================
# OPTIONAL RESPONSE SCHEMA
# =========================

class BrokerResponse(BaseModel):

    message: str