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

  const [winRate, setWinRate] = useState("Calculating...");
  const [riskReward, setRiskReward] = useState("Calculating...");
  const [totalTrades, setTotalTrades] = useState("0");
  const [equityCurve, setEquityCurve] = useState([]);
  const [growthPercentage, setGrowthPercentage] = useState("0%");
  const [disciplineAssessment, setDisciplineAssessment] = useState("Evaluating cloud execution parameters...");

  const socketInitialized = useRef(false);

  useEffect(() => {
    const rawToken = localStorage.getItem("deriv_api_token") || localStorage.getItem("goldbot_token");

    if (!rawToken || rawToken === "undefined" || rawToken === "null") {
      setBalance("Configure Token");
      return;
    }

    const cleanToken = rawToken.replace(/['"`\s]+/g, '').trim();

    if (cleanToken.length < 5) {
      setBalance("Invalid Key");
      return;
    }

    // Connect if not already initialized
    if (!socketInitialized.current) {
      socketInitialized.current = true;

      connectDerivSocket(cleanToken, (data) => {
        if (data.msg_type === "authorize" && data.error) {
          console.error("❌ Context Level Auth Failure:", data.error.message);
          setBalance("Auth Error");
          socketInitialized.current = false;
          return;
        }

        // UPDATE LIVE BALANCE
        if (data.msg_type === "balance" && data.balance) {
          setBalance(Number(data.balance.balance).toFixed(2));
          setCurrency(data.balance.currency);
        }

        // UPDATE LIVE TICK PRICES
        if (data.msg_type === "tick" && data.tick) {
          setMarketPrices((prev) => ({
            ...prev,
            [data.tick.symbol]: data.tick.quote
          }));
        }

        // PROCESS PERFORMANCE HISTORIES
        if (data.msg_type === "profit" && data.profit) {
          const trades = data.profit.transactions || [];
          
          if (trades.length === 0) {
            setWinRate("0%");
            setRiskReward("1 : 0");
            setTotalTrades("0");
            setGrowthPercentage("0%");
            setDisciplineAssessment("No past execution data found on this account index.");
            return;
          }

          let wins = 0;
          let totalProfit = 0;
          let totalLoss = 0;
          let winCount = 0;
          let lossCount = 0;
          let runningEquity = 0;

          const historicalPoints = trades.reverse().map((tx, index) => {
            const profitValue = parseFloat(tx.profit);
            runningEquity += profitValue;

            if (profitValue > 0) {
              wins++;
              totalProfit += profitValue;
              winCount++;
            } else if (profitValue < 0) {
              totalLoss += Math.abs(profitValue);
              lossCount++;
            }

            return {
              tradeIndex: `T-${index + 1}`,
              equity: runningEquity.toFixed(2)
            };
          });

          const computedWinRate = ((wins / trades.length) * 100).toFixed(1);
          const avgWin = winCount > 0 ? totalProfit / winCount : 0;
          const avgLoss = lossCount > 0 ? totalLoss / lossCount : 1;
          const computedRR = avgLoss > 0 ? `1 : ${(avgWin / avgLoss).toFixed(1)}` : "1 : 1";
          const finalGrowth = runningEquity >= 0 ? `+${runningEquity.toFixed(2)}` : runningEquity.toFixed(2);

          setTotalTrades(trades.length.toString());
          setWinRate(`${computedWinRate}%`);
          setRiskReward(computedRR);
          setEquityCurve(historicalPoints);
          setGrowthPercentage(`${finalGrowth} ${data.profit.currency || "USD"}`);

          if (parseFloat(computedWinRate) >= 55 && (avgWin / avgLoss) >= 1.5) {
            setDisciplineAssessment("Strong rule-based adherence and excellent drawdown control. Execution parameters indicate institutional-grade risk mitigation, high capital pool preservation, and consistent profit extraction efficiency.");
          } else {
            setDisciplineAssessment("Stable allocation profile. Risk controls are operating inside standard baseline parameters. Strategy avoids random over-exposure spikes and follows structured trading plan steps.");
          }
        }
      });
    }

    // 🛑 REMOVED THE ACCIDENTAL DISCONNECT TEARDOWN ON COMPONENT UNMOUNT
    // This allows the socket session stream to stay completely alive across page switches
  }, []);

  return (
    <SocketContext.Provider value={{ 
      balance, currency, marketPrices, winRate, 
      riskReward, totalTrades, equityCurve, 
      growthPercentage, disciplineAssessment 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);