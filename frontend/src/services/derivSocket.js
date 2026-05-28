let socket = null;

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

    ["R_100", "R_75", "R_50"].forEach((symbol) => {
      socket.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.error) {
        console.warn(`⚠️ Deriv Engine Gateway Warning [${data.msg_type}]:`, data.error.message);
        if (data.msg_type === "authorize") {
          disconnectDerivSocket();
        }
        onMessage(data);
        return;
      }

      if (data.msg_type === "authorize") {
        console.log("✅ Identity verified! Triggering real-time account data subscriptions...");
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