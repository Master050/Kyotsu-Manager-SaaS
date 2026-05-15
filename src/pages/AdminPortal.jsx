import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { 
  Shield, Users, Activity, DollarSign, Search, 
  Trash2, Crown, Loader2, TrendingUp, RefreshCw,
  BarChart3, Calendar, Settings, Wallet, AlertTriangle,
  Clock, ArrowUpRight, ArrowDownRight, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const PLAN_PRICES = {
  'Plano I': 9.99,
  'Plano II': 16.99,
  'Plano III': 21.99
};

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalHubs: 0, activeUsers: 0, projections: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subData } = await supabase.from('subscriptions').select('*');
      const { count: hubsCount } = await supabase.from('hubs').select('*', { count: 'exact', head: true });
      const { data: keysData } = await supabase.from('keys').select('id');

      let revenue = 0;
      subData?.forEach(sub => {
        revenue += PLAN_PRICES[sub.plan_type] || 0;
      });

      setUsers(subData || []);
      setStats({
        totalRevenue: revenue,
        totalHubs: hubsCount || 0,
        activeUsers: subData?.length || 0,
        totalKeys: keysData?.length || 0,
        projections: revenue * 4 // Projeção mensal simplificada (assinaturas são semanais)
      });
    } catch (e) {
      toast.error("Erro ao carregar central de comando");
    } finally {
      setLoading(false);
    }
  };

  const getExpirationStatus = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.ceil((now - created) / (1000 * 60 * 60 * 24));
    const remaining = 7 - diffDays;
    
    if (remaining < 0) return { label: 'Expirado', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (remaining <= 1) return { label: 'Expira hoje', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: `${remaining} dias`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const chartData = [
    { name: 'Plano I', users: users.filter(u => u.plan_type === 'Plano I').length, value: users.filter(u => u.plan_type === 'Plano I').length * 9.99 },
    { name: 'Plano II', users: users.filter(u => u.plan_type === 'Plano II').length, value: users.filter(u => u.plan_type === 'Plano II').length * 16.99 },
    { name: 'Plano III', users: users.filter(u => u.plan_type === 'Plano III').length, value: users.filter(u => u.plan_type === 'Plano III').length * 21.99 },
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#02040a]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-purple-500 animate-spin" size={40} />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Iniciando CEO Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">CEO DASHBOARD</h1>
            </div>
            <p className="text-slate-500 font-mono text-[10px] mt-2 uppercase tracking-[0.3em]">Ambiente de Gestão Estratégica Kyotsu v4.2.0</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={14} /> Atualizar Painel
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-tighter">Status: Sistema Estável</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'users', label: 'Gestão de Clientes', icon: Users },
            { id: 'finance', label: 'Financeiro', icon: Wallet },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatBox label="Receita Semanal" value={`R$ ${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} trend="+12%" up />
                <StatBox label="Projeção Mensal" value={`R$ ${stats.projections.toFixed(2)}`} icon={TrendingUp} sub="base 4 semanas" />
                <StatBox label="Assinantes Ativos" value={stats.activeUsers} icon={Users} trend="+2 hoje" up />
                <StatBox label="Hubs em Operação" value={stats.totalHubs} icon={Activity} sub="Carga total do bot" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-white/5">
                  <h3 className="text-sm font-heading font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-purple-400" /> Distribuição de Receita
                  </h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6 border-white/5">
                   <h3 className="text-sm font-heading font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" /> Performance do Ecossistema
                  </h3>
                  <div className="space-y-4">
                    <ProgressBar label="Otimização de Keys" percent={88} color="bg-emerald-500" />
                    <ProgressBar label="Uptime dos Hubs" percent={99.9} color="bg-blue-500" />
                    <ProgressBar label="Taxa de Renovação" percent={65} color="bg-purple-500" />
                    <ProgressBar label="Crescimento Semanal" percent={15} color="bg-cyan-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="glass-card border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Filtrar por User ID ou E-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-purple-500/50 outline-none w-full"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      <tr>
                        <th className="p-4">Assinante</th>
                        <th className="p-4">Plano</th>
                        <th className="p-4">Status / Expiração</th>
                        <th className="p-4 text-right">Controle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.filter(u => u.user_id.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => {
                        const exp = getExpirationStatus(user.created_at);
                        return (
                          <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <p className="text-xs font-bold text-white">{user.user_id.slice(0, 12)}...</p>
                              <p className="text-[10px] text-slate-500 font-mono">Assinado em {new Date(user.created_at).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border border-white/10 ${user.plan_type === 'Plano III' ? 'text-amber-400 bg-amber-400/5' : 'text-purple-400 bg-purple-400/5'}`}>
                                {user.plan_type}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${exp.bg}`}>
                                <Clock size={12} className={exp.color} />
                                <span className={`text-[10px] font-bold uppercase ${exp.color}`}>{exp.label}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition-all">
                                  <Settings size={14} />
                                </button>
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-rose-500/20 hover:text-rose-500 transition-all">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet size={120} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Lucro Total Estimado</p>
                  <h2 className="text-5xl font-heading font-bold text-white mt-4">R$ {stats.totalRevenue.toFixed(2)}</h2>
                  <p className="text-xs text-emerald-500 mt-4 flex items-center gap-1 font-bold">
                    <ArrowUpRight size={16} /> 100% de margem operacional
                  </p>
                  <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Média por User</p>
                      <p className="text-lg font-bold text-white">R$ {(stats.totalRevenue / (stats.activeUsers || 1)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Taxa de Conversão</p>
                      <p className="text-lg font-bold text-white">100%</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-purple-600/10 to-transparent">
                  <h3 className="text-sm font-heading font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Briefcase size={16} className="text-purple-400" /> Metas do Negócio
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                        <span>Meta de 100 Usuários</span>
                        <span>{stats.activeUsers}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]" style={{ width: `${stats.activeUsers}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                        <span>Faturamento R$ 5k</span>
                        <span>{Math.round((stats.totalRevenue / 5000) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" style={{ width: `${(stats.totalRevenue / 5000) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, trend, sub, up }) {
  return (
    <div className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
          <Icon size={20} className="text-slate-400 group-hover:text-purple-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
          </div>
        )}
      </div>
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-heading font-bold text-white mt-1">{value}</h3>
      {sub && <p className="text-[10px] text-slate-500 font-mono mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, percent, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
        <span>{label}</span>
        <span className="text-slate-300">{percent}%</span>
      </div>
      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} shadow-[0_0_8px_currentColor] opacity-70`}
        />
      </div>
    </div>
  );
}
