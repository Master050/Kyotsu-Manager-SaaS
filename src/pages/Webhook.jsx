import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { 
  Bell, Save, Shield, User, Link, Loader2, CheckCircle2, AlertCircle, Info, Send
} from "lucide-react";
import { toast } from "sonner";

export default function Webhook() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [pingEnabled, setPingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const { data } = await supabase.from("configs").select("*");
    if (data) {
      const url = data.find(c => c.key === 'discord_webhook')?.value || "";
      const uid = data.find(c => c.key === 'discord_user_id')?.value || "";
      const ping = data.find(c => c.key === 'discord_ping_enabled')?.value === 'true';
      
      setWebhookUrl(url);
      setUserId(uid);
      setPingEnabled(ping);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("configs").upsert([
        { key: 'discord_webhook', value: webhookUrl },
        { key: 'discord_user_id', value: userId },
        { key: 'discord_ping_enabled', value: String(pingEnabled) }
      ]);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error("Por favor, insira uma URL de Webhook primeiro.");
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🚀 Teste de Conectividade Kyotsu",
            description: "Se você está vendo esta mensagem, seu webhook foi configurado corretamente!",
            color: 0x6366f1,
            fields: [
              { name: "Usuário Monitorado", value: userId || "Não definido", inline: true },
              { name: "Ping Ativado", value: pingEnabled ? "Sim ✅" : "Não ❌", inline: true }
            ],
            footer: { text: "Kyotsu Key Manager - v4.1.0" },
            timestamp: new Date().toISOString()
          }]
        })
      });

      if (response.ok) {
        toast.success("Teste enviado! Verifique seu Discord.");
      } else {
        toast.error("Erro ao enviar teste. Verifique a URL do Webhook.");
      }
    } catch (error) {
      toast.error("Falha na conexão com o Discord.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Bell size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">WEBHOOK CONFIG</h1>
            <p className="text-slate-400 text-sm">Gerencie notificações e pings do Discord</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Config */}
          <div className="glass-card p-6 space-y-6 md:col-span-2">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link size={18} className="text-indigo-400" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">Discord Integration</h2>
                </div>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  {testing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Testar Webhook
                </button>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Webhook URL</label>
                  <input 
                    type="text" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Seu ID no Discord</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="123456789012345678"
                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:border-indigo-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Notificar no Ping</label>
                    <div 
                      onClick={() => setPingEnabled(!pingEnabled)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${pingEnabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/20 border-white/5'}`}
                    >
                      <span className="text-sm text-slate-300">Ping Ativado</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${pingEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${pingEnabled ? 'left-6' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Info Card */}
          <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
             <div className="flex items-center gap-2 mb-4 text-amber-400">
                <Info size={18} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Como funciona</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Ao ativar o ping, o bot enviará uma mensagem mencionando você sempre que um Hub atingir 100% de carga ou quando uma renovação de 240h/48h for concluída com sucesso.
             </p>
          </div>

          {/* Shield Card */}
          <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
             <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Shield size={18} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Segurança</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               As informações de Webhook são armazenadas de forma segura e sincronizadas apenas com seu painel privado do Supabase.
             </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
           >
             {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
             SALVAR CONFIGURAÇÕES
           </button>
        </div>
      </motion.div>
    </div>
  );
}
