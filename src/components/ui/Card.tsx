import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ children, className = '', glass = false, ...rest }: CardProps) {
  const baseStyles = 'rounded-xl p-6';
  const glassStyles = glass 
    ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800' 
    : 'bg-zinc-900 border border-zinc-800';

  return (
    <div className={`${baseStyles} ${glassStyles} ${className}`} {...rest}>
      {children}
    </div>
  );
}
