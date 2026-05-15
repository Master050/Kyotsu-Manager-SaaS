import React from "react";
import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
      <div className="skeleton h-20 w-full rounded-lg" />
    </motion.div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="w-full">
        {/* Header */}
        <div className="bg-black/40 p-4 flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-4 flex-1 rounded" />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 flex gap-4"
            >
              <div className="skeleton w-8 h-8 rounded-full" />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton h-6 flex-1 rounded" />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-10 w-32 rounded" />
      <div className="skeleton h-2 w-full rounded-full" />
    </motion.div>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={`skeleton rounded-full ${sizes[size]}`} />
  );
}

export function SkeletonChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      
      <div className="flex items-end justify-between gap-2 h-64">
        {[60, 80, 50, 90, 70, 85, 65].map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="skeleton flex-1 rounded-t-lg"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Stat: SkeletonStat,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Chart: SkeletonChart,
};
