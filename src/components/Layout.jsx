import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Server, Settings, Zap, 
  Menu, X, Bell, ChevronRight, Search, Shield,
  Terminal, Activity, Box
} from "lucide-react";

const sidebarItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", desc: "Visão Geral" },
  { path: "/hubs", icon: Server, label: "Hub Manager", desc: "Gerenciar Hubs" },
  { path: "/webhook", icon: Bell, label: "Webhook", desc: "Configurações Discord" },
];

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-body selection:bg-purple-500/30 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[20%] w-[35%] h-[35%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
      </div>

      <div className="flex h-screen relative z-10">
        {/* --- Sidebar --- */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col relative"
        >
          <div className="p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield size={22} className="text-white" />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col"
                  >
                    <span className="font-heading font-bold text-lg tracking-tight text-white leading-none">KYOTSU</span>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mt-1">Key Manager</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full shadow-[0_0_10px_#a855f7]"
                      />
                    )}
                    <item.icon size={20} className={isActive ? 'text-purple-400' : 'group-hover:text-purple-300'} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col"
                        >
                          <span className="text-sm font-bold font-heading">{item.label}</span>
                          <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">{item.desc}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-black/20">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </motion.aside>

        {/* --- Main Content --- */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 relative group">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#050505]" />
              </button>
              <div className="h-8 w-px bg-white/5 mx-2" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-white leading-none">Admin Kyotsu</p>
                  <p className="text-[10px] text-emerald-500 font-mono mt-1 uppercase tracking-tighter">Master Access</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/10 flex items-center justify-center">
                   <Box size={18} className="text-white/80" />
                </div>
              </div>
            </div>
          </header>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
