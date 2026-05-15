import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Plus, Trash2, MessageSquare, Bot, Loader2,
  Sparkles, Copy, MoreHorizontal, X, Brain, Zap, ChevronRight
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function NeuralThinking() {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.3), rgba(79,195,247,0.2))", border: "1px solid rgba(34,211,238,0.3)" }}
      >
        <Bot size={14} className="text-white" strokeWidth={1.5} />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
            {[0, 1, 2].map(i => (
              <div key={i} className="pulse-ring absolute" style={{
                width: "100%", height: "100%", color: "#a855f7",
                animationDuration: "1.8s", animationDelay: `${i * 0.4}s`,
                border: "1px solid rgba(168,85,247,0.5)",
              }} />
            ))}
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />
          </div>
          <span className="text-xs font-mono text-slate-500">processando</span>
          <span className="cursor-blink text-astra-purple text-xs font-mono">█</span>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [convMenuId, setConvMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (conversationId) loadConversation(conversationId); }, [conversationId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/conversations`);
      setConversations(res.data);
    } finally { setLoadingConvs(false); }
  };

  const loadConversation = async (id) => {
    try {
      const res = await axios.get(`${API}/conversations/${id}`);
      setCurrentConv(res.data);
      setMessages(res.data.messages || []);
    } catch (e) { console.error(e); }
  };

  const createConversation = async () => {
    try {
      const res = await axios.post(`${API}/conversations`, { title: "Nova Sessão" });
      setConversations(prev => [res.data, ...prev]);
      setCurrentConv(res.data);
      setMessages([]);
      navigate(`/chat/${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConv?.id === id) { setCurrentConv(null); setMessages([]); navigate("/chat"); }
    } catch (e) { console.error(e); }
    setConvMenuId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    let convId = currentConv?.id;
    if (!convId) {
      try {
        const res = await axios.post(`${API}/conversations`, { title: text.substring(0, 40) + (text.length > 40 ? "..." : "") });
        convId = res.data.id;
        setCurrentConv(res.data);
        setConversations(prev => [res.data, ...prev]);
        navigate(`/chat/${convId}`);
      } catch (e) { return; }
    }
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/conversations/${convId}/messages`, { content: text });
      setMessages(res.data.messages || []);
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: res.data.title, updated_at: res.data.updated_at } : c));
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: e.response?.data?.detail || "Erro ao conectar. Configure o OpenClaw em Settings.", timestamp: new Date().toISOString(), error: true }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const suggestions = ["O que você pode fazer?", "Como me ajudar hoje?", "Liste seus agentes ativos", "Analise os logs recentes"];

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 md:-m-8 overflow-hidden">

      {/* ── Conversation Sidebar ─────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col" style={{ background: "rgba(3,3,6,0.85)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(168,85,247,0.1)" }}>

        {/* Header */}
        <div className="p-4 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(168,85,247,0.1)" }}>
          <div className="aurora-line absolute bottom-0 left-0 right-0" />
          <button
            data-testid="new-conversation-btn"
            onClick={createConversation}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm relative overflow-hidden group"
          >
            <div className="scan-line" style={{ animationDuration: "3s" }} />
            <Plus size={15} />
            <span className="font-heading tracking-wide">Nova Sessão</span>
          </button>
        </div>

        {/* Sessions label */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-heading uppercase tracking-widest" style={{ color: "rgba(168,85,247,0.45)" }}>
            Sessões — {conversations.length}
          </p>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-1" />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-2" />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} className="morse-3" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Brain size={20} className="mx-auto mb-2" style={{ color: "#a855f7", opacity: 0.4 }} />
              <p className="text-xs text-slate-600 font-mono">sem sessões anteriores</p>
            </div>
          ) : (
            conversations.map((conv, idx) => {
              const isActive = currentConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  data-testid={`conversation-${conv.id}`}
                  className="group relative flex items-center gap-2 p-3 rounded-xl cursor-pointer mb-0.5 transition-all"
                  style={{
                    background: isActive ? "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(34,211,238,0.06))" : "transparent",
                    border: isActive ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
                    animation: `stagger-in 0.3s ease-out ${idx * 0.04}s both`,
                  }}
                  onClick={() => { setCurrentConv(conv); loadConversation(conv.id); navigate(`/chat/${conv.id}`); }}
                >
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#a855f7" : "#1e293b", boxShadow: isActive ? "0 0 6px #a855f7" : "none" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body truncate" style={{ color: isActive ? "#e2e8f0" : "#475569" }}>{conv.title}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "#1e293b" }}>
                      {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 size={12} className="text-slate-600 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Main ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-3 relative overflow-hidden"
          style={{ background: "rgba(3,3,6,0.7)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(168,85,247,0.1)" }}
        >
          <div className="aurora-line absolute bottom-0 left-0 right-0" />
          {/* Astra logo small with rotating ring */}
          <div className="relative flex-shrink-0 w-9 h-9">
            <div className="ring-rotate absolute inset-[-4px] rounded-xl" style={{ border: "1px solid transparent", borderTopColor: "rgba(168,85,247,0.5)", borderRightColor: "rgba(34,211,238,0.2)" }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "12px",
              background: "radial-gradient(ellipse at 30% 25%, rgba(79,195,247,0.4) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(168,85,247,0.5) 0%, transparent 55%), #050510",
              border: "1px solid rgba(168,85,247,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "16px", background: "linear-gradient(135deg, #e0f2fe 0%, #c4b5fd 40%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>A</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base tracking-widest text-white">ASTRA</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee" }}>NEURAL INTERFACE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full status-online" />
              <span className="text-xs font-mono text-slate-600">
                {currentConv?.title || "aguardando sessão..."}
              </span>
            </div>
          </div>
          {currentConv && (
            <div className="text-xs font-mono text-slate-700 flex-shrink-0">
              {(currentConv.messages?.length || messages.length)} msg
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence>
            {!currentConv && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center h-full py-12 text-center"
              >
                {/* Big logo with rings */}
                <div className="relative mb-8">
                  <div className="ring-rotate" style={{ position: "absolute", inset: "-16px", borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(168,85,247,0.5)", borderRightColor: "rgba(34,211,238,0.3)" }} />
                  <div className="ring-rotate-reverse" style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: "1px dashed rgba(79,195,247,0.2)" }} />
                  {[0,1,2].map(i => (
                    <div key={i} className="pulse-ring absolute" style={{
                      inset: 0, borderRadius: "24px", color: "#a855f7",
                      animationDuration: "2.5s", animationDelay: `${i * 0.6}s`,
                      border: "1px solid rgba(168,85,247,0.3)",
                    }} />
                  ))}
                  <div style={{
                    width: "90px", height: "90px", borderRadius: "24px",
                    background: "radial-gradient(ellipse at 30% 25%, rgba(79,195,247,0.5) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(168,85,247,0.6) 0%, transparent 55%), #050510",
                    border: "1px solid rgba(168,85,247,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(34,211,238,0.15)",
                  }}>
                    <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "44px", background: "linear-gradient(135deg, #e0f2fe 0%, #c4b5fd 40%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>A</span>
                  </div>
                </div>

                <h2 className="font-heading font-bold text-4xl tracking-wide mb-1" style={{ background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Olá, eu sou Astra
                </h2>
                <p className="text-slate-500 font-mono text-sm mb-8">Interface Neural Ativa · OpenClaw Gateway</p>

                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      data-testid="suggestion-btn"
                      onClick={() => setInput(s)}
                      className="text-xs px-4 py-2.5 rounded-xl font-mono transition-all group relative overflow-hidden"
                      style={{ border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7", background: "rgba(168,85,247,0.05)" }}
                    >
                      <div className="scan-line" style={{ animationDuration: "3s", animationDelay: `${Math.random() * 2}s` }} />
                      <ChevronRight size={10} className="inline mr-1 opacity-60" />
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end"
                  style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                      : "radial-gradient(ellipse at 30% 25%, rgba(79,195,247,0.4) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(168,85,247,0.5) 0%, transparent 55%), #050510",
                    border: msg.role === "user" ? "none" : "1px solid rgba(168,85,247,0.3)",
                    boxShadow: msg.role === "user" ? "0 0 12px rgba(168,85,247,0.4)" : "0 0 12px rgba(34,211,238,0.25)",
                  }}
                >
                  {msg.role === "user"
                    ? <span className="text-xs font-heading font-bold text-white">U</span>
                    : <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "13px", background: "linear-gradient(135deg, #e0f2fe, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>A</span>
                  }
                </div>

                {/* Bubble */}
                <div className={`group max-w-[72%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className="relative overflow-hidden px-4 py-3 rounded-2xl card-shine"
                    style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.15))"
                        : "rgba(255,255,255,0.04)",
                      border: msg.role === "user"
                        ? "1px solid rgba(168,85,247,0.3)"
                        : msg.error ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: msg.error ? "rgba(239,68,68,0.08)" : undefined,
                    }}
                  >
                    <p className="text-sm font-body leading-relaxed whitespace-pre-wrap" style={{ color: msg.error ? "#f87171" : "#e2e8f0" }}>
                      {msg.content}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs text-slate-700 font-mono">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(msg.content)}>
                      <Copy size={10} className="text-slate-600 hover:text-slate-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && <NeuralThinking />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 relative overflow-hidden" style={{ background: "rgba(3,3,6,0.7)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(168,85,247,0.1)" }}>
          <div className="aurora-line absolute top-0 left-0 right-0" />
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mensagem para Astra..."
                rows={1}
                className="astra-input w-full px-4 py-3 text-sm font-body resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onInput={(e) => { e.target.style.height = "48px"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              />
            </div>
            <button
              data-testid="send-message-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="btn-primary flex items-center gap-2 px-4 py-3 text-sm flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ minWidth: "52px", justifyContent: "center" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap size={10} style={{ color: "#a855f7" }} />
            <p className="text-xs text-slate-700 font-mono">
              OpenClaw Gateway ·{" "}
              <button className="transition-colors hover:text-astra-cyan" style={{ color: "#334155" }} onClick={() => navigate("/settings")}>
                configurar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
