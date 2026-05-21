import time
import pandas as pd
import MetaTrader5 as mt5

from strategy import HardProductionEngine
from config import SYMBOLS

SYMBOL = "XAUUSD"
HTF = mt5.TIMEFRAME_H1
LTF = mt5.TIMEFRAME_M5

bot = HardProductionEngine(123456, "pass", "server", 0.01)

def get_df(symbol, tf, bars=100):
    rates = mt5.copy_rates_from_pos(symbol, tf, 0, bars)
    if rates is None:
        return None

    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    return df

def run_orchestrator():
    if not mt5.initialize():
        print("❌ MT5 failed")
        return

    if not bot.connect():
        print("❌ Bot connect failed")
        return

    print("🚀 BOT RUNNING")

    while bot.is_active:
        try:

            bias = bot.get_event_confirmed_fractal(SYMBOL, HTF)

            positions = mt5.positions_get(symbol=SYMBOL)
            if positions is None:
                positions = []

            if len(positions) == 0:
                df = get_df(SYMBOL, LTF)
                if df is None:
                    time.sleep(2)
                    continue

                latest = df.iloc[-1]
                prev = df.iloc[-20:-1]

                high = prev['high'].max()
                low = prev['low'].min()

                signal = None
                body = abs(latest['open'] - latest['close'])

                if bias == "BULLISH_BIAS" and latest['close'] > high:
                    wick = min(latest['open'], latest['close']) - latest['low']
                    if wick > body * 1.5:
                        signal = "BUY"

                if bias == "BEARISH_BIAS" and latest['close'] < low:
                    wick = latest['high'] - max(latest['open'], latest['close'])
                    if wick > body * 1.5:
                        signal = "SELL"

                if signal:
                    tr = (df['high'] - df['low']).rolling(14).mean().iloc[-1]
                    entry = latest['close']
                    sl = entry - tr * 3.5 if signal == "BUY" else entry + tr * 3.5
                    tp = entry + tr * 7 if signal == "BUY" else entry - tr * 7

                    print(f"💎 {signal} SIGNAL")

                    bot.execute_hardened(SYMBOL, signal, sl, tp)

            print(f"🛰️ Bias: {bias} | Positions: {len(positions)}", end="\r")

            time.sleep(10)

        except Exception as e:
            print("⚠️", e)
            time.sleep(3)

    mt5.shutdown()

if __name__ == "__main__":
    run_orchestrator()