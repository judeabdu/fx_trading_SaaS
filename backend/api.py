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
from sqlalchemy import text # Safely handles raw SQL actions inside SQLAlchemy 2.0

from database import engine, SessionLocal
from models import Base, User, BrokerAccount, TradeHistory
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password, create_access_token
from strategy import start_strategy

app = FastAPI()

# =========================
# CREATE DATABASE TABLES
# =========================
Base.metadata.create_all(bind=engine)

# =========================================================
# 🚀 SAFE ON-STARTUP COLUMN RUNTIME PATRICIAN MIGRATOR
# =========================================================
@app.on_event("startup")
def migrate_subscription_column_safely():
    """
    Executes after the web application server is fully listening and 
    online, patching your Render DB architecture without interrupting CORS headers.
    """
    db = SessionLocal()
    try:
        print("⏳ Verification scan: Scanning database table schema structure...")
        db.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'SIGNALS_ONLY' NOT NULL;"
        ))
        db.commit()
        print("🚀 Success: Database column 'subscription_tier' verified & patched live!")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Notice: Structural schema sync statement bypassed: {e}")
    finally:
        db.close()

# =========================
# CORS MIDDLEWARE INTERCEPTOR
# =========================
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

# =========================
# GLOBAL BOT STATE
# =========================
bot_running = False
bot_thread = None

# Stream connection pool tracking active browser canvas elements live
SIGNAL_LISTENERS = []

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
# PYDANTIC SCHEMAS
# =========================
class BrokerConnectRequest(BaseModel):
    email: str
    broker_name: str
    api_token: str
    app_id: str

# =========================
# STRATEGY LOOP
# =========================
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

# =========================
# REAL-TIME SIGNAL EMITTER (SSE INTERFACE BROADCASTER)
# =========================
@app.get("/api/signals/stream")
async def stream_live_signals(request: Request):
    """
    Persistent event streaming highway route. Keeps browser windows connected 
    and pipes strategy signals straight into React components dynamically.
    """
    async def event_generator():
        queue = asyncio.Queue()
        SIGNAL_LISTENERS.append(queue)
        print(f"📡 [STREAM HOOKED] Dashboard live link channels active: {len(SIGNAL_LISTENERS)}")
        
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                # Halt execution until the strategy engine drops an alert dictionary item
                signal_payload = await queue.get()
                yield f"data: {json.dumps(signal_payload)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            SIGNAL_LISTENERS.remove(queue)
            print(f"🧼 [STREAM CLOSED] Remaining link channels active: {len(SIGNAL_LISTENERS)}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def broadcast_signal_to_frontend(symbol: str, side: str, entry_price: float):
    """
    Thread-safe background broadcaster called by your strategy script 
    to dispatch signal alerts directly into the streaming queues.
    """
    payload = {
        "symbol": symbol.replace("frx", ""),  # Strips prefix e.g. "frxXAUUSD" -> "XAUUSD"
        "direction": side,
        "entry": f"{entry_price:.2f}",
        "time": datetime.now().strftime("%H:%M:%S")
    }
    
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    for queue in SIGNAL_LISTENERS:
        if loop and loop.is_running():
            loop.create_task(queue.put(payload))
        else:
            asyncio.run_coroutine_threadsafe(queue.put(payload), asyncio.get_event_loop())


# =========================
# HOME
# =========================
@app.get("/")
def home():
    return {"message": "Onyx Cloud Trading API Running"}

# =========================
# REGISTER
# =========================
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
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
    return {"message": "User registered successfully"}

# =========================
# LOGIN
# =========================
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )
    
    valid_password = verify_password(user.password, existing_user.password)
    if not valid_password:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token({"sub": existing_user.email})
    
    # Safe bypass fallback check avoids crashes if database schema sync is pending
    user_tier = getattr(existing_user, "subscription_tier", "SIGNALS_ONLY")
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "email": existing_user.email,
        "subscription_tier": user_tier
    }

