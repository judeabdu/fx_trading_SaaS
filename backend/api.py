import threading
import asyncio
import json
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, SessionLocal
from models import Base, User, BrokerAccount, TradeHistory
from schemas import UserCreate, UserLogin
from auth import (
    hash_password,
    verify_password,
    create_access_token
)

from strategy import start_strategy

# =========================================================
# FASTAPI INIT
# =========================================================

app = FastAPI(
    title="FX Trading SaaS API",
    version="1.0.0"
)

# =========================================================
# GLOBAL STATE
# =========================================================

bot_running = False
SIGNAL_LISTENERS = []

# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================
# STARTUP EVENTS
# =========================================================

@app.on_event("startup")
def startup_tasks():

    print("🔥 APP STARTING")

    db = SessionLocal()

    try:

        # Create tables safely
        Base.metadata.create_all(bind=engine)

        # Safe migrations
        db.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS subscription_tier
            VARCHAR(50)
            DEFAULT 'SIGNALS_ONLY'
            NOT NULL;
        """))

        db.execute(text("""
            ALTER TABLE broker_accounts
            ADD COLUMN IF NOT EXISTS is_active
            BOOLEAN DEFAULT FALSE;
        """))

        db.commit()

        print("✅ Database Ready")

    except Exception as e:

        db.rollback()
        print(f"❌ Startup Error: {e}")

    finally:
        db.close()

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fx-trading-saa-s.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "FX Trading SaaS Backend Running",
        "broker": "Deriv",
        "status": "online"
    }

# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "time": str(datetime.utcnow())
    }

# =========================================================
# STATUS
# =========================================================

@app.get("/status")
def status():

    return {
        "running": bot_running,
        "broker": "Deriv",
        "mode": "Cloud API",
        "server_time": str(datetime.utcnow())
    }

# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email.strip()
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email.strip(),
        password=hashed_password,
        subscription_tier="SIGNALS_ONLY"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={
            "sub": new_user.email
        }
    )

    return {
        "message": "Registration successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "subscription_tier": new_user.subscription_tier
        }
    }

# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email.strip()
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = verify_password(
        user.password,
        db_user.password
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "subscription_tier": db_user.subscription_tier
        }
    }

# =========================================================
# STRATEGY LOOP
# =========================================================

def strategy_loop():

    global bot_running

    print("🚀 Strategy Engine Started")

    try:

        start_strategy()

    except Exception as e:

        print(f"❌ Strategy Error: {e}")

    finally:

        bot_running = False
        print("🛑 Strategy Stopped")

# =========================================================
# START BOT
# =========================================================

@app.post("/start-bot")
def start_bot(
    db: Session = Depends(get_db)
):

    global bot_running

    account = db.query(BrokerAccount).first()

    if account:
        account.is_active = True
        db.commit()

    if not bot_running:

        bot_running = True

        threading.Thread(
            target=strategy_loop,
            daemon=True
        ).start()

    return {
        "message": "Bot activated"
    }

# =========================================================
# STOP BOT
# =========================================================

@app.post("/stop-bot")
def stop_bot(
    db: Session = Depends(get_db)
):

    global bot_running

    account = db.query(BrokerAccount).first()

    if account:
        account.is_active = False
        db.commit()

    bot_running = False

    return {
        "message": "Bot deactivated"
    }

# =========================================================
# LIVE SIGNAL STREAM
# =========================================================

@app.get("/api/signals/stream")
async def stream_live_signals(
    request: Request
):

    async def event_generator():

        queue = asyncio.Queue()

        SIGNAL_LISTENERS.append(queue)

        try:

            while True:

                if await request.is_disconnected():
                    break

                signal_payload = await queue.get()

                yield f"data: {json.dumps(signal_payload)}\n\n"

        except asyncio.CancelledError:
            pass

        finally:

            if queue in SIGNAL_LISTENERS:
                SIGNAL_LISTENERS.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

# =========================================================
# ANALYTICS
# =========================================================

@app.get("/analytics")
def analytics(
    db: Session = Depends(get_db)
):

    trades = db.query(TradeHistory).all()

    total = len(trades)

    wins = len([
        t for t in trades
        if getattr(t, "profit", 0) > 0
    ])

    losses = total - wins

    win_rate = (
        (wins / total) * 100
        if total > 0 else 0
    )

    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": round(win_rate, 2)
    }

# =========================================================
# DEV UPGRADE USER
# =========================================================

@app.post("/dev/upgrade-user")
def upgrade_user_tier(
    email: str,
    tier: str = "AUTOMATED_EXECUTION",
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == email.strip()
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.subscription_tier = tier

    db.commit()

    return {
        "message": f"User {email} upgraded to {tier}"
    }
