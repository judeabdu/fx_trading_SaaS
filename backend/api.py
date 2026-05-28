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

# Database setup
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def migrate_subscription_column_safely():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'SIGNALS_ONLY' NOT NULL;"))
        db.execute(text("ALTER TABLE broker_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ Notice: Schema sync issue: {e}")
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

# Strategy Loop
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

# SSE Stream
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

# Start/Stop Logic
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
        threading.Thread(target=strategy_loop, daemon=True).start()
    return {"message": "Bot activated"}

@app.post("/stop-bot")
def stop_bot(db: Session = Depends(get_db)):
    global bot_running
    account = db.query(BrokerAccount).first()
    if account:
        account.is_active = False
        db.commit()
    bot_running = False
    return {"message": "Bot deactivated"}

@app.get("/status")
def status():
    return {"running": bot_running, "broker": "Deriv", "mode": "Cloud API"}

# Analytics & Dev
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    trades = db.query(TradeHistory).all()
    # ... [Your existing analytics logic remains here] ...
    return {"win_rate": 0, "total_trades": len(trades)} 

@app.post("/dev/upgrade-user")
def upgrade_user_tier(email: str, tier: str = "AUTOMATED_EXECUTION", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email.strip()).first()
    if not user: raise HTTPException(status_code=442, detail="User not found")
    user.subscription_tier = tier
    db.commit()
    return {"message": f"User {email} set to {tier}"}