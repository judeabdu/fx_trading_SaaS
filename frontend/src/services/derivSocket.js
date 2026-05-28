let socket = null;

/**
 * Establishes a highly resilient WebSocket connection to Deriv.
 * Subscribes to institutional Forex and Gold spot market instruments.
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

    // ✅ SWITCHED: Requesting Real Forex pairs and Gold Spot instead of Volatility Indices
    ["frxXAUUSD", "frxEURUSD", "frxGBPUSD"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.msg_type === "authorize" && !data.error) {
        console.log("✅ Identity verified! Triggering real-time financial data subscriptions...");
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

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
  }
};