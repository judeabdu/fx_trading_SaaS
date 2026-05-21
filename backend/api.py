import threading
import time

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import MetaTrader5 as mt5

from database import SessionLocal
from models import User, MT5Account
from schemas import UserCreate, UserLogin, MT5AccountCreate

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

from mt5_connector import connect_mt5

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# GLOBAL BOT STATE
# =========================
bot_running = False
bot_thread = None

# =========================
# DATABASE SESSION
# =========================
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

# =========================
# STRATEGY LOOP
# =========================
def strategy_loop():

    global bot_running

    print("🚀 Strategy started")

    while bot_running:

        try:

            account = mt5.account_info()

            if account:

                print(
                    f"✅ Running on account {account.login} | Balance: {account.balance}"
                )

                # ==================================
                # YOUR STRATEGY LOGIC GOES HERE
                # ==================================

                positions = mt5.positions_get()

                if positions:

                    print(f"📈 Active trades: {len(positions)}")

            else:

                print("❌ MT5 disconnected")

        except Exception as e:

            print(f"❌ Strategy Error: {e}")

        time.sleep(5)

    print("🛑 Strategy stopped")

# =========================
# HOME
# =========================
@app.get("/")
def home():

    return {
        "message": "Gold Bot API Running"
    }

# =========================
# REGISTER
# =========================
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

# =========================
# LOGIN
# =========================
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

# =========================
# CONNECT MT5
# =========================
@app.post("/connect-mt5")
def connect_account(
    account: MT5AccountCreate,
    db: Session = Depends(get_db)
):

    connected = connect_mt5(
        account.login,
        account.password,
        account.server
    )

    if not connected:

        raise HTTPException(
            status_code=400,
            detail="MT5 connection failed"
        )

    existing = db.query(MT5Account).filter(
        MT5Account.user_id == 1
    ).first()

    if existing:

        existing.login = account.login
        existing.password = account.password
        existing.server = account.server

    else:

        mt5_account = MT5Account(
            user_id=1,
            login=account.login,
            password=account.password,
            server=account.server
        )

        db.add(mt5_account)

    db.commit()

    return {
        "message": "MT5 account connected successfully"
    }

# =========================
# START BOT
# =========================
@app.post("/start-bot")
def start_bot():

    global bot_running
    global bot_thread

    if bot_running:

        return {
            "message": "Bot already running"
        }

    bot_running = True

    bot_thread = threading.Thread(
        target=strategy_loop
    )

    bot_thread.start()

    return {
        "message": "Bot started successfully"
    }

# =========================
# STOP BOT
# =========================
@app.post("/stop-bot")
def stop_bot():

    global bot_running

    bot_running = False

    return {
        "message": "Bot stopped successfully"
    }

# =========================
# BOT STATUS
# =========================
@app.get("/bot-status")
def bot_status():

    return {
        "running": bot_running
    }

# =========================
# ACCOUNT STATUS
# =========================
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