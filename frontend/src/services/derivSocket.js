let socket = null;
let isAuthorized = false;

export const connectDerivSocket = (apiToken, onMessage) => {
  if (!apiToken) {
    console.error("❌ Missing API token");
    return;
  }

  // Clean token just in case (VERY important in real bugs)
  const cleanToken = apiToken.trim();

  // Close old socket safely
  if (socket) {
    try {
      socket.close();
    } catch (e) {}
    socket = null;
  }

  isAuthorized = false;

  socket = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

  socket.onopen = () => {
    console.log("🚀 WebSocket connected. Sending authorization...");

    socket.send(
      JSON.stringify({
        authorize: cleanToken,
      })
    );
  };

  socket.onmessage = (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("❌ Invalid JSON from Deriv:", event.data);
      return;
    }

    // 🔐 AUTH RESPONSE
    if (data.msg_type === "authorize") {
      if (data.error) {
        console.error("❌ Authorization failed:", data.error.message);
        return;
      }

      console.log("✅ Authorized successfully");
      isAuthorized = true;

      // Subscribe to balance AFTER auth success
      socket.send(
        JSON.stringify({
          balance: 1,
          subscribe: 1,
        })
      );

      // Subscribe to ticks
      const symbols = ["R_100", "R_75", "R_50"];

      symbols.forEach((symbol) => {
        socket.send(
          JSON.stringify({
            ticks: symbol,
            subscribe: 1,
          })
        );
      });

      return;
    }

    // 🚨 HANDLE API ERRORS (important for debugging)
    if (data.msg_type === "error") {
      console.error("❌ Deriv API Error:", data.error?.message || data);
      return;
    }

    // Only pass valid messages to UI after auth
    if (isAuthorized) {
      onMessage(data);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = (event) => {
    console.log(
      `⚠️ Socket closed. Code: ${event.code}, Reason: ${event.reason || "none"}`
    );
    isAuthorized = false;
  };
};

export const disconnectDerivSocket = () => {
  if (!socket) return;

  try {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    socket.close();
  } catch (e) {}

  socket = null;
  isAuthorized = false;

  console.log("🛑 Socket lifecycle teardown complete.");
};