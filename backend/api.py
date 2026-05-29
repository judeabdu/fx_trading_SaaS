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
from auth import hash_password, verify_password, create_access_token
from strategy import start_strategy

# =========================================================
# APP INIT
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
# DB SESSION
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup_tasks():
    print("🔥 APP STARTING")

    db = SessionLocal()

    try:
        Base.metadata.create_all(bind=engine)

        # Safe migration only for broker_accounts
        db.execute(text("""
            ALTER TABLE broker_accounts
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;
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
# HEALTH
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
async def register(request: Request, db: Session = Depends(get_db)):

    try:
        body = await request.json()
        print("RAW BODY:", body)

        username = body.get("username")
        email = body.get("email")
        password = body.get("password")

        if not email:
            raise HTTPException(400, "Email required")

        if not password:
            raise HTTPException(400, "Password required")

        # auto username
        if not username:
            username = email.split("@")[0]

        username = username.strip()
        email = email.strip()

        # check user
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            raise HTTPException(400, "Email already exists")

        # create user
        hashed_password = hash_password(password)

        new_user = User(
            username=username,
            email=email,
            password=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({"sub": new_user.email})

        return {
            "message": "Registration successful",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        print("REGISTER ERROR:", repr(e))
        raise HTTPException(500, "Internal server error")

# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email.strip()).first()

    if not db_user:
        raise HTTPException(401, "Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token({"sub": db_user.email})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    }

# =========================================================
# BOT START
# =========================================================

def strategy_loop():
    global bot_running

    try:
        print("🚀 Strategy Engine Started")
        start_strategy()

    except Exception as e:
        print("Strategy Error:", e)

    finally:
        bot_running = False
        print("🛑 Strategy Stopped")

@app.post("/start-bot")
def start_bot(db: Session = Depends(get_db)):

    global bot_running

    account = db.query(BrokerAccount).first()

    if account:
        account.is_active = True
        db.commit()

    if not bot_running:
        bot_running = True
        threading.Thread(target=strategy_loop, daemon=True).start()

    return {"message": "Bot activated"}

# =========================================================
# BOT STOP
# =========================================================

@app.post("/stop-bot")
def stop_bot(db: Session = Depends(get_db)):

    global bot_running

    account = db.query(BrokerAccount).first()

    if account:
        account.is_active = False
        db.commit()

    bot_running = False

    return {"message": "Bot deactivated"}

# =========================================================
# STREAM SIGNALS
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

                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"

        finally:
            if queue in SIGNAL_LISTENERS:
                SIGNAL_LISTENERS.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# =========================================================
# ANALYTICS
# =========================================================

@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):

    trades = db.query(TradeHistory).all()

    total = len(trades)
    wins = len([t for t in trades if getattr(t, "profit", 0) > 0])
    losses = total - wins

    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": round((wins / total) * 100, 2) if total else 0
    }
