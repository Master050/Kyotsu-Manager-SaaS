import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { 
  Shield, Users, Activity, HardDrive, Search, 
  Trash2, Mail, Crown, Loader2, TrendingUp, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPortal() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalKeys: 0, totalHubs: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subData } = await supabase.from('subscriptions').select('*');
      const { count: keysCount } = await supabase.from('keys').select('*', { count: 'exact', head: true });
      const { count: hubsCount } = await supabase.from('hubs').select('*', { count: 'exact', head: true });

      setUsers(subData || []);
      setStats({
        totalKeys: keysCount || 0,
        totalHubs: hubsCount || 0,
        activeUsers: subData?.length || 0
      });
    } catch (e) {
      toast.error("Erro ao carregar dados administrativos");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (subscriptionId, userId) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário e sua assinatura?")) return;
    
    const toastId = toast.loading("Excluindo usuário...");
    try {
      // 1. Delete subscription record
      await supabase.from('subscriptions').delete().eq('id', subscriptionId);
      
      // 2. Refresh local data
      await fetchData();
      toast.success("Usuário removido com sucesso!", { id: toastId });
    } catch (e) {
      toast.error("Erro ao excluir usuário: " + e.message, { id: toastId });
    }
  };

  const updatePlan = async (subscriptionId, newPlan) => {
    const limits = { 'Plano I': 2, 'Plano II': 4, 'Plano III': 6 };
    const toastId = toast.loading(`Atualizando para ${newPlan}...`);
    try {
      await supabase.from('subscriptions').update({ 
        plan_type: newPlan, 
        hub_limit: limits[newPlan] 
      }).eq('id', subscriptionId);
      
      await fetchData();
      toast.success("Plano atualizado!", { id: toastId });
    } catch (e) {
      toast.error("Erro ao atualizar plano", { id: toastId });
    }
  };

  const filteredUsers = users.filter(u => 
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.plan_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white flex items-center gap-3">
              <Shield className="text-purple-500" size={32} />
              ADMIN PORTAL
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-1">Gerenciamento de Assinaturas e Usuários</p>
          </div>
          
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-mono uppercase">
            <RefreshCw size={14} /> Atualizar Dados
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Assinaturas', value: stats.activeUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Total Hubs', value: stats.totalHubs, icon: HardDrive, color: 'text-purple-400' },
            { label: 'Total Keys', value: stats.totalKeys, icon: Activity, color: 'text-emerald-400' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className={`text-3xl font-heading font-bold ${stat.color} mt-1`}>{stat.value}</h3>
              </div>
              <stat.icon size={32} className="text-slate-700" />
            </div>
          ))}
        </div>

        {/* User Management */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-heading font-bold text-white">Gestão de Usuários</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-purple-500/50 outline-none w-full md:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Plano Atual</th>
                  <th className="p-4">Limite</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-300">{user.user_id}</td>
                    <td className="p-4">
                      <select 
                        value={user.plan_type}
                        onChange={(e) => updatePlan(user.id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none"
                      >
                        <option value="Plano I">Plano I</option>
                        <option value="Plano II">Plano II</option>
                        <option value="Plano III">Plano III</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{user.hub_limit} Hubs</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteUser(user.id, user.user_id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
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
