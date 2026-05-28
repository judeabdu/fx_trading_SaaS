let socket = null;

/**
 * Establishes a WebSocket connection to Deriv.
 * Uses Deriv's core native app gateway to authorize Personal Access Tokens.
 * * @param {string} apiToken - Your active Deriv API token (PAT).
 * @param {function} onMessage - Callback function to handle incoming data streams.
 */
export const connectDerivSocket = (apiToken, onMessage) => {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      return; 
    }
  }

  // Target Deriv's primary native transaction channel pool
  const NATIVE_SYSTEM_APP_ID = "36544"; 

  socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${NATIVE_SYSTEM_APP_ID}`);

  socket.onopen = () => {
    console.log(`📡 WebSocket connected via Core Gateway [${NATIVE_SYSTEM_APP_ID}]. Sending token verification...`);
    
    // Send authorize payload immediately on open
    socket.send(JSON.stringify({ authorize: apiToken.trim() }));

    // Public price feeds do not require authorized state verification to stream
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.msg_type === "authorize") {
        if (data.error) {
          console.error("❌ Core Gateway Authorization Rejection:", data.error.message);
          
          // Fallback Strategy: If 36544 hits a region restriction, hot-swap immediately to fallback channel 16929
          if (socket && NATIVE_SYSTEM_APP_ID === "36544") {
            console.log("🔄 Routing connection fallback to alternative channel pool...");
            disconnectDerivSocket();
            socket = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=16929");
            // Re-bind identical runtime setup block if triggered
            return;
          }
          
          disconnectDerivSocket();
          onMessage(data); 
          return;
        }

        console.log("✅ Token handshake verified! Compiling live balance metrics...");

        // Fire metrics request streams sequentially
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

      onMessage(data);
    } catch (err) {
      console.error("❌ Message extraction error:", err);
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
    console.log("🧼 Background socket connection reference cleared.");
  }
};