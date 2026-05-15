import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Settings as SettingsIcon, Save, Loader2, Check, Wifi, WifiOff, Brain, Sliders, Terminal, Link, Eye, EyeOff, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

function SectionCard({ title, subtitle, icon: Icon, color, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="glass-card card-shine relative overflow-hidden p-6 space-y-5">
      <div className="scan-line" style={{ animationDuration: "9s" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      <div className="flex items-center gap-3 pb-4 relative z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="p-2.5 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-heading font-bold text-base uppercase tracking-widest text-white">{title}</h2>
          <p className="text-xs text-slate-600 font-mono">{subtitle}</p>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await axios.get(`${API}/settings`); setSettings(res.data); }
    catch { setSettings({ openclaw_url: "http://localhost:59062", openclaw_port: 59062, openclaw_api_path: "/v1/chat/completions", astra_model: "astra-default", astra_system_prompt: "Você é Astra, uma IA assistente pessoal avançada.", astra_temperature: 0.7, astra_max_tokens: 4096, log_retention_days: 30, messages_per_page: 50 }); }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try { await axios.put(`${API}/settings`, settings); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    finally { setSaving(false); }
  };

  const testConnection = async () => {
    setTesting(true); setConnStatus(null);
    try {
      const res = await axios.post(`${API}/settings/test-connection`, { url: settings?.openclaw_url });
      setConnStatus(res.data);
    } catch (e) { setConnStatus({ success: false, message: e.response?.data?.detail || "Falha na conexão" }); }
    finally { setTesting(false); }
  };

  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const subtitle = useTypewriter("Painel de controle do sistema neural.", 40, 500);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3">
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-1" />
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-2" />
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} className="morse-3" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Command Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card card-shine relative overflow-hidden" style={{ padding: "20px 28px" }}>
        <div className="scan-line" style={{ animationDuration: "7s" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="ring-rotate" style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(168,85,247,0.5)", borderRightColor: "rgba(34,211,238,0.3)" }} />
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <SettingsIcon size={18} style={{ color: "#a855f7", filter: "drop-shadow(0 0 5px #a855f7)" }} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading font-bold text-2xl tracking-widest" style={{ background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SETTINGS</h1>
                <Sparkles size={14} className="sparkle" style={{ color: "#a855f7" }} />
                <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7" }}>
                  CONTROL PANEL
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono">
                <span className="mr-2" style={{ color: "#a855f7" }}>▸</span>
                {subtitle}
                <span className="cursor-blink ml-0.5 text-astra-cyan">|</span>
              </p>
            </div>
          </div>
          <button data-testid="save-settings-btn" onClick={saveSettings} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm relative overflow-hidden">
            <div className="scan-line" style={{ animationDuration: "3s" }} />
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} style={{ color: "#22d3ee" }} /> : <Save size={14} />}
            <span className="font-heading tracking-wide">{saved ? "Salvo!" : "Salvar Tudo"}</span>
          </button>
        </div>
      </motion.div>

      {/* ── OpenClaw ─── */}
      <SectionCard title="OpenClaw Gateway" subtitle="conexão com a IA local" icon={Link} color="#22d3ee">
        {connStatus && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl text-sm font-body mb-4"
            style={{ background: connStatus.success ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${connStatus.success ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`, color: connStatus.success ? "#4ade80" : "#f87171" }}>
            {connStatus.success ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="font-mono text-xs">{connStatus.message}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(34,211,238,0.5)" }}>Gateway URL</label>
            <div className="flex gap-2">
              <input data-testid="openclaw-url-input" value={settings?.openclaw_url || ""} onChange={e => update("openclaw_url", e.target.value)}
                className="astra-input flex-1 px-4 py-2.5 text-sm font-mono" placeholder="http://localhost:59062" />
              <button data-testid="test-connection-btn" onClick={testConnection} disabled={testing}
                className="btn-secondary px-4 text-sm flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                {testing ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />}Testar
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(34,211,238,0.5)" }}>API Path</label>
            <input data-testid="openclaw-api-path-input" value={settings?.openclaw_api_path || ""} onChange={e => update("openclaw_api_path", e.target.value)}
              className="astra-input w-full px-4 py-2.5 text-sm font-mono" placeholder="/v1/chat/completions" />
          </div>
          <div>
            <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(34,211,238,0.5)" }}>Porta</label>
            <input data-testid="openclaw-port-input" type="number" value={settings?.openclaw_port || 59062} onChange={e => update("openclaw_port", parseInt(e.target.value))}
              className="astra-input w-full px-4 py-2.5 text-sm font-mono" />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.1)" }}>
          <p className="text-xs font-heading uppercase tracking-widest mb-2" style={{ color: "rgba(34,211,238,0.4)" }}>Instruções de Configuração</p>
          <div className="space-y-1.5 text-xs font-mono text-slate-600">
            <p><span style={{ color: "#22d3ee" }}>01</span> · Execute <span style={{ color: "#a855f7" }}>ngrok http 59062</span> e cole a URL gerada acima</p>
            <p><span style={{ color: "#22d3ee" }}>02</span> · Configure CORS no OpenClaw para aceitar este domínio</p>
            <p><span style={{ color: "#22d3ee" }}>03</span> · Ou deixe para a Astra configurar automaticamente</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Astra Config ─── */}
      <SectionCard title="Configuração da Astra" subtitle="personalidade e comportamento" icon={Brain} color="#a855f7">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(168,85,247,0.5)" }}>Modelo</label>
            <input data-testid="astra-model-input" value={settings?.astra_model || ""} onChange={e => update("astra_model", e.target.value)}
              className="astra-input w-full px-4 py-2.5 text-sm font-mono" placeholder="astra-default" />
            <p className="text-xs text-slate-700 font-mono mt-1">ex: claude-opus-4, llama3.2, astra-default</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(168,85,247,0.5)" }}>Prompt do Sistema</label>
              <button onClick={() => setShowPrompt(!showPrompt)} className="text-xs font-mono flex items-center gap-1 text-slate-600 hover:text-white transition-colors">
                {showPrompt ? <EyeOff size={10} /> : <Eye size={10} />}{showPrompt ? "ocultar" : "mostrar"}
              </button>
            </div>
            {showPrompt ? (
              <textarea data-testid="system-prompt-input" value={settings?.astra_system_prompt || ""} onChange={e => update("astra_system_prompt", e.target.value)}
                className="astra-input w-full px-4 py-3 text-sm font-body resize-none" rows={7} placeholder="Você é Astra..." />
            ) : (
              <div className="p-3 rounded-xl text-xs text-slate-600 font-mono cursor-pointer hover:bg-white/5 transition-colors"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}
                onClick={() => setShowPrompt(true)}>
                {settings?.astra_system_prompt ? settings.astra_system_prompt.substring(0, 100) + "..." : "clique para editar o prompt..."}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(168,85,247,0.5)" }}>Temperatura</label>
                <span className="text-xs font-mono" style={{ color: "#a855f7" }}>{settings?.astra_temperature?.toFixed(1)}</span>
              </div>
              <input data-testid="temperature-slider" type="range" min="0" max="2" step="0.1" value={settings?.astra_temperature || 0.7} onChange={e => update("astra_temperature", parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: "#a855f7" }} />
              <div className="flex justify-between text-xs text-slate-700 font-mono mt-1"><span>Preciso</span><span>Criativo</span></div>
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(168,85,247,0.5)" }}>Max Tokens</label>
              <input data-testid="max-tokens-input" type="number" value={settings?.astra_max_tokens || 4096} onChange={e => update("astra_max_tokens", parseInt(e.target.value))}
                className="astra-input w-full px-4 py-2.5 text-sm font-mono" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Interface ─── */}
      <SectionCard title="Interface" subtitle="preferências visuais e de sistema" icon={Sliders} color="#4fc3f7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Retenção de Logs (dias)", key: "log_retention_days", type: "number" },
            { label: "Mensagens por Página", key: "messages_per_page", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-heading uppercase tracking-widest block mb-2" style={{ color: "rgba(79,195,247,0.5)" }}>{f.label}</label>
              <input data-testid={`${f.key}-input`} type={f.type} value={settings?.[f.key] || ""} onChange={e => update(f.key, parseInt(e.target.value))}
                className="astra-input w-full px-4 py-2.5 text-sm font-mono" />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── System Info ─── */}
      <SectionCard title="Sistema" subtitle="informações da instância" icon={Terminal} color="#a78bfa">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Versão", value: "1.0.0", color: "#a78bfa" },
            { label: "Backend", value: "FastAPI + MongoDB", color: "#22d3ee" },
            { label: "Frontend", value: "React 19 + Tailwind", color: "#4fc3f7" },
          ].map((info, i) => (
            <div key={info.label} className="p-3 rounded-xl relative overflow-hidden group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "border-color 0.3s, box-shadow 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${info.color}30`; e.currentTarget.style.boxShadow = `0 0 20px -5px ${info.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "40px", height: "40px", borderRadius: "50%", background: `radial-gradient(circle, ${info.color}15 0%, transparent 70%)`, filter: "blur(8px)" }} />
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: info.color, boxShadow: `0 0 4px ${info.color}` }} />
                <p className="text-xs text-slate-700 font-heading uppercase tracking-widest">{info.label}</p>
              </div>
              <p className="text-sm font-mono text-slate-400">{info.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button data-testid="save-settings-bottom-btn" onClick={saveSettings} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm relative overflow-hidden">
          <div className="scan-line" style={{ animationDuration: "3s" }} />
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} style={{ color: "#22d3ee" }} /> : <Save size={14} />}
          <span className="font-heading tracking-wide">{saved ? "Salvo com sucesso!" : "Salvar Configurações"}</span>
        </button>
      </div>
    </div>
  );
}
