let socket = null;

export const connectDerivSocket = (
  apiToken,
  onMessage
) => {

  socket = new WebSocket(
    "wss://ws.derivws.com/websockets/v3?app_id=1089"
  );

  socket.onopen = () => {

    console.log("✅ Connected to Deriv");

    socket.send(
      JSON.stringify({
        authorize: apiToken
      })
    );

    socket.send(
      JSON.stringify({
        balance: 1,
        subscribe: 1
      })
    );

    ["R_100", "R_75", "R_50"].forEach(
      (symbol) => {

        socket.send(
          JSON.stringify({
            ticks: symbol,
            subscribe: 1
          })
        );
      }
    );
  };

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    onMessage(data);
  };

  socket.onerror = (err) => {

    console.error(
      "❌ Deriv socket error",
      err
    );
  };

  socket.onclose = () => {

    console.log(
      "⚠️ Deriv socket disconnected"
    );
  };
};

export const disconnectDerivSocket = () => {

  if (socket) {

    socket.close();
  }
};