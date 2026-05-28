import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { connectDerivSocket, disconnectDerivSocket } from "../services/derivSocket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [balance, setBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("");
  const [marketPrices, setMarketPrices] = useState({ R_100: "--", R_75: "--", R_50: "--" });
  const socketInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("deriv_api_token");

    if (token && !socketInitialized.current) {
      socketInitialized.current = true;
      
      connectDerivSocket(token, (data) => {
        // Track Balance
        if (data.msg_type === "balance" && data.balance) {
          setBalance(Number(data.balance.balance).toFixed(2));
          setCurrency(data.balance.currency);
        }
        // Track Prices Globally
        if (data.msg_type === "tick" && data.tick) {
          setMarketPrices((prev) => ({
            ...prev,
            [data.tick.symbol]: data.tick.quote,
          }));
        }
      });
    }

    // Disconnect ONLY when the whole app closes/refreshes
    return () => {
      disconnectDerivSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ balance, currency, marketPrices }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);