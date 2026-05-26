import websocket
import json
import ssl


class DerivClient:

    def __init__(
        self,
        api_token,
        app_id,
        demo=True
    ):

        self.api_token = api_token

        self.app_id = app_id

        self.demo = demo

        self.ws = None

        self.connected = False

        self.authorized = False

        self.account_info = None

        self.base_url = (
            "wss://ws.derivws.com/websockets/v3"
        )

    # =========================
    # CONNECT
    # =========================

    def connect(self):

        try:

            websocket_url = (
                f"{self.base_url}?app_id={self.app_id}"
            )

            self.ws = websocket.create_connection(
                websocket_url,
                sslopt={"cert_reqs": ssl.CERT_NONE}
            )

            auth_request = {
                "authorize": self.api_token
            }

            self.ws.send(
                json.dumps(auth_request)
            )

            response = json.loads(
                self.ws.recv()
            )

            # =========================
            # AUTH FAILED
            # =========================

            if "error" in response:

                print(
                    f"❌ Deriv Authorization Failed: "
                    f"{response['error']['message']}"
                )

                return False

            # =========================
            # AUTH SUCCESS
            # =========================

            self.connected = True

            self.authorized = True

            self.account_info = response

            print(
                "✅ Connected To Deriv API"
            )

            return True

        except Exception as e:

            print(
                f"❌ Deriv Connection Error: {e}"
            )

            return False

    # =========================
    # SEND REQUEST
    # =========================

    def send_request(self, payload):

        try:

            if not self.connected:

                raise Exception(
                    "Deriv client not connected"
                )

            self.ws.send(
                json.dumps(payload)
            )

            response = json.loads(
                self.ws.recv()
            )

            return response

        except Exception as e:

            print(
                f"❌ Request Error: {e}"
            )

            return {
                "error": str(e)
            }

    # =========================
    # GET BALANCE
    # =========================

    def get_balance(self):

        payload = {
            "balance": 1
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # GET ACTIVE SYMBOLS
    # =========================

    def get_active_symbols(self):

        payload = {
            "active_symbols": "brief",
            "product_type": "basic"
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # GET TICKS
    # =========================

    def get_ticks(
        self,
        symbol
    ):

        payload = {
            "ticks": symbol,
            "subscribe": 1
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # BUY CONTRACT
    # =========================

    def buy_contract(
        self,
        symbol,
        amount,
        contract_type,
        duration=5,
        duration_unit="m",
        currency="USD"
    ):

        payload = {
            "buy": 1,
            "price": amount,
            "parameters": {

                "symbol": symbol,

                "contract_type": contract_type,

                "currency": currency,

                "duration": duration,

                "duration_unit": duration_unit
            }
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # SELL CONTRACT
    # =========================

    def sell_contract(
        self,
        contract_id,
        price=0
    ):

        payload = {
            "sell": contract_id,
            "price": price
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # PING
    # =========================

    def ping(self):

        payload = {
            "ping": 1
        }

        response = self.send_request(
            payload
        )

        return response

    # =========================
    # DISCONNECT
    # =========================

    def disconnect(self):

        try:

            if self.ws:

                self.ws.close()

            self.connected = False

            self.authorized = False

            print(
                "🔌 Deriv Connection Closed"
            )

        except Exception as e:

            print(
                f"❌ Disconnect Error: {e}"
            )