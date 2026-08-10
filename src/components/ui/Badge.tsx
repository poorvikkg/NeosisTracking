import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'default';
}

export function Badge({ variant = 'default', children, className = '', ...rest }: BadgeProps) {
  const variants = {
    success: 'bg-white/10 text-white border border-white/20',
    warning: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    default: 'bg-zinc-800 text-zinc-400 border border-zinc-700'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...rest}>
      {children}
    </span>
  );
}
