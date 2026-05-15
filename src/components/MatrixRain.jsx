import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatrixRain({ onClose }) {
  const [chars, setChars] = useState([]);

  useEffect(() => {
    // Generate matrix characters
    const columns = Math.floor(window.innerWidth / 20);
    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    
    const initialChars = Array.from({ length: columns }, (_, i) => ({
      id: i,
      char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
      x: i * 20,
      speed: 1 + Math.random() * 3,
      delay: Math.random() * 2,
    }));

    setChars(initialChars);

    // Auto close after 5 seconds
    const timer = setTimeout(onClose, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="matrix-effect"
        onClick={onClose}
      >
        {chars.map((char) => (
          <motion.div
            key={char.id}
            className="matrix-char"
            style={{
              left: `${char.x}px`,
              animationDuration: `${char.speed}s`,
              animationDelay: `${char.delay}s`,
            }}
            initial={{ top: "-50px" }}
            animate={{ top: "100vh" }}
            transition={{
              duration: char.speed,
              repeat: Infinity,
              ease: "linear",
              delay: char.delay,
            }}
          >
            {char.char}
          </motion.div>
        ))}

        {/* Exit hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10"
        >
          <p className="text-emerald-400 font-mono text-2xl mb-4 font-bold" style={{ textShadow: "0 0 20px #10b981" }}>
            WELCOME TO THE MATRIX
          </p>
          <p className="text-emerald-400/60 font-mono text-sm">
            Clique em qualquer lugar para sair
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
