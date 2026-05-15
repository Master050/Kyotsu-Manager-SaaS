import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger" // danger, warning, info
}) {
  if (!isOpen) return null;

  const variantColors = {
    danger: {
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
      icon: "#ef4444",
      button: "from-red-600 to-red-700",
    },
    warning: {
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
      icon: "#f59e0b",
      button: "from-amber-600 to-amber-700",
    },
    info: {
      bg: "rgba(34,211,238,0.1)",
      border: "rgba(34,211,238,0.3)",
      icon: "#22d3ee",
      button: "from-cyan-600 to-cyan-700",
    },
  };

  const colors = variantColors[variant];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="glass-card max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>

          {/* Icon */}
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <AlertTriangle size={32} style={{ color: colors.icon }} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-heading font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-slate-400 font-body mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-body font-medium text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
              {cancelText}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-body font-bold text-sm bg-gradient-to-r ${colors.button} text-white shadow-lg`}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
