import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-astra-bg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7" }} className="morse-1" />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22d3ee" }} className="morse-2" />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4fc3f7" }} className="morse-3" />
          </div>
          <p className="text-slate-400 font-mono text-sm">Verificando autenticação...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
