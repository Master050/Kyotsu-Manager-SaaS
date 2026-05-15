import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ScrollText, Trash2, RefreshCw, Filter, Search, AlertCircle, Info, CheckCircle, AlertTriangle, Loader2, Download, Sparkles, Radio } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LEVELS = ["all", "info", "success", "warning", "error"];
const SOURCES = ["all", "chat", "agent", "system", "workflow", "knowledge"];
const levelIcon = { info: Info, success: CheckCircle, warning: AlertTriangle, error: AlertCircle };
const levelColor = { info: "#4fc3f7", success: "#4ade80", warning: "#fbbf24", error: "#f87171" };
const levelBg = { info: "rgba(79,195,247,0.1)", success: "rgba(74,222,128,0.1)", warning: "rgba(251,191,36,0.1)", error: "rgba(248,113,113,0.1)" };
const logSymbol = { info: "◈", success: "◉", warning: "◆", error: "✕" };

function SignalBars({ value = 75, color = "#a855f7" }) {
  const bars = [30, 55, 75, 100];
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((threshold, i) => (
        <div key={i} className="signal-bar rounded-sm" style={{ width: "3px", height: `${(i + 1) * 4}px`, background: value >= threshold ? color : "rgba(255,255,255,0.1)", boxShadow: value >= threshold ? `0 0 4px ${color}` : "none", animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function useTypewriter(text, speed = 50, delay = 400) {
  const [displayed, setDisplayed] = React.useState("");
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setDisplayed(text.slice(0, ++i));
        if (i >= text.length) clearInterval(iv);
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text]);
  return displayed;
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const params = {};
      if (levelFilter !== "all") params.level = levelFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;
      if (search) params.search = search;
      const res = await axios.get(`${API}/logs`, { params });
      setLogs(res.data.logs || []);
    } finally { setLoading(false); }
  }, [levelFilter, sourceFilter, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(fetchLogs, 5000);
    return () => clearInterval(iv);
  }, [autoRefresh, fetchLogs]);

  const clearLogs = async () => {
    if (!window.confirm("Limpar todos os logs?")) return;
    setClearing(true);
    try { await axios.delete(`${API}/logs`); setLogs([]); }
    finally { setClearing(false); }
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.map(l => `[${l.timestamp}] [${l.level?.toUpperCase()}] [${l.source}] ${l.message}`).join("\n")], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "astra-logs.txt"; a.click();
  };

  const subtitle = useTypewriter("Monitoramento de atividade em tempo real.", 40, 500);

  return (
    <div className="space-y-6">
      {/* ── Command Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden" style={{ padding: "20px 28px" }}>
        <div className="scan-line" style={{ animationDuration: "8s" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="ring-rotate" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(168,85,247,0.5)", borderRightColor: "rgba(79,195,247,0.3)" }} />
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <ScrollText size={18} style={{ color: "#a855f7", filter: "drop-shadow(0 0 5px #a855f7)" }} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading font-bold text-2xl tracking-widest" style={{ background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>LOGS</h1>
                <Sparkles size={14} className="sparkle" style={{ color: "#a855f7" }} />
                {autoRefresh && (
                  <span className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)", color: "#22d3ee" }}>
                    <div className="w-1.5 h-1.5 rounded-full status-online" /> LIVE
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 font-mono">
                <span className="mr-2" style={{ color: "#a855f7" }}>▸</span>
                {subtitle}
                <span className="cursor-blink ml-0.5 text-astra-cyan">|</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right mr-2">
              <Radio size={13} style={{ color: "#4fc3f7", filter: "drop-shadow(0 0 4px #4fc3f7)" }} />
              <div>
                <p className="text-xs font-heading uppercase tracking-wide" style={{ color: "#4fc3f7" }}>{logs.length} EVENTOS</p>
                <p className="text-xs text-slate-600 font-mono">capturados</p>
              </div>
            </div>
            <button data-testid="download-logs-btn" onClick={downloadLogs} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all"><Download size={15} /></button>
            <button data-testid="auto-refresh-btn" onClick={() => setAutoRefresh(!autoRefresh)}
              className="px-3 py-2 rounded-xl text-xs font-heading uppercase tracking-wide transition-all"
              style={{ background: autoRefresh ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${autoRefresh ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.07)"}`, color: autoRefresh ? "#22d3ee" : "#475569" }}>
              <RefreshCw size={11} className={`inline mr-1.5 ${autoRefresh ? "animate-spin" : ""}`} />Auto
            </button>
            <button data-testid="refresh-logs-btn" onClick={fetchLogs} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all"><RefreshCw size={15} /></button>
            <button data-testid="clear-logs-btn" onClick={clearLogs} disabled={clearing || logs.length === 0}
              className="px-3 py-2 rounded-xl text-xs font-heading uppercase tracking-wide transition-all disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {clearing ? <Loader2 size={11} className="animate-spin inline" /> : <Trash2 size={11} className="inline mr-1" />}Limpar
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Level Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(levelColor).map(([level, color], i) => {
          const count = logs.filter(l => l.level === level).length;
          const Icon = levelIcon[level];
          const active = levelFilter === level;
          return (
            <motion.div key={level} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-card card-shine relative overflow-hidden p-4 cursor-pointer transition-all group"
              style={{ border: active ? `1px solid ${color}45` : undefined, transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
              onClick={() => setLevelFilter(active ? "all" : level)}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 0 30px -8px ${color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div className="scan-line" style={{ animationDuration: `${5 + i}s`, animationDelay: `${i * 0.4}s` }} />
              <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "70px", height: "70px", borderRadius: "50%", background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: "blur(15px)" }} />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="p-1.5 rounded-lg" style={{ background: levelBg[level] }}>
                  <Icon size={12} style={{ color }} strokeWidth={2} />
                </div>
                <p className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{level}</p>
              </div>
              <div className="flex items-end gap-2 relative z-10">
                <p className="font-heading font-bold text-2xl number-appear" style={{ color, textShadow: active ? `0 0 15px ${color}` : `0 0 8px ${color}60`, animationDelay: `${i * 0.1}s` }}>{count}</p>
                <SignalBars value={count > 0 ? 75 : 25} color={color} />
              </div>
              {active && <div className="absolute bottom-0 left-[10%] right-[10%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
            </motion.div>
          );
        })}
      </div>

      {/* ── Filters ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card card-shine p-4 relative overflow-hidden">
        <div className="scan-line" style={{ animationDuration: "9s" }} />
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input data-testid="log-search-input" value={search} onChange={e => setSearch(e.target.value)}
              className="astra-input w-full pl-9 pr-4 py-2 text-sm font-mono" placeholder="buscar nos logs..." />
          </div>
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-slate-700 mr-1" />
            {LEVELS.map(lvl => (
              <button key={lvl} data-testid={`level-filter-${lvl}`} onClick={() => setLevelFilter(lvl)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{ background: levelFilter === lvl ? (lvl === "all" ? "rgba(168,85,247,0.2)" : levelBg[lvl]) : "rgba(255,255,255,0.03)", border: `1px solid ${levelFilter === lvl ? (lvl === "all" ? "rgba(168,85,247,0.4)" : levelColor[lvl] + "50") : "rgba(255,255,255,0.06)"}`, color: levelFilter === lvl ? (lvl === "all" ? "#a855f7" : levelColor[lvl]) : "#334155" }}>
                {lvl}
              </button>
            ))}
          </div>
          <select data-testid="source-filter-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            className="text-sm font-mono px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", color: sourceFilter !== "all" ? "#22d3ee" : "#475569", borderRadius: "10px" }}>
            {SOURCES.map(s => <option key={s} value={s} style={{ background: "#0a0a0f" }}>{s === "all" ? "todas as fontes" : s}</option>)}
          </select>
        </div>
      </motion.div>

      {/* ── Terminal Log Window ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card card-shine relative overflow-hidden">
        {/* Terminal top bar */}
        <div className="flex items-center gap-3 px-5 py-3 relative z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-1.5">
            {["#f87171", "#fbbf24", "#4ade80"].map(c => (
              <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <ScrollText size={12} style={{ color: "#a855f7" }} />
            <span className="text-xs font-mono text-slate-500">astra@neural:~/logs$ tail -f system.log</span>
            {autoRefresh && <span className="cursor-blink text-astra-cyan text-xs font-mono">█</span>}
          </div>
          <span className="text-xs font-mono text-slate-700">{logs.length} entradas</span>
        </div>

        {/* Top aurora */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(34,211,238,0.3), transparent)" }} />

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-1" />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-2" />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-3" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-700">
            <ScrollText size={20} style={{ opacity: 0.3 }} />
            <span className="text-sm font-mono">nenhum log encontrado</span>
            <span className="cursor-blink text-slate-600 font-mono">█</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {logs.map((log, i) => {
              const color = levelColor[log.level] || "#475569";
              return (
                <div key={log.id || i} data-testid={`log-row-${i}`}
                  className="flex items-start gap-0 px-5 py-2 group transition-all hover:bg-white/[0.02] font-mono text-xs"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.025)" }}>
                  {/* Symbol */}
                  <span className="flex-shrink-0 w-6 text-center mt-0.5" style={{ color, filter: `drop-shadow(0 0 3px ${color})` }}>
                    {logSymbol[log.level] || "·"}
                  </span>
                  {/* Level */}
                  <span className="flex-shrink-0 w-14 uppercase" style={{ color }}>{log.level}</span>
                  {/* Source */}
                  <span className="flex-shrink-0 w-20 text-slate-600">[{log.source}]</span>
                  {/* Message */}
                  <span className="flex-1 text-slate-400 group-hover:text-slate-200 transition-colors truncate max-w-2xl">{log.message}</span>
                  {/* Timestamp */}
                  <span className="flex-shrink-0 text-slate-700 ml-4 group-hover:text-slate-500 transition-colors whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString("pt-BR") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
