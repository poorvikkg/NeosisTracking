'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EVENT_NAME } from '@/lib/constants';

export default function TeamLogin() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          router.push('/team/dashboard');
          return;
        }
      } catch (e) {
        // Ignore
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/team/dashboard';
        router.push(redirect);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Team Login</h1>
          <p className="text-zinc-400">{EVENT_NAME}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Username (Team ID)</label>
            <Input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              className="bg-black border-zinc-800 text-white focus-visible:ring-zinc-700"
              placeholder="e.g. IDE-001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="bg-black border-zinc-800 text-white focus-visible:ring-zinc-700"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-zinc-200 mt-6" 
            isLoading={isLoading}
          >
            Login
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
