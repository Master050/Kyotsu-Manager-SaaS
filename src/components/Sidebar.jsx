import React, { useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import MatrixRain from "./MatrixRain";
import {
  LayoutDashboard, Server, Activity, Settings, ChevronLeft, ChevronRight, Home, LogOut, Shield, Eye, Bell
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/hubs", label: "Hubs", icon: Server },
  { path: "/webhook", label: "Webhook", icon: Bell },
  { path: "/logs", label: "Bot Logs", icon: Activity },
];

const adminItems = [
  { path: "/admin-portal", label: "Portal Admin", icon: Shield },
];

const bottomItems = [
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMatrix, setShowMatrix] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      setShowMatrix(true);
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    } else {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  };

  const NavItemWithTooltip = ({ children, label, collapsed }) => {
    if (!collapsed || isMobile) return children;
    return (
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="px-3 py-2 rounded-lg text-sm font-body text-white z-50"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.95), rgba(124,58,237,0.95))",
                border: "1px solid rgba(168,85,247,0.5)",
                boxShadow: "0 0 20px rgba(168,85,247,0.5), 0 4px 12px rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
              }}
              sideOffset={10}
            >
              {label}
              <Tooltip.Arrow className="fill-purple-600" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (collapsed ? "-100%" : 0) : 0,
          width: isMobile ? "280px" : (collapsed ? "72px" : "272px"),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen z-[80] flex flex-col bg-[#030306] border-r border-white/10"
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div onClick={handleLogoClick} className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center cursor-pointer">
            <span className="text-xl font-bold text-purple-400">K</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="ml-3">
              <p className="text-sm font-bold text-white">Kyotsu Manager</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">v4.2.0</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-8 overflow-y-auto">
          <div>
            {(!collapsed || isMobile) && <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 px-2 tracking-widest">Principal</p>}
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavItemWithTooltip label={item.label} collapsed={collapsed}>
                      <NavLink to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                        <item.icon size={20} />
                        {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
                      </NavLink>
                    </NavItemWithTooltip>
                  </li>
                );
              })}
            </ul>
          </div>

          {(user?.role === "super-admin" || user?.email === "Admin") && (
            <div>
              {(!collapsed || isMobile) && <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 px-2 tracking-widest">Administração</p>}
              <ul className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <NavItemWithTooltip label={item.label} collapsed={collapsed}>
                        <NavLink to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                          <item.icon size={20} />
                          {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
                        </NavLink>
                      </NavItemWithTooltip>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            {(!collapsed || isMobile) && <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 px-2 tracking-widest">Sistema</p>}
            <ul className="space-y-1">
              {bottomItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavItemWithTooltip label={item.label} collapsed={collapsed}>
                      <NavLink to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-slate-500/10 text-white border border-white/20" : "text-slate-500 hover:text-slate-300"}`}>
                        <item.icon size={20} />
                        {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
                      </NavLink>
                    </NavItemWithTooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          {(!collapsed || isMobile) && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield size={16} className="text-purple-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.username || user?.email}</p>
                <p className="text-[10px] text-slate-500 uppercase">{user?.plan_type || 'Plano I'}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut size={18} />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>
      {showMatrix && <MatrixRain onClose={() => setShowMatrix(false)} />}
    </>
  );
}
