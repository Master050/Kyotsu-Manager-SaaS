import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, Activity, Server, Key, Clock, Layers, ChevronRight, Lock
} from "lucide-react";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-cyan-400" />
      <span className="text-xl font-mono font-bold text-white tabular-nums">
        {time.toLocaleTimeString("pt-BR")}
      </span>
    </div>
  );
}

function StatCard({ label, value, sublabel, icon: Icon, color, delay, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      onClick={onClick}
      className={`glass-card relative overflow-hidden group ${onClick ? "cursor-pointer" : ""}`}
      whileHover={onClick ? { y: -5, borderColor: `${color}50` } : {}}
    >
      <div className="p-5 relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-heading font-bold text-white leading-none">{value}</h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{sublabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [hubs, setHubs] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const hubsSub = supabase.channel('hubs').on('postgres_changes', { event: '*', schema: 'public', table: 'hubs' }, fetchData).subscribe();
    const keysSub = supabase.channel('keys').on('postgres_changes', { event: '*', schema: 'public', table: 'keys' }, fetchData).subscribe();
    return () => {
      supabase.removeChannel(hubsSub);
      supabase.removeChannel(keysSub);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: h } = await supabase.from("hubs").select("*");
      const { data: k } = await supabase.from("keys").select("*, hubs(name)");
      if (h) setHubs(h);
      if (k) setKeys(k);
    } finally { setLoading(false); }
  };

  const activeKeysCount = keys.filter(k => k.status === 'active').length;
  const expiredKeysCount = keys.filter(k => k.status !== 'active').length;
  const systemHealth = hubs.length > 0 ? Math.round(hubs.reduce((a, b) => a + (b.current_load_percent || 0), 0) / hubs.length) : 0;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#030306]">
      <Activity className="text-purple-500 animate-pulse" size={48} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 py-6 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            DASHBOARD CENTRAL
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Operação Kyotsu v4.2.0</p>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[10px] font-bold text-purple-400 font-mono uppercase bg-purple-400/10 px-2 py-0.5 rounded">
              {user?.plan_type || 'Plano I'}
            </span>
          </div>
        </div>
        <div className="glass-card px-8 py-4 flex items-center gap-8">
          <LiveClock />
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-widest">Live</span>
             </div>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Supabase Cloud</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Hubs Ativos" value={hubs.length} sublabel="instâncias em tempo real" icon={Server} color="#a855f7" delay={0} onClick={() => navigate("/hubs")} />
        <StatCard label="Keys Ativas" value={activeKeysCount} sublabel="operando normalmente" icon={Key} color="#10b981" delay={1} />
        <StatCard label="Expiradas" value={`${expiredKeysCount}`} sublabel="aguardando renovação" icon={Lock} color="#f43f5e" delay={2} />
        <StatCard label="Carga do Sistema" value={`${systemHealth}%`} sublabel="média de aproveitamento" icon={Activity} color="#22d3ee" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-purple-400" /> ESTADO DOS HUBS
          </h2>
          <div className="space-y-4">
            {hubs.map((hub) => (
              <div key={hub.id} className="glass-card p-5 border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-white uppercase text-sm">{hub.name}</h3>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${hub.refresh_state === 1 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {hub.refresh_state === 1 ? 'Sync' : 'Online'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>CAP: {hub.cap_hours}H</span>
                    <span>LOAD: {hub.current_load_percent || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7]" style={{ width: `${hub.current_load_percent || 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" /> ÚLTIMAS CHAVES
          </h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-mono text-slate-500 uppercase border-b border-white/5">
                  <th className="px-4 py-3">Hash</th>
                  <th className="px-4 py-3">Hub</th>
                  <th className="px-4 py-3 text-right">Expira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {keys.slice(0, 10).map((key) => (
                  <tr key={key.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-300">{key.key_value.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-xs text-white">{key.hubs?.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400 text-right">
                      {new Date(key.expires_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
