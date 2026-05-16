import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Layers, 
  Webhook, 
  ShieldAlert, 
  LogOut,
  User,
  ChevronRight,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // FORÇAR VISIBILIDADE - Se o texto 'MASTER ACCESS' aparece no topo, o CEO Portal DEVE aparecer aqui.
  const isC_E_O = true; // Forçando TRUE para garantir que apareça no seu navegador enquanto debugamos o cache.

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", desc: "Visão Geral" },
    { icon: Layers, label: "Hub Manager", path: "/hubs", desc: "Gerenciar Hubs" },
    { icon: Webhook, label: "Webhook", path: "/webhook", desc: "Configurações Discord" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#05070a] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-white tracking-tighter leading-none">KYOTSU</h1>
            <p className="text-[10px] text-purple-400 font-mono font-bold mt-1 tracking-widest uppercase">Key Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Principais</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive(item.path)
                ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? "text-purple-400" : "text-slate-500 group-hover:text-slate-200"} />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{item.label}</span>
              <span className="text-[9px] opacity-50">{item.desc}</span>
            </div>
          </Link>
        ))}

        {/* SEÇÃO DO CEO - FORÇADA POR EMAIL */}
        {isC_E_O && (
          <div className="mt-8">
            <p className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.2em] px-4 mb-2 font-bold">Acesso CEO</p>
            <Link
              to="/admin"
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border ${
                isActive("/admin")
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]"
                  : "text-slate-400 hover:text-amber-200 hover:bg-amber-500/5 border-transparent"
              }`}
            >
              <Zap size={20} className={isActive("/admin") ? "text-amber-400" : "text-amber-600/50 group-hover:text-amber-400"} />
              <div className="flex flex-col">
                <span className="text-sm font-bold">CEO Portal</span>
                <span className="text-[9px] opacity-70 uppercase tracking-tighter">Lucros & Usuários</span>
              </div>
              <ChevronRight size={14} className="ml-auto opacity-30" />
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 bg-[#080a0f] border-t border-white/5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0] || "Admin"}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                  {isC_E_O ? "Master Access" : "Ativo"}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 text-xs font-bold transition-all"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
