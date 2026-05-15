import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Lock, User, LogIn, AlertCircle, ShieldCheck, Sparkles, Mail, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";
import AstraBackground from "../components/AstraBackground";
import LoginSuccessAnimation from "../components/LoginSuccessAnimation";

const PLANS = [
  { id: 'Plano I', name: 'Plano I', hubs: 2, price: '9,99', promo: '0,99 (2 Primeiros)', color: 'from-blue-500/20 to-indigo-500/10' },
  { id: 'Plano II', name: 'Plano II', hubs: 4, price: '16,99', color: 'from-purple-500/20 to-pink-500/10' },
  { id: 'Plano III', name: 'Plano III', hubs: 6, price: '21,99', color: 'from-amber-500/20 to-orange-500/10' }
];

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].id);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [loginUsername, setLoginUsername] = useState(null);
  
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !showSuccessAnim) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, showSuccessAnim]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (isRegister) {
      result = await register(email, password, username, selectedPlan);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      setLoading(false);
      setLoginUsername(username || email.split('@')[0]);
      setShowSuccessAnim(true);
      
      setTimeout(() => {
        setShowSuccessAnim(false);
        navigate("/dashboard");
      }, 5000);
    } else {
      setError(result.message);
      const form = document.getElementById("login-form");
      form?.classList.add("shake");
      setTimeout(() => form?.classList.remove("shake"), 500);
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccessAnim && (
          <LoginSuccessAnimation
            username={loginUsername}
            onComplete={() => {}}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <AstraBackground />

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#22d3ee" : "#4fc3f7",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: `0 0 10px currentColor`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.1))",
                border: "1px solid rgba(168,85,247,0.3)",
                boxShadow: "0 0 40px rgba(168,85,247,0.3)"
              }}
            >
              <ShieldCheck size={36} className="text-purple-400" style={{ filter: "drop-shadow(0 0 10px #a855f7)" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-heading font-bold tracking-wider mb-2"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #c0e8ff 30%, #a78bfa 60%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(168,85,247,0.5))"
              }}
            >
              KYOTSU MANAGER
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 font-mono text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className="text-cyan-400" />
              {isRegister ? "Crie sua assinatura agora" : "Sistema de Gestão de Keys"}
            </motion.p>
          </div>

          <motion.div
            id="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card card-shine p-8 relative overflow-hidden"
          >
            <div className="scan-line" style={{ animationDuration: "6s" }} />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-heading font-bold flex items-center gap-2 text-white">
                  {isRegister ? <UserPlus size={20} className="text-purple-400" /> : <Lock size={20} className="text-purple-400" />}
                  {isRegister ? "Criar Conta" : "Autenticação"}
                </h2>
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest border-b border-purple-500/30 pb-0.5"
                >
                  {isRegister ? "Já tenho conta" : "Criar assinatura"}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-2 text-slate-400">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl font-body text-sm text-white bg-black/30 border border-white/10 focus:border-purple-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest block mb-2 text-slate-400">Usuário</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome desejado"
                        className="w-full pl-12 pr-4 py-3 rounded-xl font-body text-sm text-white bg-black/30 border border-white/10 focus:border-purple-500/50 outline-none transition-all"
                        required={isRegister}
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest block mb-2 text-slate-400">Senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl font-body text-sm text-white bg-black/30 border border-white/10 focus:border-purple-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className="space-y-3">
                    <label className="text-xs font-heading uppercase tracking-widest block text-slate-400">Escolha seu Plano</label>
                    <div className="grid grid-cols-1 gap-2">
                      {PLANS.map((plan) => (
                        <div 
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`relative cursor-pointer p-4 rounded-xl border transition-all ${selectedPlan === plan.id ? 'bg-white/5 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                 {selectedPlan === plan.id ? <CheckCircle2 size={16} className="text-white" /> : <Sparkles size={16} className="text-white/40" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{plan.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Até {plan.hubs} Hubs Diferentes</p>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-mono text-purple-400 font-bold">R$ {plan.price}</p>
                               {plan.promo && <p className="text-[9px] text-emerald-400 font-bold animate-pulse">{plan.promo}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    <AlertCircle size={16} />
                    <span className="font-mono text-[10px] uppercase">{error}</span>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-heading font-bold tracking-wider text-sm flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                    border: "1px solid rgba(168,85,247,0.5)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.3)"
                  }}
                >
                  {loading ? "Processando..." : (
                    <>
                      {isRegister ? <ArrowRight size={18} /> : <LogIn size={18} />}
                      {isRegister ? "CONTRATAR AGORA" : "ENTRAR NO SISTEMA"}
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx="true">{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.5s; }
      `}</style>
    </>
  );
}
