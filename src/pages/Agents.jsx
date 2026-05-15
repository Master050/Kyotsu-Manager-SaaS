import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Bot, Plus, Trash2, Edit2, Power, PowerOff, Loader2,
  Cpu, Wrench, X, Check, RefreshCw, Zap, Activity, Users, Wifi, Sparkles
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const tools = ["file", "shell", "browser", "search", "memory", "code", "email", "calendar", "custom"];

function useCountUp(target, duration = 900, delay = 0) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!target) { setCount(0); return; }
    const t = setTimeout(() => {
      let s = 0; const step = target / 30; const iv = setInterval(() => {
        s += step; if (s >= target) { setCount(target); clearInterval(iv); } else setCount(Math.floor(s));
      }, duration / 30);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target]);
  return count;
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

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", model: "astra-default", tools: [], status: "active" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try { const res = await axios.get(`${API}/agents`); setAgents(res.data); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingAgent(null); setForm({ name: "", description: "", model: "astra-default", tools: [], status: "active" }); setShowModal(true); };
  const openEdit = (a) => { setEditingAgent(a); setForm({ name: a.name, description: a.description, model: a.model, tools: a.tools || [], status: a.status }); setShowModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingAgent) {
        const res = await axios.put(`${API}/agents/${editingAgent.id}`, form);
        setAgents(prev => prev.map(a => a.id === editingAgent.id ? res.data : a));
      } else {
        const res = await axios.post(`${API}/agents`, form);
        setAgents(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const deleteAgent = async (id) => {
    try { await axios.delete(`${API}/agents/${id}`); setAgents(prev => prev.filter(a => a.id !== id)); }
    catch (e) { console.error(e); }
  };

  const toggleStatus = async (agent) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    try {
      const res = await axios.put(`${API}/agents/${agent.id}`, { ...agent, status: newStatus });
      setAgents(prev => prev.map(a => a.id === agent.id ? res.data : a));
    } catch (e) { console.error(e); }
  };

  const total = useCountUp(agents.length, 800, 100);
  const active = useCountUp(agents.filter(a => a.status === "active").length, 800, 200);
  const subtitle = useTypewriter("Gerenciamento de sub-agentes neurais.", 40, 500);

  return (
    <div className="space-y-6">
      {/* ── Command Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden" style={{ padding: "20px 28px" }}>
        <div className="scan-line" style={{ animationDuration: "7s" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="ring-rotate" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(34,211,238,0.5)", borderRightColor: "rgba(168,85,247,0.3)" }} />
              <div className="p-2.5 rounded-xl relative" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)" }}>
                <Bot size={18} style={{ color: "#22d3ee", filter: "drop-shadow(0 0 5px #22d3ee)" }} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading font-bold text-2xl tracking-widest" style={{ background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AGENTS</h1>
                <Sparkles size={14} className="sparkle" style={{ color: "#22d3ee" }} />
                <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)", color: "#22d3ee" }}>
                  SUB-NETWORK
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono">
                <span className="mr-2" style={{ color: "#22d3ee" }}>▸</span>
                {subtitle}
                <span className="cursor-blink ml-0.5 text-astra-cyan">|</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right mr-2">
              <Wifi size={13} style={{ color: "#22d3ee", filter: "drop-shadow(0 0 4px #22d3ee)" }} />
              <div>
                <p className="text-xs font-heading uppercase tracking-wide" style={{ color: "#22d3ee" }}>{agents.filter(a => a.status === "active").length} ATIVOS</p>
                <p className="text-xs text-slate-600 font-mono">{agents.length} registrados</p>
              </div>
            </div>
            <button data-testid="refresh-agents-btn" onClick={fetchAgents} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all">
              <RefreshCw size={15} />
            </button>
            <button data-testid="create-agent-btn" onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm relative overflow-hidden">
              <div className="scan-line" style={{ animationDuration: "3s" }} />
              <Plus size={15} />
              <span className="font-heading tracking-wide">Novo Agente</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: total, raw: agents.length, color: "#a855f7", glow: "rgba(168,85,247,0.4)", icon: Users },
          { label: "Ativos", value: active, raw: agents.filter(a => a.status === "active").length, color: "#22d3ee", glow: "rgba(34,211,238,0.4)", icon: Zap },
          { label: "Inativos", value: agents.filter(a => a.status === "inactive").length, raw: agents.filter(a => a.status === "inactive").length, color: "#475569", glow: "rgba(71,85,105,0.3)", icon: PowerOff },
          { label: "Com Tools", value: agents.filter(a => a.tools?.length > 0).length, raw: agents.filter(a => a.tools?.length > 0).length, color: "#4fc3f7", glow: "rgba(79,195,247,0.4)", icon: Wrench },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-card card-shine relative overflow-hidden p-5 group cursor-default"
            style={{ transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
            whileHover={{ y: -3, boxShadow: `0 0 35px -8px ${s.glow}`, borderColor: `${s.color}40` }}>
            <div className="scan-line" style={{ animationDuration: `${5 + i}s`, animationDelay: `${i * 0.5}s` }} />
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, filter: "blur(18px)", opacity: 0.7 }} />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-1.5 rounded-lg" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <s.icon size={11} style={{ color: s.color, filter: `drop-shadow(0 0 3px ${s.color})` }} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
            </div>
            <div className="flex items-end gap-3 relative z-10">
              <p className="font-heading font-bold number-appear" style={{ fontSize: "2.2rem", lineHeight: 1, color: s.color, textShadow: `0 0 20px ${s.glow}`, animationDelay: `${i * 0.1}s` }}>{s.value}</p>
              <SignalBars value={s.raw > 0 ? 75 : 25} color={s.color} />
            </div>
            <div className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* ── Agents Grid ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-1" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-2" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-3" />
        </div>
      ) : agents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card card-shine p-16 text-center relative overflow-hidden">
          <div className="scan-line" />
          <div className="relative inline-block mb-6">
            <div className="ring-rotate" style={{ position: "absolute", inset: "-12px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(34,211,238,0.5)", borderRightColor: "rgba(168,85,247,0.3)" }} />
            <div className="ring-rotate-reverse" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px dashed rgba(79,195,247,0.2)" }} />
            {[0,1].map(i => (
              <div key={i} className="pulse-ring absolute" style={{ inset: 0, borderRadius: "50%", color: "#22d3ee", animationDuration: "2.5s", animationDelay: `${i * 0.6}s`, border: "1px solid rgba(34,211,238,0.3)" }} />
            ))}
            <Bot size={40} className="relative" style={{ color: "#22d3ee", filter: "drop-shadow(0 0 8px rgba(34,211,238,0.5))" }} />
          </div>
          <h3 className="font-heading font-semibold text-xl uppercase tracking-widest text-slate-400">Nenhum agente cadastrado</h3>
          <p className="text-slate-600 text-sm font-mono mt-2">
            <span className="mr-1" style={{ color: "#22d3ee" }}>▸</span>
            crie seu primeiro sub-agente neural
          </p>
          <button data-testid="create-first-agent-btn" onClick={openCreate} className="btn-primary mt-6 text-sm relative overflow-hidden">
            <div className="scan-line" style={{ animationDuration: "3s" }} />
            <Plus size={14} className="inline mr-1" />Criar Agente
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent, i) => {
            const isActive = agent.status === "active";
            return (
              <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
                data-testid={`agent-card-${agent.id}`}
                className="glass-card card-shine relative overflow-hidden p-5 flex flex-col gap-4 group"
                style={{ transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 0 35px -8px ${isActive ? "rgba(34,211,238,0.3)" : "rgba(168,85,247,0.2)"}`;
                  e.currentTarget.style.borderColor = isActive ? "rgba(34,211,238,0.3)" : "rgba(168,85,247,0.25)";
                }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
              >
                <div className="scan-line" style={{ animationDuration: `${6 + i}s`, animationDelay: `${i * 0.7}s` }} />

                {/* Corner glow */}
                <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${isActive ? "rgba(34,211,238,0.2)" : "rgba(168,85,247,0.15)"} 0%, transparent 70%)`, filter: "blur(15px)" }} />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Status ring around icon */}
                    <div className="relative flex-shrink-0 w-10 h-10">
                      {isActive && <div className="ring-rotate absolute inset-[-3px] rounded-xl" style={{ border: "1px solid transparent", borderTopColor: "rgba(34,211,238,0.6)", borderRightColor: "rgba(34,211,238,0.2)" }} />}
                      <div style={{ position: "absolute", inset: 0, borderRadius: "11px", background: isActive ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bot size={16} strokeWidth={1.5} style={{ color: isActive ? "#22d3ee" : "#475569", filter: isActive ? "drop-shadow(0 0 4px #22d3ee)" : "none" }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-white tracking-wide">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#22d3ee" : "#334155", boxShadow: isActive ? "0 0 6px #22d3ee" : "none" }} />
                        <span className="text-xs font-mono" style={{ color: isActive ? "#22d3ee" : "#475569" }}>{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button data-testid={`toggle-agent-${agent.id}`} onClick={() => toggleStatus(agent)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {isActive ? <Power size={13} style={{ color: "#22d3ee" }} /> : <PowerOff size={13} className="text-slate-600" />}
                    </button>
                    <button data-testid={`edit-agent-${agent.id}`} onClick={() => openEdit(agent)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button data-testid={`delete-agent-${agent.id}`} onClick={() => deleteAgent(agent.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {agent.description && <p className="text-sm text-slate-500 font-body leading-relaxed line-clamp-2 relative z-10">{agent.description}</p>}

                <div className="flex items-center gap-2 relative z-10">
                  <Cpu size={11} className="text-slate-700" />
                  <span className="text-xs font-mono text-slate-600">{agent.model}</span>
                </div>

                {agent.tools?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 relative z-10">
                    {agent.tools.map(t => (
                      <span key={t} className="astra-tag flex items-center gap-1 text-xs">
                        <Wrench size={8} />{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative z-10 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-xs text-slate-700 font-mono">
                    criado {agent.created_at ? new Date(agent.created_at).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-card card-shine relative overflow-hidden w-full max-w-md p-6"
              style={{ border: "1px solid rgba(168,85,247,0.35)" }}>
              <div className="scan-line" />
              {/* Top aurora */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(34,211,238,0.4), transparent)" }} />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="font-heading font-bold text-xl tracking-widest text-white uppercase">{editingAgent ? "Editar Agente" : "Novo Agente"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
              </div>

              <div className="space-y-4 relative z-10">
                {[
                  { label: "Nome *", key: "name", placeholder: "Ex: Research Agent", mono: false, testid: "agent-name-input" },
                  { label: "Modelo", key: "model", placeholder: "astra-default", mono: true, testid: "agent-model-input" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(168,85,247,0.6)" }}>{f.label}</label>
                    <input data-testid={f.testid} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className={`astra-input w-full px-4 py-2.5 text-sm ${f.mono ? "font-mono" : "font-body"}`} placeholder={f.placeholder} />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(168,85,247,0.6)" }}>Descrição</label>
                  <textarea data-testid="agent-description-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="astra-input w-full px-4 py-2.5 text-sm font-body resize-none" rows={3} placeholder="O que este agente faz..." />
                </div>

                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(168,85,247,0.6)" }}>Ferramentas</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map(t => (
                      <button key={t} type="button" data-testid={`tool-toggle-${t}`}
                        onClick={() => setForm(p => ({ ...p, tools: p.tools.includes(t) ? p.tools.filter(x => x !== t) : [...p.tools, t] }))}
                        className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                        style={{ background: form.tools.includes(t) ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.tools.includes(t) ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)"}`, color: form.tools.includes(t) ? "#d8b4fe" : "#475569" }}>
                        {form.tools.includes(t) && <Check size={8} className="inline mr-1" />}{t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(168,85,247,0.6)" }}>Status</label>
                  <div className="flex gap-2">
                    {["active", "inactive"].map(s => (
                      <button key={s} type="button" data-testid={`status-${s}`} onClick={() => setForm(p => ({ ...p, status: s }))}
                        className="flex-1 py-2 rounded-xl text-xs font-heading uppercase tracking-wide transition-all"
                        style={{ background: form.status === s ? (s === "active" ? "rgba(34,211,238,0.15)" : "rgba(100,116,139,0.15)") : "rgba(255,255,255,0.03)", border: `1px solid ${form.status === s ? (s === "active" ? "rgba(34,211,238,0.4)" : "rgba(100,116,139,0.3)") : "rgba(255,255,255,0.06)"}`, color: form.status === s ? (s === "active" ? "#22d3ee" : "#94a3b8") : "#334155" }}>
                        {s === "active" ? "Ativo" : "Inativo"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 relative z-10">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
                <button data-testid="save-agent-btn" onClick={save} disabled={saving || !form.name.trim()} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingAgent ? "Salvar" : "Criar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
