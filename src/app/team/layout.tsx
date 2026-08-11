'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EVENT_NAME } from '@/lib/constants';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">
              {EVENT_NAME}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-2 h-9 text-xs sm:text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-20">
        {children}
      </main>
    </div>
  );
}
