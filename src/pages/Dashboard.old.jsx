import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Package, AlertTriangle, CreditCard, Box, ChevronRight, Zap, Target, Layers
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Animates Numbers smoothly
function useCountUp(target, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined) return;
    const timeout = setTimeout(() => {
      if (target === 0) { setCount(0); return; }
      let start = 0;
      const steps = 40;
      const stepVal = target / steps;
      const stepTime = duration / steps;
      const timer = setInterval(() => {
        start += stepVal;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, stepTime);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

// ── Estatística Original da Template "Astra" ──
function StatCard({ label, value, sublabel, icon: Icon, color, glow, delay, onClick, prefix = "" }) {
  const isCurrency = prefix !== "";
  const counted = useCountUp(value, 1000, delay * 150);
  
  const displayValue = isCurrency 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(counted)
    : Math.floor(counted);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08 }}
      onClick={onClick}
      className={`glass-card card-shine relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        padding: "20px 24px",
        transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
      }}
      whileHover={{
        y: onClick ? -4 : 0,
        boxShadow: onClick ? `0 0 40px -8px ${glow}, 0 8px 32px rgba(0,0,0,0.4)` : '',
        borderColor: `${color}55`,
      }}
    >
      <div className="scan-line" style={{ animationDelay: `${delay * 0.8}s` }} />
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "90px", height: "90px", borderRadius: "50%",
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        filter: "blur(20px)", opacity: 0.7,
        transition: "opacity 0.3s",
      }} />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <Icon size={13} style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              {label}
            </span>
          </div>

          <div className="flex items-end gap-3 mb-2">
            <span
              className="font-heading font-bold leading-none"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
                color: "#ffffff",
                textShadow: `0 0 20px ${glow}`,
                animationDelay: `${delay * 0.1}s`,
              }}
            >
              {displayValue}
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{sublabel}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, missing: 0, cost: 0, categories: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventario_casa").select("*");
    if (data) {
      setItems(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const total = data.length;
    let missingCount = 0;
    let totalCost = 0;
    const catMap = {};

    data.forEach(item => {
      const isMissing = Number(item.quantidade_atual) < Number(item.quantidade_ideal);
      if (isMissing) {
        missingCount++;
        totalCost += (item.quantidade_ideal - item.quantidade_atual) * (item.preco_ultima_compra || 0);
      }
      const catName = item.categoria || "Geral";
      if (!catMap[catName]) catMap[catName] = { nome: catName, total_itens: 0, em_falta: 0 };
      catMap[catName].total_itens++;
      if (isMissing) catMap[catName].em_falta++;
    });

    setStats({ total, missing: missingCount, cost: totalCost, categories: Object.values(catMap).sort((a,b) => b.total_itens - a.total_itens) });
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      
      {/* ── Banner Original ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden flex flex-col md:flex-row justify-between p-6 items-start md:items-center gap-4"
      >
        <div className="scan-line" style={{ animationDuration: "6s" }} />
        <div>
          <h1 className="font-heading font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-300 to-cyan-300 mb-2"
               style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.3))" }}>
            ESTATÍSTICAS DA CASA
          </h1>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full" style={{ background: stats.missing > 0 ? "#f43f5e" : "#10b981", boxShadow: `0 0 8px ${stats.missing > 0 ? "#f43f5e" : "#10b981"}`, animation: "status-pulse 2s ease-in-out infinite" }} />
             <p className="font-mono text-[11px] font-semibold tracking-widest uppercase" style={{ color: stats.missing > 0 ? "rgba(244,63,94,0.8)" : "rgba(16,185,129,0.8)" }}>
                STATUS: {stats.missing > 0 ? `${stats.missing} REPOSIÇÕES PENDENTES` : "CONDIÇÕES IDEAIS"}
             </p>
          </div>
        </div>
        <button 
           onClick={() => navigate("/inventory")}
           className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 text-sm font-mono flex items-center gap-2 hover:bg-purple-500/20 transition relative z-10"
        >
          Visualizar Estoque <ChevronRight size={14}/>
        </button>
      </motion.div>

      {/* ── Grid Principal de Cards Transparentes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total de Produtos" value={stats.total} sublabel="registrados" icon={Package} color="#a855f7" glow="rgba(168,85,247,0.5)" delay={1} onClick={() => navigate("/inventory")} />
        <StatCard label="Itens em Falta" value={stats.missing} sublabel="urgência de compra" icon={AlertTriangle} color="#f43f5e" glow="rgba(244,63,94,0.5)" delay={2} onClick={() => navigate("/inventory")} />
        <StatCard label="Custo Estimado" value={stats.cost} prefix="R$" sublabel="caixa da próxima compra" icon={CreditCard} color="#22d3ee" glow="rgba(34,211,238,0.5)" delay={3} />
        <StatCard label="Categorias" value={stats.categories.length} sublabel="departamentos da casa" icon={Layers} color="#10b981" glow="rgba(16,185,129,0.5)" delay={4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* ── O Gráfico Colorido (Mas em Glass-Card Original) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-8 p-6 glass-card card-shine relative overflow-hidden"
        >
           <div className="flex items-center gap-2 mb-6 relative z-10">
              <Box size={16} style={{ color: "#a855f7" }} />
              <h2 className="font-heading font-bold text-sm tracking-widest text-white uppercase">
                Estabilidade por Categoria
              </h2>
           </div>

           <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.categories} margin={{ left: -20, right: 10 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="nome" stroke="transparent" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }} dy={10} />
                 <YAxis stroke="transparent" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }} />
                 <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ background: "rgba(3,3,6,0.85)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", backdropFilter: "blur(10px)", color: "#fff", fontFamily: "monospace" }}
                 />
                 <Bar dataKey="total_itens" radius={[4, 4, 0, 0]}>
                   {stats.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.em_falta > 0 ? "url(#colorFalta)" : "url(#colorNormal)"} />
                    ))}
                 </Bar>
                 <defs>
                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8}/>
                       <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorFalta" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                       <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2}/>
                    </linearGradient>
                 </defs>
              </BarChart>
           </ResponsiveContainer>
        </motion.div>

        {/* ── Avisos de Urgência (Glass-Card) ── */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className="xl:col-span-4 p-6 glass-card card-shine relative overflow-hidden flex flex-col"
        >
           <div className="flex items-center gap-2 mb-6 pb-4 relative z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Target size={16} className="text-rose-400" />
              <h2 className="font-heading font-bold text-sm tracking-widest text-white uppercase">
                Ações Urgentes
              </h2>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10">
              <AnimatePresence>
                {items.filter(i => i.quantidade_atual < i.quantidade_ideal).map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}
                    key={item.id} 
                    className="group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                    whileHover={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
                    onClick={() => navigate("/inventory")}
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <AlertTriangle size={14} className="text-rose-400" />
                        </div>
                        <div>
                           <h3 className="text-white text-sm font-semibold mb-0.5">{item.nome}</h3>
                           <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{item.categoria}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-rose-400 font-bold text-base" style={{ filter: "drop-shadow(0 0 6px rgba(244,63,94,0.5))" }}>
                            {item.quantidade_atual}
                          </span>
                          <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>/ {item.quantidade_ideal}</span>
                        </div>
                     </div>
                     
                     <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ boxShadow: "0 0 8px #f43f5e" }} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.filter(i => i.quantidade_atual < i.quantidade_ideal).length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-40">
                  <Zap className="text-emerald-400 mb-2" size={24}/>
                  <p className="text-emerald-400 font-mono text-xs text-center">SEM PENDÊNCIAS.<br/>ESTOQUE ESTÁVEL.</p>
                </div>
              )}
           </div>
        </motion.div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}
