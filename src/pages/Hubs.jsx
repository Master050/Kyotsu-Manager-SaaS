import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Loader2, Save, Server, RefreshCw, Key, 
  Settings, Globe, Shield, Activity, Hash, Info, ChevronRight,
  MoreVertical, CheckCircle, AlertCircle, Clock, Lock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Hubs() {
  const [hubs, setHubs] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user, isAdmin, hubLimit } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: hubsData, error: hubsError } = await supabase
      .from("hubs")
      .select("*")
      .order("name", { ascending: true });

    const { data: keysData, error: keysError } = await supabase
      .from("keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (hubsError || keysError) {
      toast.error("Erro ao carregar dados");
    } else {
      setHubs(hubsData || []);
      setKeys(keysData || []);
      if (hubsData?.length > 0 && !selectedHubId) {
        setSelectedHubId(hubsData[0].id);
      }
    }
    setLoading(false);
  };

  const handleCellChange = (id, field, value) => {
    setHubs((prev) =>
      prev.map((hub) => (hub.id === id ? { ...hub, [field]: value, is_dirty: true } : hub))
    );
  };

  const saveChanges = async () => {
    const dirtyHubs = hubs.filter((h) => h.is_dirty);
    if (dirtyHubs.length === 0) return;

    setSaving(true);
    let success = true;

    for (const hub of dirtyHubs) {
      const { id, name, url, cap_hours } = hub;
      const { error } = await supabase
        .from("hubs")
        .update({ name, url, cap_hours })
        .eq("id", id);
      if (error) success = false;
    }

    if (success) {
      toast.success("Configurações atualizadas!");
      setHubs(hubs.map(h => ({ ...h, is_dirty: false })));
    } else {
      toast.error("Erro ao salvar algumas alterações");
    }
    setSaving(false);
  };

  const addNewHub = async () => {
    if (hubs.length >= hubLimit) {
      toast.error(`Limite do seu plano atingido (${hubLimit} Hubs). Faça upgrade para adicionar mais!`, {
        icon: <Lock className="text-amber-500" />
      });
      return;
    }

    const newHub = {
      name: "Novo Hub",
      url: "https://ads.luarmor.net/...",
      cap_hours: 48,
    };

    const { data, error } = await supabase.from("hubs").insert([newHub]).select();
    if (!error && data) {
      setHubs([...hubs, data[0]]);
      setSelectedHubId(data[0].id);
      toast.success("Hub criado!");
    }
  };

  const deleteHub = async (id) => {
    const { error } = await supabase.from("hubs").delete().eq("id", id);
    if (!error) {
      const newHubs = hubs.filter((h) => h.id !== id);
      setHubs(newHubs);
      if (selectedHubId === id && newHubs.length > 0) {
        setSelectedHubId(newHubs[0].id);
      }
      toast.success("Hub removido");
    }
    setDeleteConfirm(null);
  };

  const activeHub = hubs.find(h => h.id === selectedHubId);
  const activeHubKeys = keys.filter(k => k.hub_id === selectedHubId);

  if (loading && hubs.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex overflow-hidden rounded-2xl glass-card border border-white/5 bg-black/20">
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteHub(deleteConfirm?.id)}
        title="Remover Hub"
        message={`Deseja realmente remover o hub "${deleteConfirm?.name}"?`}
        variant="danger"
      />

      {/* --- Discord Sidebar (Servers) --- */}
      <div className="w-[72px] bg-black/40 flex flex-col items-center py-4 gap-3 border-r border-white/5">
        <button 
          onClick={fetchData}
          className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 hover:bg-purple-600 hover:text-white transition-all duration-300 group"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
        
        <div className="w-8 h-px bg-white/10" />

        <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto custom-scrollbar px-2">
          {hubs.map((hub) => (
            <div key={hub.id} className="relative flex items-center group">
              <div className={`absolute -left-1 w-1 rounded-r-full bg-white transition-all duration-300 ${selectedHubId === hub.id ? 'h-8' : 'h-2 opacity-0 group-hover:opacity-100'}`} />
              <button
                onClick={() => setSelectedHubId(hub.id)}
                className={`w-12 h-12 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                  selectedHubId === hub.id 
                  ? 'rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'rounded-3xl bg-white/5 text-slate-400 hover:rounded-xl hover:bg-purple-500/20 hover:text-purple-300'
                }`}
              >
                <span className="font-heading font-bold text-lg uppercase">{hub.name.substring(0, 1)}</span>
              </button>
            </div>
          ))}

          <button
            onClick={addNewHub}
            className="w-12 h-12 rounded-3xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center hover:rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 mt-2 relative group"
          >
            <Plus size={24} />
            {hubs.length >= hubLimit && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 border border-black group-hover:animate-bounce">
                <Lock size={10} />
              </div>
            )}
          </button>
        </div>
        
        <div className="mt-auto pb-2 flex flex-col items-center gap-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Plan {hubLimit}H</p>
          <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500" style={{ width: `${(hubs.length / hubLimit) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* --- Channel List (Hub Info/Settings) --- */}
      <div className="w-64 bg-black/20 flex flex-col border-r border-white/5">
        <div className="h-12 px-4 flex items-center border-b border-white/5 shadow-sm">
          <h2 className="font-heading font-bold text-white uppercase tracking-wider truncate">
            {activeHub?.name || "SEM HUB"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div className="space-y-1">
            <div className="px-2 py-1 flex items-center gap-2 text-slate-400 bg-white/5 rounded-md">
              <Info size={14} />
              <span className="text-xs font-bold uppercase tracking-tighter">Status Geral</span>
            </div>
            
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Carga Total</span>
                <span className={`text-xs font-mono font-bold ${activeHub?.current_load_percent > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeHub?.current_load_percent || 0}%
                </span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeHub?.current_load_percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{activeHubKeys.length} Keys</span>
                <span>{activeHub?.cap_hours}h Cap</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-2 py-1 flex items-center gap-2 text-slate-400">
              <Settings size={14} />
              <span className="text-xs font-bold uppercase tracking-tighter">Configurações</span>
            </div>
            
            <div className="space-y-2 px-2 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase ml-1">Nome do Hub</label>
                <input
                  value={activeHub?.name || ""}
                  onChange={(e) => handleCellChange(activeHub.id, "name", e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase ml-1">URL Endpoint</label>
                <input
                  value={activeHub?.url || ""}
                  onChange={(e) => handleCellChange(activeHub.id, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500/50 transition-all truncate"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase ml-1">Capacidade (Horas)</label>
                <input
                  type="number"
                  value={activeHub?.cap_hours || 0}
                  onChange={(e) => handleCellChange(activeHub.id, "cap_hours", parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              {activeHub?.is_dirty && (
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-lg shadow-purple-500/20"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span className="text-sm font-bold uppercase tracking-widest">Salvar Alterações</span>
                </button>
              )}

              <button
                onClick={() => setDeleteConfirm(activeHub)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Remover Hub</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
               <Shield size={16} className="text-white" />
             </div>
             <div className="min-w-0">
               <p className="text-xs font-bold text-white truncate">Bot Automator</p>
               <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                 Ativo
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area (Keys List) --- */}
      <div className="flex-1 flex flex-col bg-black/10">
        <div className="h-12 px-6 flex items-center justify-between border-b border-white/5 bg-black/10 shadow-sm relative z-10">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-slate-500" />
            <span className="text-white font-heading font-bold uppercase tracking-widest">Chaves Detectadas</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-md border border-emerald-400/10">
              <CheckCircle size={12} />
              <span>{activeHubKeys.filter(k => k.status === 'active').length} OK</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-400/5 px-2 py-1 rounded-md border border-rose-400/10">
              <AlertCircle size={12} />
              <span>{activeHubKeys.filter(k => k.status === 'expired').length} EXP</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {activeHubKeys.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 italic">
                  <Key size={48} className="mb-4 opacity-20" />
                  Nenhuma chave detectada para este hub ainda.
                </div>
              ) : (
                activeHubKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${key.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          <Key size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-white break-all">
                            {key.key_value}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] uppercase font-bold tracking-widest ${key.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {key.status}
                            </span>
                            <span className="text-[9px] text-slate-500">•</span>
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock size={10} /> 
                              {(() => {
                                if (key.status !== 'active') return '00:00:00';
                                const remaining = new Date(key.expires_at) - new Date();
                                if (remaining <= 0) return '00:00:00';
                                const totalSeconds = Math.floor(remaining / 1000);
                                const h = Math.floor(totalSeconds / 3600);
                                const m = Math.floor((totalSeconds % 3600) / 60);
                                const s = totalSeconds % 60;
                                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Globe size={12} className="text-slate-500" />
                         <span className="text-[10px] text-slate-400 font-mono">Luarmor Sync</span>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        Detectada em: {new Date(key.created_at).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
