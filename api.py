from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import MetaTrader5 as mt5

from database import SessionLocal
from models import User
from schemas import UserCreate, UserLogin

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MT5
mt5.initialize()

# DATABASE SESSION
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

# HOME
@app.get("/")
def home():

    return {
        "message": "Gold Bot API Running"
    }

# REGISTER
@app.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)

    db.commit()

    return {
        "message": "User registered successfully"
    }

# LOGIN
@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    valid_password = verify_password(
        user.password,
        existing_user.password
    )

    if not valid_password:

        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    access_token = create_access_token({
        "sub": existing_user.email
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }

# STATUS
@app.get("/status")
def status():

    account = mt5.account_info()

    positions = mt5.positions_get()

    trades = []

    if positions:

        for pos in positions:

            trades.append({
                "symbol": pos.symbol,
                "type": "BUY" if pos.type == 0 else "SELL",
                "lots": pos.volume,
                "openPrice": pos.price_open,
                "profit": round(pos.profit, 2)
            })

    if account is None:

        return {
            "running": False,
            "error": "MT5 not connected"
        }

    return {
        "running": True,
        "balance": round(account.balance, 2),
        "equity": round(account.equity, 2),
        "profit": round(account.profit, 2),
        "currency": account.currency,
        "server": account.server,
        "name": account.name,
        "active_trades": trades
    }