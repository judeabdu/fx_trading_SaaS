import threading
import time

from datetime import datetime

from database import (
    engine,
    SessionLocal
)

from models import (
    Base,
    User,
    BrokerAccount,
    TradeHistory
)

from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from sqlalchemy.orm import Session

from schemas import (
    UserCreate,
    UserLogin,
    BrokerAccountCreate
)

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

from strategy import start_strategy

app = FastAPI()

# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fx-trading-saa-s.vercel.app"
    ],
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

    print("🚀 Strategy Engine Started")

    try:

        start_strategy()

    except Exception as e:

        print(
            f"❌ Strategy Error: {e}"
        )

    finally:

        bot_running = False

        print("🛑 Strategy Stopped")

# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "Onyx Cloud Trading API Running"
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
        password=hash_password(
            user.password
        )
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
# SAVE BROKER
# =========================

@app.post("/save-broker")
def save_broker(
    broker: BrokerAccountCreate,
    db: Session = Depends(get_db)
):

    account = BrokerAccount(

        broker_name=broker.broker_name,

        api_token=broker.api_token,

        app_id=broker.app_id,

        symbols=broker.symbols,

        risk_per_trade=broker.risk_per_trade
    )

    db.add(account)

    db.commit()

    return {
        "message": "Broker saved successfully"
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
# REAL ANALYTICS
# =========================

@app.get("/analytics")
def analytics(
    db: Session = Depends(get_db)
):

    trades = db.query(
        TradeHistory
    ).all()

    total_trades = len(trades)

    wins = len([
        t for t in trades
        if t.profit_loss > 0
    ])

    losses = len([
        t for t in trades
        if t.profit_loss <= 0
    ])

    total_profit = sum([
        t.profit_loss
        for t in trades
    ])

    win_rate = (
        (wins / total_trades) * 100
        if total_trades > 0
        else 0
    )

    running_equity = 0

    chart_data = []

    for trade in trades:

        running_equity += trade.profit_loss

        chart_data.append({

            "time":
                trade.created_at.strftime(
                    "%d %b"
                ),

            "equity":
                running_equity
        })

    return {

        "win_rate":
            round(win_rate, 2),

        "total_trades":
            total_trades,

        "wins":
            wins,

        "losses":
            losses,

        "total_profit":
            round(total_profit, 2),

        "chart_data":
            chart_data
    }

# =========================
# ACCOUNT STATUS
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