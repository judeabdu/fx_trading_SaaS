from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Boolean  # <--- FIX 1: Added Boolean import
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# =========================
# USERS (SaaS Tenants)
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False
    )
    password = Column(
        String(255),
        nullable=False
    )
    
    # 🚨 MONETIZATION TIER FIELD:
    # Defaults to SIGNALS_ONLY (Lower paid tier). 
    # Payment webhooks update this to AUTOMATED_EXECUTION upon authorization.
    subscription_tier = Column(
        String(50),
        default="SIGNALS_ONLY",
        nullable=False
    )

    broker_accounts = relationship(
        "BrokerAccount",
        back_populates="user"
    )


# =========================
# BROKER ACCOUNTS
# =========================
class BrokerAccount(Base):
    __tablename__ = "broker_accounts"
    
    # <--- FIX 2: Moved inside the class properly
    is_active = Column(Boolean, default=False)

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    broker_name = Column(
        String(100),
        nullable=False
    )
    api_token = Column(
        String(500),
        nullable=False
    )
    app_id = Column(
        String(100),
        nullable=False
    )
    symbols = Column(
        String(500),
        default="frxXAUUSD,frxEURUSD,frxGBPUSD"
    )
    risk_per_trade = Column(
        Float,
        default=0.01
    )
    strategy_name = Column(
        String(100),
        default="Institutional FVG"
    )

    user = relationship(
        "User",
        back_populates="broker_accounts"
    )


# =========================
# TRADE HISTORY / SIGNAL TELEMETRY
# =========================
class TradeHistory(Base):
    __tablename__ = "trade_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    symbol = Column(
        String(50)
    )
    signal = Column(
        String(20)
    )
    entry_price = Column(
        Float
    )
    exit_price = Column(
        Float
    )
    profit_loss = Column(
        Float
    )
    confidence = Column(
        Float
    )
    status = Column(
        String(20) # "WIN", "LOSS", or "SIGNAL_BROADCAST"
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )