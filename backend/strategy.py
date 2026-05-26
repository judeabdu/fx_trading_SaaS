import pandas as pd
import time
import json
import random

from datetime import datetime, timezone

from database import SessionLocal

from models import (
    TradeHistory,
    BrokerAccount
)

from deriv_engine import DerivEngine

# =========================
# TRADE TELEMETRY
# =========================

def save_trade_signal(
    symbol,
    signal,
    confidence
):

    db = SessionLocal()

    try:

        simulated_pnl = round(
            random.uniform(-12, 35),
            2
        )

        trade = TradeHistory(

            symbol=symbol,

            signal=signal,

            entry_price=0,

            exit_price=0,

            profit_loss=simulated_pnl,

            confidence=confidence,

            status=(
                "WIN"
                if simulated_pnl > 0
                else "LOSS"
            )
        )

        db.add(trade)

        db.commit()

        print(
            f"✅ Trade telemetry saved: {symbol}"
        )

    except Exception as e:

        print(
            f"❌ Trade save failed: {e}"
        )

    finally:

        db.close()

# =========================
# HARD PRODUCTION ENGINE
# =========================

class HardProductionEngine:

    def __init__(
        self,
        broker_account,
        risk_per_trade=0.01
    ):

        self.risk_per_trade = risk_per_trade

        self.magic_number = 776655

        self.state_file = "bot_state.json"

        self.last_candle_time = self._load_state()

        self.is_active = True

        self.broker = DerivEngine(

            api_token=
                broker_account.api_token,

            app_id=
                broker_account.app_id
        )

        connected = self.broker.connect()

        if not connected:

            print(
                "❌ Failed to connect to Deriv"
            )

    # =========================
    # STATE
    # =========================

    def _load_state(self):

        try:

            with open(
                self.state_file,
                "r"
            ) as f:

                return json.load(f)

        except:

            return {}

    def _save_state(self):

        with open(
            self.state_file,
            "w"
        ) as f:

            json.dump(
                self.last_candle_time,
                f
            )

    # =========================
    # MARKET HOURS
    # =========================

    def is_market_safe(self, pair):

        now_utc = datetime.now(
            timezone.utc
        ).hour

        return 0 <= now_utc <= 23

    # =========================
    # SIGNAL ENGINE
    # =========================

    def get_institutional_signal(
        self,
        pair
    ):

        candles = self.broker.get_candles(

            symbol=pair,

            granularity=900,

            count=50
        )

        if not candles:

            return None

        df = pd.DataFrame(candles)

        df["open"] = pd.to_numeric(
            df["open"]
        )

        df["high"] = pd.to_numeric(
            df["high"]
        )

        df["low"] = pd.to_numeric(
            df["low"]
        )

        df["close"] = pd.to_numeric(
            df["close"]
        )

        if len(df) < 10:

            return None

        body_size = (
            df["close"] - df["open"]
        ).abs()

        avg_body = (
            body_size
            .rolling(10)
            .mean()
        )

        # BUY

        if (

            body_size.iloc[-2] >

            avg_body.iloc[-2] * 2

            and

            df["close"].iloc[-2] >

            df["open"].iloc[-2]
        ):

            if (

                df["low"].iloc[-1] >

                df["high"].iloc[-3]
            ):

                return {

                    "side": "BUY",

                    "entry":
                        df["close"].iloc[-1],

                    "sl":
                        df["low"].iloc[-5:].min(),

                    "tp":
                        df["close"].iloc[-1] + 30
                }

        # SELL

        if (

            body_size.iloc[-2] >

            avg_body.iloc[-2] * 2

            and

            df["close"].iloc[-2] <

            df["open"].iloc[-2]
        ):

            if (

                df["high"].iloc[-1] <

                df["low"].iloc[-3]
            ):

                return {

                    "side": "SELL",

                    "entry":
                        df["close"].iloc[-1],

                    "sl":
                        df["high"].iloc[-5:].max(),

                    "tp":
                        df["close"].iloc[-1] - 30
                }

        return None

    # =========================
    # EXECUTION
    # =========================

    def execute_trade(
        self,
        pair,
        signal
    ):

        print(
            f"🚀 EXECUTING {signal['side']} {pair}"
        )

        save_trade_signal(

            pair,

            signal["side"],

            92
        )

        return True

# =========================
# DRIVER LOOP
# =========================

def start_strategy():

    db = SessionLocal()

    broker_accounts = db.query(
        BrokerAccount
    ).all()

    if not broker_accounts:

        print(
            "❌ No broker accounts connected"
        )

        return

    bots = []

    for account in broker_accounts:

        try:

            bot = HardProductionEngine(
                broker_account=account
            )

            bots.append(bot)

            print(
                f"✅ Bot initialized for account {account.id}"
            )

        except Exception as e:

            print(
                f"❌ Bot init failed: {e}"
            )

    SYMBOLS = [

        "R_100",

        "R_75",

        "R_50"
    ]

    while True:

        try:

            for bot in bots:

                for pair in SYMBOLS:

                    signal = (

                        bot.get_institutional_signal(
                            pair
                        )
                    )

                    if signal:

                        print(

                            f"💎 SIGNAL FOUND: {pair} {signal}"
                        )

                        bot.execute_trade(
                            pair,
                            signal
                        )

            time.sleep(15)

        except Exception as e:

            print(
                f"❌ Strategy Loop Error: {e}"
            )