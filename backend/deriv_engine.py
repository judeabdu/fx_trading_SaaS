import websocket
import json
import time

class DerivEngine:

    def __init__(
        self,
        api_token,
        app_id="1089"
    ):

        self.api_token = api_token

        self.app_id = app_id

        self.ws = None

        self.connected = False

    # =========================
    # CONNECT
    # =========================

    def connect(self):

        try:

            self.ws = websocket.create_connection(
                f"wss://ws.derivws.com/websockets/v3?app_id={self.app_id}"
            )

            self.ws.send(
                json.dumps({
                    "authorize":
                        self.api_token
                })
            )

            response = json.loads(
                self.ws.recv()
            )

            if "error" in response:

                print(
                    f"❌ Deriv auth failed: {response}"
                )

                return False

            self.connected = True

            print(
                "✅ Connected to Deriv"
            )

            return True

        except Exception as e:

            print(
                f"❌ Connection error: {e}"
            )

            return False

    # =========================
    # GET BALANCE
    # =========================

    def get_balance(self):

        self.ws.send(
            json.dumps({
                "balance": 1
            })
        )

        response = json.loads(
            self.ws.recv()
        )

        return response

    # =========================
    # GET PRICE
    # =========================

    def get_price(
        self,
        symbol
    ):

        self.ws.send(
            json.dumps({
                "ticks": symbol
            })
        )

        response = json.loads(
            self.ws.recv()
        )

        if "tick" not in response:

            return None

        return response["tick"]["quote"]

    # =========================
    # GET CANDLES
    # =========================

    def get_candles(
        self,
        symbol,
        granularity=900,
        count=50
    ):

        self.ws.send(
            json.dumps({

                "ticks_history":
                    symbol,

                "adjust_start_time": 1,

                "count":
                    count,

                "end":
                    "latest",

                "granularity":
                    granularity,

                "style":
                    "candles"
            })
        )

        response = json.loads(
            self.ws.recv()
        )

        if "candles" not in response:

            return []

        return response["candles"]