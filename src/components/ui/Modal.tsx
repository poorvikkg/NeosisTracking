'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto transform transition-all scale-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
