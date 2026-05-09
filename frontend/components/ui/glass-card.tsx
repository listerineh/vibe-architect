'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative overflow-hidden
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-2xl shadow-blue-500/10
        hover:shadow-blue-500/20
        transition-all duration-300
        hover:border-white/20
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-sm -z-10" />
      </div>
    </motion.div>
  );
}
