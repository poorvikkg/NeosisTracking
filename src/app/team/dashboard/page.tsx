'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QRCodeCanvas } from 'qrcode.react';
import { STATUS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/utils';
import type { TeamWithMembers, TeamMember } from '@/lib/types';
import { CheckCircle2, Clock, Users, UserCircle2, ArrowRight, ArrowLeft, Maximize2, Minimize2, X, IdCard } from 'lucide-react';

export default function TeamDashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberChecked, setMemberChecked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const teamRes = await fetch('/api/team');

        if (!teamRes.ok) {
          if (teamRes.status === 401) {
            router.push('/');
            return;
          }
          throw new Error('Failed to load team data');
        }

        const teamData = await teamRes.json();
        const teamObj: TeamWithMembers = teamData.team ?? teamData;
        setTeam(teamObj);

        // Check localStorage for previously selected member
        const savedMemberId = localStorage.getItem(`selected_member_${teamObj.id}`);
        if (savedMemberId) {
          const found = teamObj.team_members.find((m) => m.id === savedMemberId);
          if (found) {
            setSelectedMember(found);
            if (window.location.hash !== '#member') {
              window.location.hash = 'member';
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
        setMemberChecked(true);
      }
    }

    fetchData();
  }, [router]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash !== '#member') {
        setSelectedMember(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectMember = (member: TeamMember) => {
    if (!team) return;
    setSelectedMember(member);
    localStorage.setItem(`selected_member_${team.id}`, member.id);
    window.location.hash = 'member';
  };

  const handleSwitchMember = () => {
    if (!team) return;
    localStorage.removeItem(`selected_member_${team.id}`);
    if (window.location.hash === '#member') {
      window.history.back();
    } else {
      setSelectedMember(null);
    }
  };

  if (loading || !memberChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="mb-4 text-white" />
        <p className="text-zinc-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <p className="text-red-400 text-center">{error || 'Failed to load team data'}</p>
      </Card>
    );
  }

  // ─── Member Selection Screen ───
  if (!selectedMember) {
    // Generate a subtle unique hue per member for card accents
    const hues = [210, 270, 330, 160, 30, 50];

    return (
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 animate-slide-up">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-1 shadow-lg shadow-white/5">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Who are you?
          </h1>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Tap your name to continue to the <span className="text-white font-semibold">{team.team_name}</span> dashboard
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/50">{team.id}</span>
            <span className="text-xs text-zinc-500">{team.institution}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {team.team_members.map((member, index) => {
            const hue = hues[index % hues.length];
            return (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className="group relative text-left p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-zinc-900 hover:shadow-lg hover:shadow-white/[0.03] hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Subtle gradient glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 30% 0%, hsla(${hue}, 60%, 60%, 0.08) 0%, transparent 60%)`,
                  }}
                />

                <div className="relative flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 transition-all duration-300 border"
                    style={{
                      backgroundColor: `hsla(${hue}, 40%, 50%, 0.15)`,
                      borderColor: `hsla(${hue}, 40%, 50%, 0.25)`,
                      color: `hsla(${hue}, 60%, 75%, 1)`,
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="font-semibold text-white text-base sm:text-lg leading-tight truncate group-hover:text-white transition-colors">
                      {member.name}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `hsla(${hue}, 40%, 50%, 0.12)`,
                          borderColor: `hsla(${hue}, 40%, 50%, 0.2)`,
                          color: `hsla(${hue}, 50%, 70%, 1)`,
                        }}
                      >
                        {member.role}
                      </span>
                    </div>
                    {member.email && (
                      <div className="text-xs text-zinc-500 truncate">{member.email}</div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="self-center shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <ArrowRight size={14} className="text-zinc-500 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Main Dashboard (member selected) ───
  const isPending = team.status === STATUS.PENDING;
  
  // Render the digital ID card (used in both normal and fullscreen modes)
  const renderIDCard = (fullscreen: boolean) => (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-b from-zinc-800 to-black shadow-2xl transition-all duration-500 flex flex-col ${fullscreen ? 'w-full h-auto max-h-[95vh] overflow-y-auto no-scrollbar max-w-sm mx-auto shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'w-full max-w-sm mx-auto'}`}>
      
      {/* Lanyard Hole Punch (decorative) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-black/60 border border-white/10 shadow-inner z-30 hidden sm:block"></div>

      {/* Dynamic Holographic Background */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[50%] bg-emerald-500/30 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-[10%] -left-[20%] w-[80%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] left-[20%] w-[50%] h-[40%] bg-purple-500/20 rounded-full blur-[90px] pointer-events-none z-0 mix-blend-screen"></div>
      
      {/* Maximize / Close Button */}
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-5 right-5 z-40 p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md hover:scale-110 active:scale-95 shadow-lg"
      >
        {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Event Header */}
      <div className="w-full pt-10 pb-6 px-6 bg-gradient-to-b from-white/10 to-transparent relative z-10 flex flex-col items-center border-b border-white/10">
        <div className="text-emerald-400 font-bold tracking-[0.2em] text-xs mb-1 uppercase">Official Participant</div>
        <div className="font-heading font-black text-white text-2xl tracking-wide uppercase drop-shadow-md">NOESIS 2026</div>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col items-center text-center relative z-20 flex-1">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-zinc-700 to-zinc-900 p-1 mb-6 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-3xl opacity-20 blur-md -z-10"></div>
          <div className="w-full h-full rounded-[1.35rem] bg-zinc-900 flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 border border-white/10">
            {selectedMember.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-1 leading-tight drop-shadow-sm">
          {selectedMember.name}
        </h2>
        {selectedMember.email && (
          <p className="text-sm text-zinc-300 mb-3 drop-shadow-sm">
            {selectedMember.email}
          </p>
        )}
        
        <Badge variant="default" className="bg-white/10 text-white border-white/20 px-4 py-1 text-sm font-medium mb-8 backdrop-blur-sm">
          {selectedMember.role}
        </Badge>
        
        <div className="w-full space-y-5 bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Team Name</div>
            <div className="font-semibold text-white text-lg">{team.team_name}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Institution</div>
            <div className="font-medium text-zinc-300 text-sm leading-snug">{team.institution}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {renderIDCard(true)}
        </div>
      )}

      {/* Normal Dashboard View */}
      <div className={`space-y-6 sm:space-y-8 ${isFullscreen ? 'opacity-0 pointer-events-none hidden' : 'animate-slide-up'}`}>
        {/* Back Button */}
        <button 
          onClick={handleSwitchMember}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Team List</span>
        </button>

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">
              Welcome, {selectedMember.name.split(' ')[0]}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-zinc-400">Team {team.team_name}</span>
              <span className="text-zinc-600">·</span>
              <button
                onClick={handleSwitchMember}
                className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
              >
                Not {selectedMember.name.split(' ')[0]}? Switch
              </button>
            </div>
          </div>
          
          <Badge variant="default" className="self-start sm:self-auto font-mono text-xs sm:text-sm bg-white/5 border-white/10">
            {team.id}
          </Badge>
        </div>

        {/* Two-column layout for desktop: ID card on left, QR on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Digital ID Card */}
          <div className="flex flex-col items-center">
            {renderIDCard(false)}
            <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1">
              <Maximize2 size={12} /> Tap the maximize icon on the badge for fullscreen.
            </p>
          </div>

          {/* QR Code and Status Section */}
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 p-6 sm:p-8 flex flex-col items-center text-center shadow-lg">
              {isPending ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-white mb-2">
                    Check-in QR Code
                  </h3>
                  <p className="text-sm text-zinc-400 mb-6 max-w-xs">
                    Present this code at the registration desk to confirm your team's arrival.
                  </p>
                  
                  <div className="p-4 bg-white rounded-2xl w-full max-w-[220px] aspect-square flex items-center justify-center shadow-2xl relative overflow-hidden group">
                    {mounted ? (
                      <QRCodeCanvas 
                        value={`${window.location.origin}/admin/teams/${team.id}`}
                        size={200}
                        level="H"
                        includeMargin={false}
                        fgColor="#000000"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 animate-pulse" />
                    )}
                    {/* Scan line animation effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-1/2 -translate-y-full group-hover:animate-scan pointer-events-none"></div>
                  </div>
                  
                  <div className="mt-6 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Team Code</span>
                    <span className="text-lg font-mono text-white tracking-widest px-4 py-1.5 bg-black/50 rounded-lg border border-white/10">{team.id}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-heading font-semibold text-2xl text-white mb-2">
                    Checked In
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Your team's registration is confirmed. You're all set!
                  </p>
                  {team.checked_in_at && (
                    <div className="mt-6 inline-flex flex-col items-center p-4 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Timestamp</span>
                      <span className="text-sm text-zinc-300 font-mono">
                        {formatDate(new Date(team.checked_in_at))} at {formatTime(new Date(team.checked_in_at))}
                      </span>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}


