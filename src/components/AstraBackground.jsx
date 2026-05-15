import React from "react";

const particles = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: ((i * 53 + 17) % 95) + 2,
  y: ((i * 37 + 11) % 90) + 5,
  size: (i % 4) + 1.5,
  dur: 10 + (i % 12) * 2.5,
  delay: -(i * 1.3),
  color: ["#a855f7", "#22d3ee", "#4fc3f7", "#7c3aed", "#0ea5e9", "#c084fc"][i % 6],
  opacity: 0.4 + (i % 5) * 0.12,
}));

export default function AstraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* Deep space base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 10% 10%, rgba(79,195,247,0.13) 0%, transparent 55%), radial-gradient(ellipse 70% 70% at 90% 90%, rgba(168,85,247,0.15) 0%, transparent 55%)",
      }} />

      {/* Orb 1 — Large Purple (top-left) */}
      <div style={{
        position: "absolute", width: "900px", height: "900px",
        top: "-300px", left: "-300px",
        background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(124,58,237,0.22) 35%, transparent 65%)",
        borderRadius: "50%", filter: "blur(70px)",
        animation: "orb-drift-1 22s ease-in-out infinite",
      }} />

      {/* Orb 2 — Large Cyan (bottom-right) */}
      <div style={{
        position: "absolute", width: "800px", height: "800px",
        bottom: "-250px", right: "-250px",
        background: "radial-gradient(circle, rgba(34,211,238,0.33) 0%, rgba(6,182,212,0.20) 35%, transparent 65%)",
        borderRadius: "50%", filter: "blur(70px)",
        animation: "orb-drift-2 18s ease-in-out infinite",
      }} />

      {/* Orb 3 — Medium Blue (top-right) */}
      <div style={{
        position: "absolute", width: "550px", height: "550px",
        top: "5%", right: "5%",
        background: "radial-gradient(circle, rgba(79,195,247,0.22) 0%, transparent 65%)",
        borderRadius: "50%", filter: "blur(55px)",
        animation: "orb-drift-3 26s ease-in-out infinite",
      }} />

      {/* Orb 4 — Small Violet (center-left) */}
      <div style={{
        position: "absolute", width: "350px", height: "350px",
        top: "50%", left: "20%",
        background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%)",
        borderRadius: "50%", filter: "blur(45px)",
        animation: "orb-drift-4 15s ease-in-out infinite",
        animationDelay: "-6s",
      }} />

      {/* Orb 5 — Small Cyan accent (center) */}
      <div style={{
        position: "absolute", width: "250px", height: "250px",
        top: "35%", left: "55%",
        background: "radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 65%)",
        borderRadius: "50%", filter: "blur(35px)",
        animation: "orb-drift-1 12s ease-in-out infinite",
        animationDelay: "-9s",
      }} />

      {/* Light Streak 1 — top area */}
      <div style={{
        position: "absolute", top: "18%", left: "-5%", width: "55%", height: "1.5px",
        background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.4) 25%, rgba(34,211,238,0.45) 60%, transparent 100%)",
        transform: "rotate(-6deg)",
        animation: "streak-flash 9s ease-in-out infinite",
        animationDelay: "0s",
      }} />

      {/* Light Streak 2 — bottom area */}
      <div style={{
        position: "absolute", top: "70%", right: "-5%", width: "45%", height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(79,195,247,0.35) 40%, rgba(168,85,247,0.3) 75%, transparent 100%)",
        transform: "rotate(-4deg) scaleX(-1)",
        animation: "streak-flash 12s ease-in-out infinite",
        animationDelay: "-5s",
      }} />

      {/* Light Streak 3 — diagonal */}
      <div style={{
        position: "absolute", top: "45%", left: "30%", width: "25%", height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 50%, transparent 100%)",
        transform: "rotate(-20deg)",
        animation: "streak-flash 15s ease-in-out infinite",
        animationDelay: "-8s",
      }} />

      {/* Subtle dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: "50%",
          background: p.color,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 8}px ${p.color}40`,
          animation: `particle-drift ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      {/* Top aurora edge */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.5) 30%, rgba(34,211,238,0.4) 60%, transparent 100%)",
        animation: "aurora-shift 6s ease-in-out infinite",
      }} />

      {/* Vignette menos severa e com tom roxo profundo */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 55%, rgba(9,7,20,0.15) 100%)",
      }} />
    </div>
  );
}
