import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { GitBranch, Plus, Play, Pause, Trash2, Edit2, X, Check, Loader2, RefreshCw, Clock, List, ChevronDown, ChevronUp, Zap, Sparkles, Activity } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUS = ["active", "paused", "draft"];
const statusLabel = { active: "Ativo", paused: "Pausado", draft: "Rascunho" };
const statusColor = { active: "#22d3ee", paused: "#fbbf24", draft: "#64748b" };
const statusBg = { active: "rgba(34,211,238,0.1)", paused: "rgba(251,191,36,0.1)", draft: "rgba(100,116,139,0.1)" };

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

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", steps: [{ name: "", action: "" }], status: "draft" });
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { fetchWorkflows(); }, []);

  const fetchWorkflows = async () => {
    try { const res = await axios.get(`${API}/workflows`); setWorkflows(res.data); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", steps: [{ name: "", action: "" }], status: "draft" }); setShowModal(true); };
  const openEdit = (wf) => { setEditing(wf); setForm({ name: wf.name, description: wf.description, steps: wf.steps?.length ? wf.steps : [{ name: "", action: "" }], status: wf.status }); setShowModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, steps: form.steps.filter(s => s.name.trim()) };
      if (editing) {
        const res = await axios.put(`${API}/workflows/${editing.id}`, payload);
        setWorkflows(prev => prev.map(w => w.id === editing.id ? res.data : w));
      } else {
        const res = await axios.post(`${API}/workflows`, payload);
        setWorkflows(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const deleteWf = async (id) => { try { await axios.delete(`${API}/workflows/${id}`); setWorkflows(prev => prev.filter(w => w.id !== id)); } catch (e) { console.error(e); } };
  const toggleStatus = async (wf) => {
    const newStatus = wf.status === "active" ? "paused" : "active";
    try { const res = await axios.put(`${API}/workflows/${wf.id}`, { ...wf, status: newStatus }); setWorkflows(prev => prev.map(w => w.id === wf.id ? res.data : w)); } catch (e) { console.error(e); }
  };
  const runWorkflow = async (id) => {
    setRunning(id);
    try { await axios.post(`${API}/workflows/${id}/run`); await fetchWorkflows(); } finally { setRunning(null); }
  };

  const addStep = () => setForm(p => ({ ...p, steps: [...p.steps, { name: "", action: "" }] }));
  const removeStep = (i) => setForm(p => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i, k, v) => setForm(p => ({ ...p, steps: p.steps.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));

  const subtitle = useTypewriter("Automações e fluxos neurais da Astra.", 40, 500);

  return (
    <div className="space-y-6">
      {/* ── Command Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden" style={{ padding: "20px 28px" }}>
        <div className="scan-line" style={{ animationDuration: "7s" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="ring-rotate" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(79,195,247,0.5)", borderRightColor: "rgba(168,85,247,0.3)" }} />
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.25)" }}>
                <GitBranch size={18} style={{ color: "#4fc3f7", filter: "drop-shadow(0 0 5px #4fc3f7)" }} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading font-bold text-2xl tracking-widest" style={{ background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>WORKFLOWS</h1>
                <Sparkles size={14} className="sparkle" style={{ color: "#4fc3f7" }} />
                <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.25)", color: "#4fc3f7" }}>
                  AUTOMATIONS
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono">
                <span className="mr-2" style={{ color: "#4fc3f7" }}>▸</span>
                {subtitle}
                <span className="cursor-blink ml-0.5 text-astra-cyan">|</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right mr-2">
              <Activity size={13} style={{ color: "#22d3ee", filter: "drop-shadow(0 0 4px #22d3ee)" }} />
              <div>
                <p className="text-xs font-heading uppercase tracking-wide" style={{ color: "#22d3ee" }}>{workflows.filter(w => w.status === "active").length} ATIVOS</p>
                <p className="text-xs text-slate-600 font-mono">{workflows.length} total</p>
              </div>
            </div>
            <button data-testid="refresh-workflows-btn" onClick={fetchWorkflows} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all"><RefreshCw size={15} /></button>
            <button data-testid="create-workflow-btn" onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm relative overflow-hidden">
              <div className="scan-line" style={{ animationDuration: "3s" }} />
              <Plus size={15} /><span className="font-heading tracking-wide">Novo Workflow</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ─── */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS.map((s, i) => {
          const count = workflows.filter(w => w.status === s).length;
          const icons = { active: Zap, paused: Pause, draft: Edit2 };
          const StatusIcon = icons[s];
          return (
            <motion.div key={s} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-card card-shine relative overflow-hidden p-5 group cursor-default"
              style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 0 30px -8px ${statusColor[s]}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div className="scan-line" style={{ animationDuration: `${6 + i}s`, animationDelay: `${i * 0.5}s` }} />
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${statusColor[s]}30 0%, transparent 70%)`, filter: "blur(18px)" }} />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="p-1.5 rounded-lg" style={{ background: statusBg[s], border: `1px solid ${statusColor[s]}30` }}>
                  <StatusIcon size={11} style={{ color: statusColor[s], filter: `drop-shadow(0 0 3px ${statusColor[s]})` }} strokeWidth={1.5} />
                </div>
                <p className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{statusLabel[s]}</p>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <p className="font-heading font-bold number-appear" style={{ fontSize: "2.2rem", lineHeight: 1, color: statusColor[s], textShadow: `0 0 15px ${statusColor[s]}60`, animationDelay: `${i * 0.1}s` }}>
                  {count}
                </p>
                <SignalBars value={count > 0 ? 75 : 25} color={statusColor[s]} />
              </div>
              <div className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${statusColor[s]}50, transparent)` }} />
            </motion.div>
          );
        })}
      </div>

      {/* ── Workflows ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4fc3f7" }} className="morse-1" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4fc3f7" }} className="morse-2" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4fc3f7" }} className="morse-3" />
        </div>
      ) : workflows.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card card-shine p-16 text-center relative overflow-hidden">
          <div className="scan-line" />
          <div className="relative inline-block mb-6">
            <div className="ring-rotate" style={{ position: "absolute", inset: "-12px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(79,195,247,0.5)", borderRightColor: "rgba(168,85,247,0.3)" }} />
            <div className="ring-rotate-reverse" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px dashed rgba(79,195,247,0.2)" }} />
            {[0,1].map(i => (
              <div key={i} className="pulse-ring absolute" style={{ inset: 0, borderRadius: "50%", color: "#4fc3f7", animationDuration: "2.5s", animationDelay: `${i * 0.6}s`, border: "1px solid rgba(79,195,247,0.3)" }} />
            ))}
            <GitBranch size={40} className="relative" style={{ color: "#4fc3f7", filter: "drop-shadow(0 0 8px rgba(79,195,247,0.5))" }} />
          </div>
          <h3 className="font-heading font-semibold text-xl uppercase tracking-widest text-slate-400">Nenhum workflow</h3>
          <p className="text-slate-600 text-sm font-mono mt-2">
            <span className="mr-1" style={{ color: "#4fc3f7" }}>▸</span>
            crie automações para a Astra executar
          </p>
          <button onClick={openCreate} className="btn-primary mt-6 text-sm relative overflow-hidden"><div className="scan-line" style={{ animationDuration: "3s" }} /><Plus size={14} className="inline mr-1" />Criar Workflow</button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf, i) => (
            <motion.div key={wf.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
              data-testid={`workflow-card-${wf.id}`}
              className="glass-card card-shine relative overflow-hidden">
              <div className="scan-line" style={{ animationDuration: `${7 + i}s`, animationDelay: `${i * 0.6}s` }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${statusColor[wf.status]}40, transparent)` }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status ring */}
                    <div className="relative flex-shrink-0 w-10 h-10">
                      {wf.status === "active" && <div className="ring-rotate absolute inset-[-3px] rounded-xl" style={{ border: "1px solid transparent", borderTopColor: `${statusColor[wf.status]}70` }} />}
                      <div style={{ position: "absolute", inset: 0, borderRadius: "11px", background: statusBg[wf.status], border: `1px solid ${statusColor[wf.status]}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GitBranch size={15} strokeWidth={1.5} style={{ color: statusColor[wf.status], filter: wf.status === "active" ? `drop-shadow(0 0 4px ${statusColor[wf.status]})` : "none" }} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-base text-white tracking-wide">{wf.name}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: statusBg[wf.status], color: statusColor[wf.status] }}>{statusLabel[wf.status]}</span>
                      </div>
                      {wf.description && <p className="text-sm text-slate-500 font-body mt-1">{wf.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-700">
                        <span className="flex items-center gap-1"><List size={10} />{wf.steps?.length || 0} passos</span>
                        {wf.last_run && <span className="flex items-center gap-1"><Clock size={10} />{new Date(wf.last_run).toLocaleString("pt-BR")}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button data-testid={`run-workflow-${wf.id}`} onClick={() => runWorkflow(wf.id)} disabled={running === wf.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-heading uppercase tracking-wide transition-all relative overflow-hidden disabled:opacity-50"
                      style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
                      {running === wf.id ? <Loader2 size={11} className="animate-spin inline" /> : <Play size={10} className="inline mr-1" />}
                      Executar
                    </button>
                    <button data-testid={`toggle-workflow-${wf.id}`} onClick={() => toggleStatus(wf)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors">
                      {wf.status === "active" ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <button data-testid={`edit-workflow-${wf.id}`} onClick={() => openEdit(wf)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors"><Edit2 size={13} /></button>
                    <button data-testid={`delete-workflow-${wf.id}`} onClick={() => deleteWf(wf.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    <button onClick={() => setExpanded(p => ({ ...p, [wf.id]: !p[wf.id] }))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors">
                      {expanded[wf.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded[wf.id] && wf.steps?.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="space-y-2">
                        {wf.steps.map((step, j) => (
                          <div key={j} className="flex items-center gap-3 text-sm font-mono">
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>{j + 1}</div>
                            <span className="text-slate-400">{step.name || "passo sem nome"}</span>
                            {step.action && <span className="text-slate-700 ml-auto text-xs">{step.action}</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
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
              className="glass-card card-shine relative overflow-hidden w-full max-w-lg p-6"
              style={{ border: "1px solid rgba(79,195,247,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="scan-line" />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.6), rgba(168,85,247,0.4), transparent)" }} />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="font-heading font-bold text-xl tracking-widest text-white uppercase">{editing ? "Editar Workflow" : "Novo Workflow"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white"><X size={16} /></button>
              </div>

              <div className="space-y-4 relative z-10">
                {[{ label: "Nome *", key: "name", ph: "Nome do workflow" }, { label: "Descrição", key: "description", ph: "O que este workflow faz..." }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(79,195,247,0.6)" }}>{f.label}</label>
                    {f.key === "description"
                      ? <textarea data-testid={`workflow-${f.key}-input`} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="astra-input w-full px-4 py-2.5 text-sm font-body resize-none" rows={2} placeholder={f.ph} />
                      : <input data-testid={`workflow-${f.key}-input`} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="astra-input w-full px-4 py-2.5 text-sm font-body" placeholder={f.ph} />}
                  </div>
                ))}

                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(79,195,247,0.6)" }}>Status</label>
                  <div className="flex gap-2">
                    {STATUS.map(s => (
                      <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                        className="flex-1 py-2 rounded-xl text-xs font-heading uppercase tracking-wide transition-all"
                        style={{ background: form.status === s ? statusBg[s] : "rgba(255,255,255,0.03)", border: `1px solid ${form.status === s ? statusColor[s] + "50" : "rgba(255,255,255,0.06)"}`, color: form.status === s ? statusColor[s] : "#334155" }}>
                        {statusLabel[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(79,195,247,0.6)" }}>Passos</label>
                    <button type="button" onClick={addStep} className="text-xs font-mono flex items-center gap-1 transition-colors hover:text-white" style={{ color: "#4fc3f7" }}><Plus size={10} /> adicionar</button>
                  </div>
                  <div className="space-y-2">
                    {form.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-700 font-mono w-5 text-right">{i + 1}.</span>
                        <input value={step.name} onChange={e => updateStep(i, "name", e.target.value)} className="astra-input flex-1 px-3 py-2 text-sm font-body" placeholder="Nome do passo" />
                        <input value={step.action} onChange={e => updateStep(i, "action", e.target.value)} className="astra-input flex-1 px-3 py-2 text-xs font-mono" placeholder="ação/comando" />
                        {form.steps.length > 1 && <button type="button" onClick={() => removeStep(i)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-700 hover:text-red-400 transition-colors"><X size={11} /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 relative z-10">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
                <button data-testid="save-workflow-btn" onClick={save} disabled={saving || !form.name.trim()} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{editing ? "Salvar" : "Criar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
