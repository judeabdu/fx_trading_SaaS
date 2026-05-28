import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { connectDerivSocket, disconnectDerivSocket } from "../services/derivSocket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [balance, setBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("USD");
  const [marketPrices, setMarketPrices] = useState({
    R_100: "--",
    R_75: "--",
    R_50: "--"
  });
  
  const socketInitialized = useRef(false);

  useEffect(() => {
    // 1. Fallback check: Look for whichever key your app is actively saving to
    const token = localStorage.getItem("deriv_api_token") || localStorage.getItem("goldbot_token");

    if (!token) {
      console.warn("⚠️ No Deriv API token found in localStorage keys.");
      setBalance("No Token");
      return;
    }

    if (!socketInitialized.current) {
      socketInitialized.current = true;
      
      connectDerivSocket(token, (data) => {
        // Handle auth failures transparently
        if (data.msg_type === "authorize" && data.error) {
          console.error("❌ Context Level Auth Failure:", data.error.message);
          setBalance("Auth Error");
          return;
        }

        // ACCOUNT BALANCE
        if (data.msg_type === "balance" && data.balance) {
          setBalance(Number(data.balance.balance).toFixed(2));
          setCurrency(data.balance.currency);
        }

        // LIVE TICKS
        if (data.msg_type === "tick" && data.tick) {
          setMarketPrices((prev) => ({
            ...prev,
            [data.tick.symbol]: data.tick.quote
          }));
        }
      });
    }

    return () => {
      disconnectDerivSocket();
      socketInitialized.current = false;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ balance, currency, marketPrices }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);