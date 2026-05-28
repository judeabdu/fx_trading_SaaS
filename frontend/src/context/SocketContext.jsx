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

    if (!socketInitialized.current) {
      socketInitialized.current = true;

      connectDerivSocket(cleanToken, (data) => {
        if (!data) return;

        // 1. ISOLATE AND INTERCEPT PERMISSION WARNING PANELS
        if (data.error) {
          if (data.msg_type === "profit_table" || data.msg_type === "profit") {
            setWinRate("Demo Limit");
            setRiskReward("Demo Limit");
            setTotalTrades("0");
            setGrowthPercentage(`0.00 ${currency}`);
            setDisciplineAssessment("Historical data analysis skipped. Analytics scope locked on Demo Tokens.");
            setEquityCurve([]);
          }
          if (data.msg_type === "authorize") {
            setBalance("Auth Error");
            socketInitialized.current = false;
          }
          return;
        }

        // 2. PARSE BROADCAST BALANCE DATA PACKETS (Matches both static state and recurring stream structures)
        if (data.msg_type === "balance" || data.balance !== undefined) {
          const balanceObj = data.balance;
          if (balanceObj && balanceObj.balance !== undefined) {
            setBalance(Number(balanceObj.balance).toFixed(2));
            setCurrency(balanceObj.currency || "USD");
          }
        }

        // 3. REAL-TIME TICK FEED CAPTURE
        if ((data.msg_type === "tick" || data.tick) && data.tick) {
          const symbol = data.tick.symbol;
          const quote = data.tick.quote;
          if (symbol && quote !== undefined) {
            setMarketPrices((prev) => ({
              ...prev,
              [symbol]: quote
            }));
          }
        }

        // 4. HISTORICAL PERFORMANCE ANALYSIS LAYER
        if (data.msg_type === "profit_table" || data.msg_type === "profit" || data.profit_table) {
          const profitPayload = data.profit || data.profit_table;
          const trades = profitPayload && profitPayload.transactions ? profitPayload.transactions : [];
          
          if (!Array.isArray(trades) || trades.length === 0) {
            setWinRate("0%");
            setRiskReward("1 : 0");
            setTotalTrades("0");
            setGrowthPercentage(`0.00 ${currency}`);
            setDisciplineAssessment("Stable allocation profile. Awaiting cloud transaction tracking execution...");
            setEquityCurve([]);
            return;
          }

          let wins = 0;
          let totalProfit = 0;
          let totalLoss = 0;
          let winCount = 0;
          let lossCount = 0;
          let runningEquity = 0;

          const historicalPoints = [...trades].reverse().map((tx, index) => {
            const profitValue = parseFloat(tx.profit) || 0;
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
          setGrowthPercentage(`${finalGrowth} ${profitPayload.currency || "USD"}`);

          if (parseFloat(computedWinRate) >= 55 && (avgWin / avgLoss) >= 1.5) {
            setDisciplineAssessment("Strong rule-based adherence and excellent drawdown control.");
          } else {
            setDisciplineAssessment("Stable allocation profile. Risk controls operating inside baseline setup parameters.");
          }
        }
      });
    }
  }, [currency]);

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