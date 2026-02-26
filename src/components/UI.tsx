import React from 'react';
import { motion } from 'motion/react';

export const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-[#101826] rounded-3xl p-6 border border-[#223047] shadow-xl ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all' : ''}`}>
    {children}
  </div>
);

export const ProgressBar = ({ value, max, color = "bg-[#3B82F6]" }: { value: number, max: number, color?: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-[#0B0F14] rounded-full h-2 overflow-hidden border border-[#223047]">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className={`h-full ${color} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
      />
    </div>
  );
};

export const Button = ({ children, onClick, className = "", variant = "primary", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600",
    secondary: "bg-[#101826] text-[#E6EDF7] border border-[#223047] hover:bg-[#1a2436]",
    outline: "bg-transparent border border-[#223047] text-[#E6EDF7] hover:bg-white/5",
    ghost: "bg-transparent text-[#98A2B3] hover:text-[#E6EDF7]"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`p-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
