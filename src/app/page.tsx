'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EVENT_NAME, ORGANIZER, ORGANIZER_URL, COLLABORATOR, COLLABORATOR_URL } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const [teamRes, adminRes] = await Promise.all([
          fetch('/api/team').catch(() => null),
          fetch('/api/admin/teams').catch(() => null)
        ]);
        
        if (teamRes?.ok) {
          router.push('/team/dashboard');
          return;
        }
        
        if (adminRes?.ok) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (err) {
        // Continue to show landing page
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-zinc-800">
      {/* Decorative blurred circles */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-zinc-900/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-zinc-800/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 text-center max-w-xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 tracking-tight">
          {EVENT_NAME}
        </h1>
        <p className="text-2xl text-zinc-400 mb-2">Check-in Portal</p>
        <p className="text-sm text-zinc-500 mb-12 uppercase tracking-widest">
          Organized by <a href={ORGANIZER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{ORGANIZER}</a> &times; <a href={COLLABORATOR_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{COLLABORATOR}</a>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200">
              Team Login
            </Button>
          </Link>
          <Link href="/admin/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900">
              Organizer Login
            </Button>
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-6 text-sm text-zinc-600">
        &copy; {new Date().getFullYear()} {ORGANIZER} &middot; <a href={ORGANIZER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">{ORGANIZER_URL.replace('https://', '')}</a>
      </footer>
    </div>
  );
}
