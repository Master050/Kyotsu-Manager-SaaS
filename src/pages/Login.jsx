import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  Lock, User, LogIn, AlertCircle, ShieldCheck, Sparkles, 
  Mail, UserPlus, ArrowRight, CheckCircle2, Zap, Flame, Crown, Star
} from "lucide-react";
import AstraBackground from "../components/AstraBackground";
import LoginSuccessAnimation from "../components/LoginSuccessAnimation";
import PixModal from "../components/PixModal";

const PLANS = [
  { 
    id: 'Plano I', 
    name: 'Plano I', 
    hubs: 2, 
    price: '9,99', 
    promo: '0,99 (2 Primeiros)', 
    slogan: 'Essencial para Iniciantes',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(34,211,238,0.3)',
    icon: Zap
  },
  { 
    id: 'Plano II', 
    name: 'Plano II', 
    hubs: 4, 
    price: '16,99', 
    slogan: 'Alta Performance & Gestão',
    color: 'from-purple-500 to-pink-600',
    glow: 'rgba(168,85,247,0.3)',
    icon: Flame,
    popular: true
  },
  { 
    id: 'Plano III', 
    name: 'Plano III', 
    hubs: 6, 
    price: '21,99', 
    slogan: 'O Domínio Total do Sistema',
    color: 'from-amber-400 to-orange-600',
    glow: 'rgba(251,191,36,0.3)',
    icon: Crown
  }
];

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id); // Plano II default por ser popular
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [loginUsername, setLoginUsername] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState(null);
  
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
      const plan = PLANS.find(p => p.id === selectedPlan);
      const amount = parseFloat(plan.price.replace(',', '.'));

      try {
        const response = await fetch(`http://localhost:8000/api/payments/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            plan_type: selectedPlan,
            amount
          })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Erro ao conectar com servidor de pagamentos");
        }
        
        const data = await response.json();
        setPixData(data);
        setIsPixModalOpen(true);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
      return;
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      handleAuthSuccess(result.username || username || email.split('@')[0]);
    } else {
      handleAuthError(result.message);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPixModalOpen(false);
    setLoading(true);
    
    const result = await register(email, password, username, selectedPlan);
    
    if (result.success) {
      handleAuthSuccess(username || email.split('@')[0]);
    } else {
      handleAuthError(result.message);
    }
  };

  const handleAuthSuccess = (name) => {
    setLoading(false);
    setLoginUsername(name);
    setShowSuccessAnim(true);
    
    setTimeout(() => {
      setShowSuccessAnim(false);
      navigate("/dashboard");
    }, 5000);
  };

  const handleAuthError = (message) => {
    setError(message);
    const form = document.getElementById("login-form");
    form?.classList.add("shake");
    setTimeout(() => form?.classList.remove("shake"), 500);
    setLoading(false);
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

      <AnimatePresence>
        {isPixModalOpen && (
          <PixModal
            isOpen={isPixModalOpen}
            onClose={() => setIsPixModalOpen(false)}
            pixData={pixData}
            onPaymentSuccess={handlePaymentSuccess}
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
                background: i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#22d3ee" : "#fbbf24",
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
                  <div className="space-y-4 pt-2">
                    <label className="text-xs font-heading uppercase tracking-widest block text-slate-500">Selecione seu nível de acesso</label>
                    <div className="grid grid-cols-1 gap-3">
                      {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        return (
                          <motion.div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-white/[0.07] border-white/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                            style={{
                              boxShadow: isSelected ? `0 0 25px ${plan.glow}` : 'none'
                            }}
                          >
                            {plan.popular && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-lg z-20">
                                MAIS POPULAR
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center relative z-10">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                                   <plan.icon size={22} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white flex items-center gap-2">
                                    {plan.name}
                                    {isSelected && <CheckCircle2 size={14} className="text-emerald-400" />}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{plan.slogan}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1 w-1 rounded-full bg-slate-600" />
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Até {plan.hubs} Hubs Ativos</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-mono text-white font-bold">R$ {plan.price}</p>
                                 {plan.promo && (
                                   <div className="bg-emerald-500/20 px-2 py-0.5 rounded mt-1">
                                      <p className="text-[8px] text-emerald-400 font-bold uppercase">{plan.promo}</p>
                                   </div>
                                 )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
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
                      {isRegister ? <Star size={18} className="text-yellow-400" /> : <LogIn size={18} />}
                      {isRegister ? "ADQUIRIR ACESSO AGORA" : "ENTRAR NO SISTEMA"}
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
