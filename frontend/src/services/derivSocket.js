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

  // Use the verified public streaming channel pool
  const TARGET_APP_ID = "16929"; 

  socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${TARGET_APP_ID}`);

  socket.onopen = () => {
    console.log(`📡 Connected via Channel [${TARGET_APP_ID}]. Sending sanitized token...`);
    const cleanToken = apiToken.replace(/['"`\s]+/g, '').trim();
    socket.send(JSON.stringify({ authorize: cleanToken }));

    // Initialize immediate market volatility tickers
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // 1. Handle Successful Handshake Response
      if (data.msg_type === "authorize") {
        if (data.error) {
          console.error("❌ Gateway Authorization Rejection:", data.error.message);
          disconnectDerivSocket();
          onMessage(data); 
          return;
        }

        console.log("✅ Identity verified! Triggering real-time account data subscriptions...");

        // Fire transaction history parameters and balances sequentially
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

      // 2. Direct normalization fallback layer for sub-components
      // Guarantees fields match the target object keys expected by useSocket()
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