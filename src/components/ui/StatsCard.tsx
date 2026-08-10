'use client';
import React, { useEffect, useState } from 'react';
import { Card } from './Card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode | React.ElementType;
  color?: string;
  valueColor?: string;
}

export function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  const renderIcon = () => {
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      const Component = Icon as React.ElementType;
      return <Component className="w-5 h-5 text-white" />;
    }
    return Icon as React.ReactNode;
  };

  return (
    <Card className="flex items-center gap-4 bg-zinc-900 border border-zinc-800">
      <div className="p-3 rounded-full bg-zinc-800 text-white">
        {renderIcon()}
      </div>
      <div>
        <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
        <p className="text-white text-3xl font-bold mt-1">{displayValue}</p>
      </div>
    </Card>
  );
}
