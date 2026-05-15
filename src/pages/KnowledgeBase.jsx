import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Database, Plus, Search, Trash2, Edit2, X, Check, Loader2, RefreshCw, Tag, FileText, Sparkles, Layers } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

export default function KnowledgeBase() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await axios.get(`${API}/knowledge`); setItems(res.data); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ title: "", content: "", tags: "" }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ title: item.title, content: item.content, tags: (item.tags || []).join(", ") }); setShowModal(true); };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), content: form.content.trim(), tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editing) {
        const res = await axios.put(`${API}/knowledge/${editing.id}`, payload);
        setItems(prev => prev.map(i => i.id === editing.id ? res.data : i));
      } else {
        const res = await axios.post(`${API}/knowledge`, payload);
        setItems(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const deleteItem = async (id) => {
    try { await axios.delete(`${API}/knowledge/${id}`); setItems(prev => prev.filter(i => i.id !== id)); } catch (e) { console.error(e); }
  };

  const allTags = [...new Set(items.flatMap(i => i.tags || []))];
  const filtered = items.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || (item.tags || []).includes(tagFilter);
    return matchSearch && matchTag;
  });

  const subtitle = useTypewriter("Repositório de dados neurais da Astra.", 40, 500);

  return (
    <div className="space-y-6">
      {/* ── Command Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden" style={{ padding: "20px 28px" }}>
        <div className="scan-line" style={{ animationDuration: "8s" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="ring-rotate" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(167,139,250,0.5)", borderRightColor: "rgba(79,195,247,0.3)" }} />
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}>
                <Database size={18} style={{ color: "#a78bfa", filter: "drop-shadow(0 0 5px #a78bfa)" }} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading font-bold text-2xl tracking-widest" style={{ background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>KNOWLEDGE BASE</h1>
                <Sparkles size={14} className="sparkle" style={{ color: "#a78bfa" }} />
              </div>
              <p className="text-sm text-slate-400 font-mono">
                <span className="mr-2" style={{ color: "#a78bfa" }}>▸</span>
                {subtitle}
                <span className="cursor-blink ml-0.5 text-astra-cyan">|</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right mr-2">
              <Layers size={13} style={{ color: "#a78bfa", filter: "drop-shadow(0 0 4px #a78bfa)" }} />
              <div>
                <p className="text-xs font-heading uppercase tracking-wide" style={{ color: "#a78bfa" }}>{items.length} NÓDULOS</p>
                <p className="text-xs text-slate-600 font-mono">armazenados</p>
              </div>
            </div>
            <button data-testid="refresh-knowledge-btn" onClick={fetchItems} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all"><RefreshCw size={15} /></button>
            <button data-testid="create-knowledge-btn" onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm relative overflow-hidden">
              <div className="scan-line" style={{ animationDuration: "3s" }} />
              <Plus size={15} /><span className="font-heading tracking-wide">Novo Nódulo</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ─── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: items.length, color: "#a78bfa", glow: "rgba(167,139,250,0.4)", icon: Database },
          { label: "Tags", value: allTags.length, color: "#22d3ee", glow: "rgba(34,211,238,0.4)", icon: Tag },
          { label: "Palavras", value: items.reduce((a, i) => a + (i.content?.split(" ").length || 0), 0), color: "#4fc3f7", glow: "rgba(79,195,247,0.4)", icon: FileText },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-card card-shine relative overflow-hidden p-5 group cursor-default"
            style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 0 30px -8px ${s.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div className="scan-line" style={{ animationDuration: `${5 + i}s`, animationDelay: `${i * 0.4}s` }} />
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, filter: "blur(18px)", opacity: 0.7 }} />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-1.5 rounded-lg" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <s.icon size={11} style={{ color: s.color, filter: `drop-shadow(0 0 3px ${s.color})` }} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
            </div>
            <div className="flex items-end gap-3 relative z-10">
              <p className="font-heading font-bold number-appear" style={{ fontSize: "2.2rem", lineHeight: 1, color: s.color, textShadow: `0 0 15px ${s.glow}`, animationDelay: `${i * 0.1}s` }}>{s.value.toLocaleString()}</p>
              <SignalBars value={s.value > 0 ? 75 : 25} color={s.color} />
            </div>
            <div className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* ── Search & Tags ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card card-shine p-4 relative overflow-hidden space-y-3">
        <div className="scan-line" style={{ animationDuration: "10s" }} />
        <div className="relative z-10">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input data-testid="knowledge-search-input" value={search} onChange={e => setSearch(e.target.value)}
            className="astra-input w-full pl-9 pr-4 py-2.5 text-sm font-body" placeholder="buscar na base de conhecimento..." />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 relative z-10">
            <button onClick={() => setTagFilter("")} className="astra-tag cursor-pointer transition-all" style={{ background: !tagFilter ? "rgba(167,139,250,0.25)" : "rgba(167,139,250,0.08)", borderColor: !tagFilter ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.15)" }}>todos</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? "" : tag)} className="astra-tag cursor-pointer transition-all" style={{ background: tagFilter === tag ? "rgba(167,139,250,0.25)" : "rgba(167,139,250,0.08)", borderColor: tagFilter === tag ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.15)" }}>
                <Tag size={8} className="inline mr-1" />{tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Items ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} className="morse-1" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} className="morse-2" />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} className="morse-3" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card card-shine p-16 text-center relative overflow-hidden">
          <div className="scan-line" />
          <div className="relative inline-block mb-6">
            <div className="ring-rotate" style={{ position: "absolute", inset: "-12px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(167,139,250,0.5)", borderRightColor: "rgba(79,195,247,0.3)" }} />
            <div className="ring-rotate-reverse" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px dashed rgba(167,139,250,0.2)" }} />
            {[0,1].map(i => (
              <div key={i} className="pulse-ring absolute" style={{ inset: 0, borderRadius: "50%", color: "#a78bfa", animationDuration: "2.5s", animationDelay: `${i * 0.6}s`, border: "1px solid rgba(167,139,250,0.3)" }} />
            ))}
            <Database size={40} className="relative" style={{ color: "#a78bfa", filter: "drop-shadow(0 0 8px rgba(167,139,250,0.5))" }} />
          </div>
          <h3 className="font-heading font-semibold text-xl uppercase tracking-widest text-slate-400">{search || tagFilter ? "Nenhum resultado" : "Base vazia"}</h3>
          <p className="text-slate-600 text-sm font-mono mt-2">
            <span className="mr-1" style={{ color: "#a78bfa" }}>▸</span>
            {search || tagFilter ? "tente outros termos" : "adicione conhecimento para a Astra"}
          </p>
          {!search && !tagFilter && <button onClick={openCreate} className="btn-primary mt-6 text-sm relative overflow-hidden"><div className="scan-line" style={{ animationDuration: "3s" }} /><Plus size={14} className="inline mr-1" />Adicionar Primeiro Nódulo</button>}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
              data-testid={`knowledge-item-${item.id}`}
              className="glass-card card-shine relative overflow-hidden p-5 flex flex-col gap-3 group"
              style={{ transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 35px -8px rgba(167,139,250,0.3)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
              <div className="scan-line" style={{ animationDuration: `${6 + i}s`, animationDelay: `${i * 0.5}s` }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent)" }} />

              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <FileText size={13} style={{ color: "#a78bfa" }} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white tracking-wide leading-snug">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button data-testid={`edit-knowledge-${item.id}`} onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors"><Edit2 size={12} /></button>
                  <button data-testid={`delete-knowledge-${item.id}`} onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>

              <p className="text-sm text-slate-500 font-body leading-relaxed line-clamp-4 relative z-10">{item.content}</p>

              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 relative z-10">
                  {item.tags.map(tag => (
                    <span key={tag} className="astra-tag cursor-pointer text-xs" onClick={() => setTagFilter(tag)} style={{ color: "#c4b5fd", borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.1)" }}>
                      <Tag size={8} className="inline mr-1" />{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="relative z-10 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-xs text-slate-700 font-mono">{item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : "—"}</span>
                <span className="text-xs text-slate-700 font-mono">{item.content?.split(" ").length || 0} palavras</span>
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
              style={{ border: "1px solid rgba(167,139,250,0.35)", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="scan-line" />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(34,211,238,0.3), transparent)" }} />

              <div className="flex items-center justify-between mb-5 relative z-10">
                <h2 className="font-heading font-bold text-xl tracking-widest text-white uppercase">{editing ? "Editar Nódulo" : "Novo Nódulo"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white"><X size={16} /></button>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(167,139,250,0.6)" }}>Título *</label>
                  <input data-testid="knowledge-title-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="astra-input w-full px-4 py-2.5 text-sm font-body" placeholder="Título do conhecimento" />
                </div>
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(167,139,250,0.6)" }}>Conteúdo *</label>
                  <textarea data-testid="knowledge-content-input" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="astra-input w-full px-4 py-2.5 text-sm font-body resize-none" rows={8} placeholder="Conteúdo do conhecimento..." />
                </div>
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-1.5" style={{ color: "rgba(167,139,250,0.6)" }}>Tags (vírgula)</label>
                  <input data-testid="knowledge-tags-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="astra-input w-full px-4 py-2.5 text-sm font-mono" placeholder="ia, dados, técnico" />
                </div>
              </div>

              <div className="flex gap-3 mt-5 relative z-10">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
                <button data-testid="save-knowledge-btn" onClick={save} disabled={saving || !form.title.trim() || !form.content.trim()} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
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
