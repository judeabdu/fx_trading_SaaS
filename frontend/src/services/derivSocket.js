let socket = null;

export const connectDerivSocket = (apiToken, onMessage) => {
  // If a socket instance is already active, close it down before creating a new one
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
  }

  socket = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

  socket.onopen = () => {
    console.log("🚀 Connection pipe open. Sending authorization token...");
    
    // STEP 1: Send authorization payload first. 
    // Do NOT send balance or tick requests yet!
    socket.send(
      JSON.stringify({
        authorize: apiToken
      })
    );
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // STEP 2: Only spin up streams AFTER authorization is confirmed by the server
      if (data.msg_type === "authorize") {
        if (data.error) {
          console.error("❌ Deriv Authorization Rejected:", data.error.message);
          return;
        }

        console.log("✅ Authenticated with Deriv successfully. Activating streams...");

        // Subscribe to balance tracking updates
        socket.send(
          JSON.stringify({
            balance: 1,
            subscribe: 1
          })
        );

        // Subscribe to market ticking symbols
        // NOTE: Deriv synthetics typically look like 'R_100', 'R_75', 'R_50' 
        // or '1HZ100V', '1HZ75V', '1HZ50V' depending on your regional platform account.
        const symbols = ["R_100", "R_75", "R_50"];
        symbols.forEach((symbol) => {
          socket.send(
            JSON.stringify({
              ticks: symbol,
              subscribe: 1
            })
          );
        });
      }

      // Route all raw data back up to the frontend UI state listeners
      onMessage(data);

    } catch (parseError) {
      console.error("❌ Error parsing message frame data:", parseError);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ Deriv socket error encountered:", err);
  };

  socket.onclose = (event) => {
    console.log(`⚠️ Deriv socket disconnected. Code: ${event.code}, Reason: ${event.reason || "None specified"}`);
  };
};

export const disconnectDerivSocket = () => {
  if (socket) {
    // Gracefully unhook listeners to prevent memory leaks during component destruction
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
    socket = null;
    console.log("🛑 Socket lifecycle teardown complete.");
  }
};