let socket = null;

/**
 * Establishes a WebSocket connection to Deriv.
 * Normalizes incoming network payload packets uniformly for state context injection.
 * @param {string} apiToken - Your clean verified Deriv token.
 * @param {function} onMessage - Callback dispatcher routing straight to React state.
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
    socket.send(JSON.stringify({ authorize: cleanToken }));

    // Initialize market ticks stream
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Handle server error responses cleanly
      if (data.error) {
        console.warn(`⚠️ Deriv Engine Gateway Warning [${data.msg_type}]:`, data.error.message);
        if (data.msg_type === "authorize") {
          disconnectDerivSocket();
        }
        onMessage(data);
        return;
      }

      // Handle initial successful validation state parameters
      if (data.msg_type === "authorize") {
        console.log("✅ Identity verified! Commencing real-time stream subscriptions...");
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

      // Forward completely untouched object packages straight to our context handler engine
      onMessage(data);

    } catch (err) {
      console.error("❌ Message extraction stream parser error:", err);
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