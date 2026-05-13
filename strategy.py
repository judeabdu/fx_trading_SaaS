import MetaTrader5 as mt5
import pandas as pd
import time
import json
import os
from datetime import datetime, timedelta, timezone

class HardProductionEngine:
    def __init__(self, account_id, password, server, risk_per_trade=0.01):
        self.account = account_id
        self.password = password
        self.server = server
        self.risk_per_trade = risk_per_trade
        self.magic_number = 776655
        
        self.state_file = "bot_state.json"
        self.last_candle_time = self._load_state() # PERSISTENT STATE ENGINE
        self.is_active = True

    # --- 1. PERSISTENT STATE ENGINE ---
    def _load_state(self):
        """Recover context after a crash or restart"""
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, "r") as f:
                    return json.load(f)
            except: return {}
        return {}

    def _save_state(self):
        """Save trade context to disk"""
        with open(self.state_file, "w") as f:
            json.dump(self.last_candle_time, f)

    def connect(self):
        if not mt5.initialize(): return False
        if not mt5.login(self.account, self.password, self.server): return False
        return True

    # --- 2. MARKET SAFEGUARD & SLIPPAGE MODEL ---
    def is_market_safe(self, pair):
        # CORRECTED LINE BELOW
        now_utc = datetime.now(timezone.utc).hour
        if not (7 <= now_utc < 20): return False 
        
        tick = mt5.symbol_info_tick(pair)
        symbol = mt5.symbol_info(pair)
        
        # SLIPPAGE MODEL: Calculate current spread vs 24h average
        rates = mt5.copy_rates_from_pos(pair, mt5.TIMEFRAME_M15, 0, 96)
        if rates is None or len(rates) == 0: return False
        
        avg_spread_points = sum((r[4]-r[1]) for r in rates) / len(rates)
        curr_spread = (tick.ask - tick.bid) / symbol.point
        
        if curr_spread > (avg_spread_points * 2): # Volatility/News Spike
            return False
            
        return True

    # --- 3. REFINED FVG RETEST LOGIC ---
    def get_institutional_signal(self, pair):
        rates = mt5.copy_rates_from_pos(pair, mt5.TIMEFRAME_M15, 0, 50)
        if not rates or len(rates) < 10: return None
        df = pd.DataFrame(rates)
        
        body_size = (df['close'] - df['open']).abs()
        avg_body = body_size.rolling(10).mean()
        
        # BULLISH FVG + RETEST MODEL
        if body_size.iloc[-2] > (avg_body.iloc[-2] * 2) and df['close'].iloc[-2] > df['open'].iloc[-2]:
            if df['low'].iloc[-1] > df['high'].iloc[-3]: # Unfilled FVG
                fvg_top = df['high'].iloc[-3]
                fvg_bottom = df['low'].iloc[-1]
                entry_price = (fvg_top + fvg_bottom) / 2
                
                sl = df['low'].iloc[-5:].min()
                tp = entry_price + (abs(entry_price - sl) * 3)
                return {"side": "BUY", "entry": entry_price, "sl": sl, "tp": tp}

        # BEARISH FVG + RETEST MODEL
        if body_size.iloc[-2] > (avg_body.iloc[-2] * 2) and df['close'].iloc[-2] < df['open'].iloc[-2]:
            if df['high'].iloc[-1] < df['low'].iloc[-3]:
                fvg_bottom = df['low'].iloc[-3]
                fvg_top = df['high'].iloc[-1]
                entry_price = (fvg_top + fvg_bottom) / 2
                
                sl = df['high'].iloc[-5:].max()
                tp = entry_price - (abs(entry_price - sl) * 3)
                return {"side": "SELL", "entry": entry_price, "sl": sl, "tp": tp}

        return None

    # --- 4. EXECUTION LAYER ---
    def execute_limit_order(self, pair, signal):
        """Sends a Limit Order to wait for the FVG Retest"""
        lots = self._calculate_dynamic_lots(pair, signal['sl'])
        
        request = {
            "action": mt5.TRADE_ACTION_PENDING,
            "symbol": pair,
            "volume": float(lots),
            "type": mt5.ORDER_TYPE_BUY_LIMIT if signal['side'] == "BUY" else mt5.ORDER_TYPE_SELL_LIMIT,
            "price": float(signal['entry']),
            "sl": float(signal['sl']),
            "tp": float(signal['tp']),
            "magic": self.magic_number,
            "comment": "ONYX_FINAL_V4",
            "type_time": mt5.ORDER_TIME_DAY, 
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)
        
        # --- EXECUTION FEEDBACK LOG ---
        if result is not None:
            print(f"📤 ORDER RESULT: {result.retcode} | {result.comment}")
            self._log_trade(pair, signal, result)
            return result.retcode == mt5.TRADE_RETCODE_DONE
        return False

    def _log_trade(self, pair, signal, result):
        log = {
            "time": str(datetime.now()),
            "pair": pair,
            "side": signal['side'],
            "entry": signal['entry'],
            "status": result.comment,
            "code": result.retcode
        }
        with open("trade_history.json", "a") as f:
            f.write(json.dumps(log) + "\n")

    def _calculate_dynamic_lots(self, pair, sl):
        symbol = mt5.symbol_info(pair)
        risk_val = mt5.account_info().equity * self.risk_per_trade
        tick_val = symbol.trade_tick_value
        price_dist = abs(mt5.symbol_info_tick(pair).bid - sl)
        if price_dist == 0: return symbol.volume_min
        raw_lots = risk_val / ( (price_dist / symbol.point) * tick_val )
        return max(symbol.volume_min, min(symbol.volume_max, round(raw_lots, 2)))

    # --- 5. MANAGEMENT & CORRELATION ---
    def manage_active_exposure(self):
        positions = mt5.positions_get(magic=self.magic_number)
        orders = mt5.orders_get(magic=self.magic_number)
        pos_count = len(positions) if positions else 0
        ord_count = len(orders) if orders else 0
        return pos_count + ord_count

# --- 6. DRIVER LOOP ---
if __name__ == "__main__":
    SYMBOLS = ["XAUUSDm", "EURUSDm", "GBPUSDm"]
    
    bot = HardProductionEngine(
        435857096,
        "Iloveliz22$$",
        "Exness-MT5Trial9"
    )
    
    if bot.connect():
        print("🚀 HardProduction Engine v4.0 Active.")
        try:
            while bot.is_active:
                for pair in SYMBOLS:
                    rates = mt5.copy_rates_from_pos(pair, mt5.TIMEFRAME_M15, 0, 1)
                    if not rates: continue
                    
                    # New Candle & State Save
                    if bot.last_candle_time.get(pair) != rates[0][0]:
                        bot.last_candle_time[pair] = int(rates[0][0])
                        bot._save_state() 
                        
                        if bot.is_market_safe(pair):
                            if bot.manage_active_exposure() < 3:
                                signal = bot.get_institutional_signal(pair)
                                if signal:
                                    # --- SIGNAL DISCOVERY LOG ---
                                    print(f"💎 SIGNAL FOUND: {pair} {signal}")
                                    bot.execute_limit_order(pair, signal)
                                    
                time.sleep(15)
        except KeyboardInterrupt:
            print("Shutdown.")
        finally:
            mt5.shutdown()