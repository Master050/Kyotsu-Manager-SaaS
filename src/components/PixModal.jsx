import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Copy, CheckCircle2, Clock, Loader2, QrCode
} from "lucide-react";

export default function PixModal({ isOpen, onClose, pixData, onPaymentSuccess }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("ATIVA"); // ATIVA, CONCLUIDA
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    if (!isOpen || !pixData?.txid) return;

    setStatus("ATIVA");
    setTimeLeft(3600);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    // Polling
    const poll = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/payments/status/${pixData.txid}`);
        const data = await response.json();
        
        if (data.status === "CONCLUIDA") {
          setStatus("CONCLUIDA");
          clearInterval(poll);
          setTimeout(() => {
            onPaymentSuccess();
          }, 2500);
        }
      } catch (err) {
        console.error("Erro no polling de pagamento:", err);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, [isOpen, pixData, onPaymentSuccess]);

  const copyToClipboard = () => {
    if (!pixData?.qrcode_text) return;
    navigator.clipboard.writeText(pixData.qrcode_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card max-w-md w-full p-8 relative overflow-hidden border-white/10"
        style={{
          boxShadow: "0 0 50px rgba(168,85,247,0.15)"
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 animate-gradient-x" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center mb-4 border border-white/10"
            >
              <QrCode size={32} className="text-purple-400" />
            </motion.div>
            <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Checkout Pix</h2>
            <p className="text-slate-400 text-sm font-body">Finalize sua assinatura Kyotsu Manager</p>
          </div>

          {status === "ATIVA" ? (
            <>
              <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-2xl relative group">
                <div className="absolute inset-0 bg-purple-500/10 blur-xl group-hover:bg-purple-500/20 transition-all" />
                <img 
                  src={pixData.qrcode_image ? `data:image/png;base64,${pixData.qrcode_image}` : ""} 
                  alt="QR Code Pix" 
                  className="w-48 h-48 relative z-10" 
                />
              </div>

              <div className="space-y-3 text-left">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 block ml-1">Código Copia e Cola</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 overflow-hidden">
                    <p className="text-[10px] font-mono text-slate-400 truncate">{pixData.qrcode_text}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center min-w-[48px]"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-white" /> : <Copy size={18} className="text-white" />}
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-sm font-mono font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Aguardando...</span>
                 </div>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center space-y-6"
            >
               <div className="relative">
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] relative z-10"
                 >
                   <CheckCircle2 size={48} className="text-white" />
                 </motion.div>
                 <div className="absolute inset-0 bg-emerald-500 blur-2xl animate-pulse opacity-50" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-wider">Sucesso Total</h3>
                 <p className="text-slate-400 text-sm">Pagamento identificado. Ativando seu acesso...</p>
               </div>
            </motion.div>
          )}

          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            TXID: {pixData.txid?.slice(0, 12)}...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
