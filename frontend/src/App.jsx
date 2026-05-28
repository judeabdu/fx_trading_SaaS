import React from "react";
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./Login";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TradesPage from "./pages/TradesPage";
import HistoryPage from "./pages/HistoryPage";
import BillingPage from "./pages/BillingPage";
import SettingsPage from "./pages/SettingsPage";

// Import your Global Socket Provider
import { SocketProvider } from "./context/SocketContext";

function App() {
  // Pull authorization token to verify route access requirements
  const token = localStorage.getItem("goldbot_token");

  return (
    <SocketProvider>
      <Routes>
        <Route
          path="/login"
          element={
            token
              ? <Navigate to="/" />
              : <Login />
          }
        />

        <Route
          path="/"
          element={
            token
              ? <DashboardPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/analytics"
          element={
            token
              ? <AnalyticsPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/trades"
          element={
            token
              ? <TradesPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/history"
          element={
            token
              ? <HistoryPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/billing"
          element={
            token
              ? <BillingPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/settings"
          element={
            token
              ? <SettingsPage />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </SocketProvider>
  );
}

export default App;