import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Hubs from "./pages/Hubs";
import Settings from "./pages/Settings";
import BotLogs from "./pages/BotLogs";
import Webhook from "./pages/Webhook";
import AdminPortal from "./pages/AdminPortal";
import "./App.css";

function App() {
  return (
    <div className="App">
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-portal" element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            } />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="hubs" element={<Hubs />} />
              <Route path="logs" element={<BotLogs />} />
              <Route path="webhook" element={<Webhook />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </HashRouter>
    </div>
  );
}

export default App;
