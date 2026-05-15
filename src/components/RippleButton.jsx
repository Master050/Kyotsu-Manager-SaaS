import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RippleButton({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  disabled = false,
  withParticles = false,
  ...props 
}) {
  const [ripples, setRipples] = useState([]);
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add ripple
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Add particles if enabled
    if (withParticles) {
      const newParticles = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        return {
          id: `${Date.now()}-${i}`,
          x,
          y,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id))
        );
      }, 800);
    }

    // Call original onClick
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
    secondary: "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800",
    success: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    ghost: "bg-white/5 hover:bg-white/10",
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative overflow-hidden ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "20px",
              height: "20px",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              x: particle.x + particle.tx, 
              y: particle.y + particle.ty, 
              scale: 0, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
            style={{
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
