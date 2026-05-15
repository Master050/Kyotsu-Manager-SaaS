import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { 
  ClipboardList, Activity, Search, Filter, 
  Trash2, RefreshCw, AlertCircle, Info, XCircle 
} from "lucide-react";
import { toast } from "sonner";

export default function BotLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();

    // Inscrição em tempo real para novos logs
    const logsSubscription = supabase
      .channel('bot-logs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bot_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 100)); // Mantém os últimos 100
      })
      .subscribe();

    return () => {
      supabase.removeChannel(logsSubscription);
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bot_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar logs");
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const clearLogs = async () => {
    if (!window.confirm("Deseja realmente limpar todos os logs do banco de dados?")) return;
    
    const { error } = await supabase.from("bot_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta todos
    if (!error) {
      setLogs([]);
      toast.success("Logs limpos com sucesso");
    }
  };

  const getLogStyle = (type) => {
    const t = type ? type.toLowerCase() : 'info';
    switch (t) {
      case 'error': return { text: 'text-rose-400', bg: 'bg-rose-500/10', icon: XCircle, border: 'border-rose-500/20' };
      case 'warning': return { text: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertCircle, border: 'border-amber-500/20' };
      case 'action': return { text: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Activity, border: 'border-indigo-500/20' };
      case 'hub_change': return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: RefreshCw, border: 'border-cyan-500/20' };
      case 'idle': return { text: 'text-slate-400', bg: 'bg-slate-500/10', icon: Info, border: 'border-slate-500/20' };
      default: return { text: 'text-blue-400', bg: 'bg-blue-500/10', icon: Info, border: 'border-blue-500/20' };
    }
  };

  const filteredLogs = logs.filter(log => {
    const logType = log.type || 'info';
    const matchesFilter = filter === "ALL" || logType.toUpperCase() === filter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          logType.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-[98%] mx-auto w-full px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <Activity className="text-cyan-400" />
            CONSOLES DE OPERAÇÃO
          </h1>
          <p className="text-slate-400 text-sm font-mono mt-1 uppercase tracking-tighter">
            Monitoramento em tempo real do bot Kyotsu
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={clearLogs}
            className="flex-1 md:flex-none px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all text-xs font-mono uppercase"
          >
            <Trash2 size={14} />
            Limpar Logs
          </button>
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Pesquisar nos logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
          />
        </div>
        
        <div className="md:col-span-6 flex gap-2">
          {["ALL", "ACTION", "HUB_CHANGE", "IDLE", "ERROR"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold transition-all border ${
                filter === lvl 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
              }`}
            >
              {lvl.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Display */}
      <div className="glass-card overflow-hidden min-h-[500px] flex flex-col">
        <div className="bg-black/60 px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Stream</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {filteredLogs.length} Entradas mostradas
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-black/20">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {filteredLogs.map((log) => {
                  const style = getLogStyle(log.type);
                  const Icon = style.icon;
                  
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 w-40 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-28 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
                          <Icon size={10} />
                          {log.type || 'info'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors break-words">
                          {log.message}
                        </p>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              
              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <ClipboardList size={48} className="text-slate-500" />
                      <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">
                        Nenhum log encontrado
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
