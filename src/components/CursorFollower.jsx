import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop
    if (window.innerWidth < 1024) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX - 8);
      cursorY.set(e.clientY - 8);
    };

    const handleMouseEnter = (e) => {
      const target = e.target;
      
      // Safety check - ensure target is a valid Element
      if (!target || !target.tagName) return;
      
      const isButton = target.tagName === "BUTTON" || 
                       (target.closest && target.closest("button"));
      const isLink = target.tagName === "A" || 
                     (target.closest && target.closest("a"));
      const isClickable = target.classList && target.classList.contains("clickable");
      
      if (isButton || isLink || isClickable) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, [cursorX, cursorY]);

  // Don't render on mobile/tablet
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    return null;
  }

  return (
    <>
      {/* Main cursor glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 32 : 16,
            height: isHovering ? 32 : 16,
            scale: isHovering ? 1.5 : 1,
          }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="relative"
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)",
              filter: "blur(12px)",
            }}
          />
          {/* Core */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #fff 0%, rgba(168,85,247,0.8) 50%, transparent 70%)",
              boxShadow: "0 0 20px rgba(168,85,247,0.8)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Trail effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <div
          className="w-24 h-24 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 60%)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>
    </>
  );
}
