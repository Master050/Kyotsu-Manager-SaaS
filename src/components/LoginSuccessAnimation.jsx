import React from "react";
import { motion } from "framer-motion";
import { Shield, Heart, User, Sparkles } from "lucide-react";

export default function LoginSuccessAnimation({ username, onComplete }) {
  const animations = {
    ADMIN: {
      icon: Shield,
      color: "#a855f7",
      title: "ACESSO ADMIN",
      subtitle: "Controle Total Ativado",
      particles: 20,
    },
    Mãe: {
      icon: Heart,
      color: "#ec4899", // Rosa/Magenta
      title: "BEM-VINDA, MÃE!",
      subtitle: "É bom ter você aqui ❤️",
      particles: 18,
    },
    Pai: {
      icon: User,
      color: "#3b82f6", // Azul
      title: "BEM-VINDO, PAI!",
      subtitle: "Feliz em ver você 👨",
      particles: 18,
    },
  };

  const config = animations[username] || animations.Mãe;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
      }}
    >
      {/* Container centralizado */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Particles burst */}
        {[...Array(config.particles)].map((_, i) => {
          const angle = (i / config.particles) * Math.PI * 2;
          const distance = 150 + Math.random() * 100;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: tx,
                y: ty,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 2.5, delay: i * 0.03, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: config.color,
                boxShadow: `0 0 15px ${config.color}`,
                left: "50%",
                top: "50%",
                marginLeft: "-6px",
                marginTop: "-6px",
              }}
            />
          );
        })}

        {/* Center icon with rings */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.2, bounce: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
              border: `2px solid ${config.color}`,
              boxShadow: `0 0 60px ${config.color}80`,
            }}
          >
            {/* Rotating rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3 - i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute rounded-full"
                style={{
                  border: `1px solid ${config.color}40`,
                  width: `${120 + i * 16}px`,
                  height: `${120 + i * 16}px`,
                }}
              />
            ))}

            <Icon size={64} style={{ color: config.color, filter: `drop-shadow(0 0 20px ${config.color})` }} />
          </div>

          {/* Pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`pulse-${i}`}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              className="absolute rounded-full border-2"
              style={{
                borderColor: config.color,
                width: "128px",
                height: "128px",
                top: "0",
                left: "0",
              }}
            />
          ))}
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-4xl font-heading font-bold mb-2"
            style={{
              color: config.color,
              textShadow: `0 0 30px ${config.color}80`,
            }}
          >
            {config.title}
          </h2>
          <p className="text-slate-400 font-body text-sm flex items-center justify-center gap-2">
            <Sparkles size={14} style={{ color: config.color }} />
            {config.subtitle}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
