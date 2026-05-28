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

        // 1. CATCH SCOPE AND ERROR OBJECTS INGESTION
        if (data.error) {
          if (data.msg_type === "profit_table" || data.msg_type === "profit") {
            setWinRate("Demo Limit");
            setRiskReward("Demo Limit");
            setTotalTrades("0");
            setGrowthPercentage(`0.00 ${currency}`);
            setDisciplineAssessment("Historical tracking skipped. Analytics ledger calls are restricted on demo keys.");
            setEquityCurve([]);
          }
          if (data.msg_type === "authorize") {
            setBalance("Auth Error");
            socketInitialized.current = false;
          }
          return;
        }

        // 2. UNIVERSAL BALANCE STATE HANDLING
        const balanceSource = data.balance || data.bch;
        if (balanceSource) {
          const currentBalance = balanceSource.balance !== undefined ? balanceSource.balance : balanceSource;
          const currentCurrency = balanceSource.currency || "USD";
          setBalance(Number(currentBalance).toFixed(2));
          setCurrency(currentCurrency);
        }

        // 3. REAL-TIME MARKET TICK FEEDS
        if (data.msg_type === "tick" && data.tick) {
          setMarketPrices((prev) => ({
            ...prev,
            [data.tick.symbol]: data.tick.quote
          }));
        }

        // 4. HISTORICAL PERFORMANCE ANALYSIS LAYER
        if (data.msg_type === "profit" || data.profit_table) {
          const profitPayload = data.profit || data.profit_table;
          const trades = profitPayload && profitPayload.transactions ? profitPayload.transactions : [];
          
          if (!Array.isArray(trades) || trades.length === 0) {
            setWinRate("0%");
            setRiskReward("1 : 0");
            setTotalTrades("0");
            setGrowthPercentage(`0.00 ${currency}`);
            setDisciplineAssessment("Stable allocation profile. Waiting for telemetry execution...");
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
            setDisciplineAssessment("Stable allocation profile. Risk controls operating inside standard parameters.");
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