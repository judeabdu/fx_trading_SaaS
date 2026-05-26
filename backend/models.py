from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from database import Base


# =========================
# USERS
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

    broker_accounts = relationship(
        "BrokerAccount",
        back_populates="user"
    )


# =========================
# BROKER ACCOUNTS
# =========================

class BrokerAccount(Base):

    __tablename__ = "broker_accounts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    # =========================
    # BROKER INFO
    # =========================

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

    # =========================
    # TRADING SETTINGS
    # =========================

    symbols = Column(
        String(500),
        default="frxXAUUSD,frxEURUSD"
    )

    risk_per_trade = Column(
        Float,
        default=0.01
    )

    strategy_name = Column(
        String(100),
        default="Institutional FVG"
    )

    # =========================
    # RELATIONSHIP
    # =========================

    user = relationship(
        "User",
        back_populates="broker_accounts"
    )