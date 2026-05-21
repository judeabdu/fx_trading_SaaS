import MetaTrader5 as mt5
import config

def connect_mt5():
    # Shut down any existing sessions first to clear errors
    mt5.shutdown()
    
    if not mt5.initialize():
        print(f"❌ MT5 initialization failed: {mt5.last_error()}")
        return False

    # Attempt Login
    authorized = mt5.login(
        login=int(config.LOGIN),
        password=config.PASSWORD,
        server=config.SERVER
    )

    if not authorized:
        # This will tell us EXACTLY why it failed
        error = mt5.last_error()
        print(f"❌ Login failed for {config.LOGIN} on {config.SERVER}")
        print(f"❌ Error Detail: {error}")
        return False

    print(f"✅ SUCCESS: Logged into {config.SERVER}")
    return True