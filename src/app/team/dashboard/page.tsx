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
import { CheckCircle2, Clock, Users, UserCircle2, ArrowRight, Maximize2, Minimize2, X, IdCard } from 'lucide-react';

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

  const handleSelectMember = (member: TeamMember) => {
    if (!team) return;
    setSelectedMember(member);
    localStorage.setItem(`selected_member_${team.id}`, member.id);
  };

  const handleSwitchMember = () => {
    if (!team) return;
    setSelectedMember(null);
    localStorage.removeItem(`selected_member_${team.id}`);
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
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-2xl transition-all duration-500 ${fullscreen ? 'w-full max-w-sm mx-auto shadow-white/5' : 'w-full max-w-md mx-auto'}`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Maximize / Close Button */}
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
      >
        {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <IdCard className="w-5 h-5 text-emerald-400" />
          <span className="font-heading font-semibold text-white tracking-wide uppercase text-sm">Participant Badge</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 flex flex-col items-center text-center relative z-10">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-white/10 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl mb-6">
          {selectedMember.name.charAt(0).toUpperCase()}
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
          {selectedMember.name}
        </h2>
        
        <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 mb-6">
          {selectedMember.role}
        </Badge>
        
        <div className="w-full space-y-4 pt-4 border-t border-white/5">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Team</div>
            <div className="font-medium text-white text-base sm:text-lg">{team.team_name}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Institution</div>
            <div className="font-medium text-zinc-300 text-sm sm:text-base">{team.institution}</div>
          </div>
        </div>
      </div>

      {/* Footer & QR */}
      {isPending && (
        <div className="px-6 py-6 border-t border-white/5 bg-white/[0.02] flex flex-col items-center">
          <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-semibold">Check-in QR</p>
          <div className="p-3 bg-white rounded-xl shadow-inner">
            {mounted ? (
              <QRCodeCanvas 
                value={`${window.location.origin}/admin/teams/${team.id}`}
                size={120}
                level="H"
                includeMargin={false}
                fgColor="#000000"
              />
            ) : (
              <div className="w-[120px] h-[120px] bg-zinc-100 rounded-lg animate-pulse" />
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-3 font-mono tracking-widest">{team.id}</p>
        </div>
      )}
      
      {!isPending && (
        <div className="px-6 py-4 border-t border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Successfully Checked In</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {renderIDCard(true)}
        </div>
      )}

      {/* Normal Dashboard View */}
      <div className={`space-y-6 sm:space-y-8 ${isFullscreen ? 'opacity-0 pointer-events-none hidden' : 'animate-slide-up'}`}>
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

        {/* Digital ID Card inside regular flow */}
        {renderIDCard(false)}
        
        <p className="text-center text-xs text-zinc-500">
          Tap the maximize icon in the top right of the ID card to show it fullscreen.
        </p>
      </div>
    </>
  );
}


