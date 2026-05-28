import threading
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi import Request
from sqlalchemy.orm import Session
from sqlalchemy import text 

from database import engine, SessionLocal
from models import Base, User, BrokerAccount, TradeHistory
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password, create_access_token
from strategy import start_strategy

app = FastAPI()

# Database setup
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def migrate_columns_safely():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'SIGNALS_ONLY' NOT NULL;"))
        db.commit()
    except:
        db.rollback()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://fx-trading-saa-s.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Global State
bot_running = False
SIGNAL_LISTENERS = []

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@app.get("/api/signals/stream")
async def stream_live_signals(request: Request):
    async def event_generator():
        queue = asyncio.Queue()
        SIGNAL_LISTENERS.append(queue)
        try:
            while True:
                if await request.is_disconnected(): break
                signal_payload = await queue.get()
                yield f"data: {json.dumps(signal_payload)}\n\n"
        finally:
            SIGNAL_LISTENERS.remove(queue)
    return StreamingResponse(event_generator(), media_type="text/event-stream")

def broadcast_signal_to_frontend(symbol: str, side: str, entry_price: float):
    payload = {
        "symbol": symbol.replace("frx", ""),
        "direction": side,
        "entry": f"{entry_price:.2f}",
        "time": datetime.now().strftime("%H:%M:%S")
    }
    for queue in SIGNAL_LISTENERS:
        asyncio.run_coroutine_threadsafe(queue.put(payload), asyncio.get_event_loop())

@app.post("/start-bot")
def start_bot():
    global bot_running
    if bot_running: return {"message": "Bot already running"}
    bot_running = True
    thread = threading.Thread(target=strategy_loop, daemon=True)
    thread.start()
    return {"message": "Bot started successfully"}

@app.post("/stop-bot")
def stop_bot():
    global bot_running
    bot_running = False
    return {"message": "Bot stopped successfully"}

@app.get("/status")
def status():
    return {"running": bot_running}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == user.email).first()
    if not u or not verify_password(user.password, u.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"access_token": create_access_token({"sub": u.email}), "subscription_tier": u.subscription_tier}

@app.post("/dev/upgrade-user")
def upgrade_user_tier(email: str, tier: str = "AUTOMATED_EXECUTION", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email.strip()).first()
    if not user: raise HTTPException(status_code=442, detail="User not found")
    user.subscription_tier = tier
    db.commit()
    return {"message": f"User {email} set to {tier}"}