# =========================
# SAVE BROKER ACCOUNT (FIXED)
# =========================
@app.post("/save-broker")
def save_broker(payload: BrokerConnectRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip()).first()
    if not user:
        raise HTTPException(
            status_code=442,
            detail=f"User account not found for email: {payload.email}"
        )

    existing_account = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == user.id
    ).first()

    if existing_account:
        existing_account.broker_name = payload.broker_name
        existing_account.api_token = payload.api_token
        existing_account.app_id = str(payload.app_id)  # Coerced dynamically to avoid string/int mismatches
        
        if not hasattr(existing_account, 'symbols') or not existing_account.symbols:
            existing_account.symbols = "frxXAUUSD,frxEURUSD,frxGBPUSD"
        if not hasattr(existing_account, 'risk_per_trade') or not existing_account.risk_per_trade:
            existing_account.risk_per_trade = 0.01
    else:
        account = BrokerAccount(
            user_id=user.id,
            broker_name=payload.broker_name,
            api_token=payload.api_token,
            app_id=str(payload.app_id),
            symbols="frxXAUUSD,frxEURUSD,frxGBPUSD",
            risk_per_trade=0.01
        )
        db.add(account)

    db.commit()
    return {"message": "Broker connected successfully"}

# =========================
# START BOT
# =========================
@app.post("/start-bot")
def start_bot():
    global bot_running
    global bot_thread

    if bot_running:
        return {"message": "Bot already running"}

    bot_running = True
    bot_thread = threading.Thread(target=strategy_loop)
    bot_thread.start()
    return {"message": "Bot started successfully"}

# =========================
# STOP BOT
# =========================
@app.post("/stop-bot")
def stop_bot():
    global bot_running
    bot_running = False
    return {"message": "Bot stopped successfully"}

# =========================
# BOT STATUS
# =========================
@app.get("/bot-status")
def bot_status():
    return {"running": bot_running}

# =========================
# STATUS (SYNCED FOR REACTION PATH CODES)
# =========================
@app.get("/status")
def status():
    return {
        "running": bot_running,
        "broker": "Deriv",
        "mode": "Cloud API",
        "balance": 0,
        "equity": 0,
        "profit": 0,
        "currency": "USD",
        "active_trades": []
    }

# =========================
# ANALYTICS
# =========================
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    trades = db.query(TradeHistory).all()
    total_trades = len(trades)

    if total_trades == 0:
        return {
            "win_rate": 0,
            "total_trades": 0,
            "wins": 0,
            "losses": 0,
            "total_profit": 0,
            "chart_data": []
        }

    wins = len([t for t in trades if t.profit_loss > 0])
    losses = len([t for t in trades if t.profit_loss <= 0])
    total_profit = sum([t.profit_loss for t in trades])
    win_rate = (wins / total_trades) * 100

    running_equity = 0
    chart_data = []
    for trade in trades:
        running_equity += trade.profit_loss
        chart_data.append({
            "time": trade.created_at.strftime("%d %b") if hasattr(trade, 'created_at') and trade.created_at else "N/A",
            "equity": running_equity
        })

    return {
        "win_rate": round(win_rate, 2),
        "total_trades": total_trades,
        "wins": wins,
        "losses": losses,
        "total_profit": round(total_profit, 2),
        "chart_data": chart_data
    }
    # =========================================================
# 👑 DEV UTILITY: TOGGLE MONETIZATION PAYWALL
# =========================================================
@app.post("/dev/upgrade-user")
def upgrade_user_tier(email: str, tier: str = "AUTOMATED_EXECUTION", db: Session = Depends(get_db)):
    """
     Dev endpoint to manually toggle between 'SIGNALS_ONLY' and 'AUTOMATED_EXECUTION'
    """
    user = db.query(User).filter(User.email == email.strip()).first()
    if not user:
        raise HTTPException(status_code=442, detail="User not found")
        
    user.subscription_tier = tier
    db.commit()
    return {"message": f"User {email} successfully set to {tier} tier!"}