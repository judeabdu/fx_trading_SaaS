import MetaTrader5 as mt5

def connect_mt5(login, password, server):

    # Shutdown previous sessions
    mt5.shutdown()

    # Initialize MT5
    if not mt5.initialize():

        print(f"❌ MT5 initialization failed: {mt5.last_error()}")

        return False

    # Login
    authorized = mt5.login(
        login=int(login),
        password=password,
        server=server
    )

    if not authorized:

        error = mt5.last_error()

        print(f"❌ Login failed for {login} on {server}")
        print(f"❌ Error Detail: {error}")

        return False

    print(f"✅ SUCCESS: Logged into {server}")

    return True