let socket = null;

/**
 * Establishes a WebSocket connection to Deriv.
 * Handles sequential authorization before fetching protected user data streams.
 * * @param {string} apiToken - Your active Deriv API token.
 * @param {function} onMessage - Callback function to handle incoming message payloads.
 */
export const connectDerivSocket = (apiToken, onMessage) => {
  // 1. Guard against duplicate or stacking background sockets
  if (socket) {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      console.log("⚠️ Deriv WebSocket connection or connection attempt already active.");
      return;
    }
  }

  // 2. Initialize connection
  socket = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

  socket.onopen = () => {
    console.log("🚀 WebSocket connected. Sending authorization packet...");
    
    // STEP A: Send ONLY authorization parameters first
    socket.send(
      JSON.stringify({
        authorize: apiToken,
      })
    );

    // Public feeds (like market ticks) do not require authorization
    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(
        JSON.stringify({
          ticks: symbol,
          subscribe: 1,
        })
      );
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // STEP B: Handle the server's authorization confirmation safely
      if (data.msg_type === "authorize") {
        if (data.error) {
          console.error("❌ Deriv Authorization Failed:", data.error.message);
          disconnectDerivSocket();
          onMessage(data); // Route error upstream so your UI pages catch it
          return;
        }

        console.log("✅ Authorization successful. Mounting secure accounts data...");

        // 1. Existing balance request stream
        socket.send(
          JSON.stringify({ 
            balance: 1, 
            subscribe: 1 
          })
        );

        // 2. NEW: Requests last 100 closed contracts to generate live calculations
        socket.send(
          JSON.stringify({ 
            profit_table: 1, 
            limit: 100 
          })
        );
      }

      // Forward all incoming messages, ticks, and ledger datasets to your page components
      onMessage(data);

    } catch (err) {
      console.error("❌ Failed to parse incoming WebSocket payload:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ Deriv socket error encountered:", err);
  };

  socket.onclose = (event) => {
    console.log(`🛑 Socket lifecycle teardown complete. (Code: ${event.code})`);
    socket = null; // Flush instance reference out of memory cleanly
  };
};

/**
 * Disconnects and purges the active Deriv WebSocket client cleanly.
 */
export const disconnectDerivSocket = () => {
  if (socket) {
    // Remove listeners to skip unintended state-change checks during a forced cleanup
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
    
    socket = null;
    console.log("🧼 Deriv socket reference manually cleared.");
  }
};