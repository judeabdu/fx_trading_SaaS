import threading
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, SessionLocal
from models import Base, User, BrokerAccount, TradeHistory
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password, create_access_token
from strategy import start_strategy

app = FastAPI()

# =========================================================
# DATABASE SETUP
# =========================================================
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def migrate_subscription_column_safely():
    db = SessionLocal()
    try:
        db.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_tier 
            VARCHAR(50) DEFAULT 'SIGNALS_ONLY' NOT NULL;
        """))

        db.execute(text("""
            ALTER TABLE broker_accounts 
            ADD COLUMN IF NOT EXISTS is_active 
            BOOLEAN DEFAULT FALSE;
        """))

        db.commit()

    except Exception as e:
        db.rollback()
        print(f"⚠️ Notice: Schema sync issue: {e}")

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
# AUTH ROUTES
# =========================================================

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email.strip()
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
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

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        User.email == user.email.strip()
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password):
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
# SSE STREAM
# =========================================================
@app.get("/api/signals/stream")
async def stream_live_signals(request: Request):

    async def event_generator():

        queue = asyncio.Queue()
        SIGNAL_LISTENERS.append(queue)

        try:
            while True:

                if await request.is_disconnected():
                    break

                signal_payload = await queue.get()

                yield f"data: {json.dumps(signal_payload)}\n\n"

        finally:
            SIGNAL_LISTENERS.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

# =========================================================
# START BOT
# =========================================================
@app.post("/start-bot")
def start_bot(db: Session = Depends(get_db)):

    global bot_running

    # Update DB Switch
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
def stop_bot(db: Session = Depends(get_db)):

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
# ANALYTICS
# =========================================================
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):

    trades = db.query(TradeHistory).all()

    wins = len([t for t in trades if getattr(t, "profit", 0) > 0])

    total = len(trades)

    win_rate = (wins / total * 100) if total > 0 else 0

    return {
        "win_rate": round(win_rate, 2),
        "total_trades": total
    }

# =========================================================
# DEV TOOLS
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
        "message": f"User {email} set to {tier}"
    }

# =========================================================
# ROOT
# =========================================================
@app.get("/")
def root():

    return {
        "message": "FX Trading SaaS Backend Running"
    }
