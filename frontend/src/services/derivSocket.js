let socket = null;

/**
 * Establishes a highly resilient WebSocket connection to Deriv.
 * Cleans data stream packages to map perfectly to React context states.
 * @param {string} apiToken - Your active verified Deriv API token.
 * @param {function} onMessage - Callback handler for state distribution.
 */
export const connectDerivSocket = (apiToken, onMessage) => {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      return; 
    }
  }

  const TARGET_APP_ID = "16929"; 

  socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${TARGET_APP_ID}`);

  socket.onopen = () => {
    console.log(`📡 Connected via Channel [${TARGET_APP_ID}]. Sending sanitized token...`);
    
    const cleanToken = apiToken.replace(/['"`\s]+/g, '').trim();
    const authPayload = { authorize: cleanToken };
    
    socket.send(JSON.stringify(authPayload));

    // Initialize immediate market volatility tickers
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Handle server error responses globally without forcing a hard socket teardown
      if (data.error) {
        console.warn(`⚠️ Deriv API Gateway Warning [${data.msg_type}]:`, data.error.message);
        
        if (data.msg_type === "authorize") {
          console.error("❌ Critical Authentication Failure.");
          disconnectDerivSocket();
          onMessage(data);
          return;
        }
        
        // Forward the error packet down so the context layer can disable analytics grids gracefully
        onMessage(data);
        return;
      }

      // 1. Handle Successful Handshake Response
      if (data.msg_type === "authorize") {
        console.log("✅ Identity verified! Triggering real-time account data subscriptions...");

        // Fire account balances subscription stream
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        
        // Fire historical profit ledger parameters safely
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

      // 2. Direct normalization fallback layer for sub-components
      if (data.balance) data.msg_type = "balance";
      if (data.profit_table) data.msg_type = "profit";
      if (data.tick) data.msg_type = "tick";

      // Forward directly to global states
      onMessage(data);

    } catch (err) {
      console.error("❌ Message parsing extraction error:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ Connection exception caught:", err);
  };

  socket.onclose = (event) => {
    console.log(`🛑 Socket lifecycle concluded. (Code: ${event.code})`);
    socket = null;
  };
};

export const disconnectDerivSocket = () => {
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
    socket = null;
    console.log("🧼 Background connection reference cleared.");
  }
};