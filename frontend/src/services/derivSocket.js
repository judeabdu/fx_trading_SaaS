let socket = null;

/**
 * Establishes a highly resilient WebSocket connection to Deriv.
 * Cleans token input formatting to prevent structural validation issues.
 * * @param {string} apiToken - Your active Deriv API token (PAT).
 * @param {function} onMessage - Callback function to handle incoming data streams.
 */
export const connectDerivSocket = (apiToken, onMessage) => {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      return; 
    }
  }

  // Use the universal public channel pool for processing authenticated profiles
  const TARGET_APP_ID = "16929"; 

  socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${TARGET_APP_ID}`);

  socket.onopen = () => {
    console.log(`📡 Connected via Channel [${TARGET_APP_ID}]. Sending sanitized token...`);
    
    // SANITATION LAYER: Completely strips out wrapping spaces, tabs, quotes, or line breaks
    const cleanToken = apiToken.replace(/['"]+/g, '').trim();
    
    socket.send(JSON.stringify({ authorize: cleanToken }));

    // Request price feeds on layout initialization
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.msg_type === "authorize") {
        if (data.error) {
          console.error("❌ Gateway Authorization Rejection:", data.error.message);
          disconnectDerivSocket();
          onMessage(data); 
          return;
        }

        console.log("✅ Token successfully accepted! Syncing profile streams...");

        // Fire metric streams sequentially
        socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        socket.send(JSON.stringify({ profit_table: 1, limit: 100 }));
      }

      onMessage(data);
    } catch (err) {
      console.error("❌ Message parsing error:", err);
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