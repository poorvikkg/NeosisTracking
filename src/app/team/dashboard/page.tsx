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
import { CheckCircle2, Clock, Users, UserCircle2, ArrowRight } from 'lucide-react';

export default function TeamDashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberChecked, setMemberChecked] = useState(false);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* A. Welcome Header */}
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">
          Welcome, {selectedMember.name.split(' ')[0]}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Badge variant="default">
            <span className="font-mono text-xs sm:text-sm">{team.id}</span>
          </Badge>
          <span className="text-xs sm:text-sm text-zinc-400">{team.team_name}</span>
          <span className="text-zinc-600">·</span>
          <button
            onClick={handleSwitchMember}
            className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
          >
            Not {selectedMember.name.split(' ')[0]}?
          </button>
        </div>
      </div>

      {/* B. Status Card */}
      <Card glass className="animate-slide-up p-4 sm:p-6" style={{ animationDelay: '100ms' }}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/10 text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium text-white text-sm sm:text-base">Registration Confirmed</span>
          </div>

          <div className="h-px w-full bg-white/10" />

          {isPending ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-zinc-800 text-zinc-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-300 text-base sm:text-lg">Check-in Pending</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 ml-11 sm:ml-12">
                Show your QR code at the registration desk when you arrive.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-medium text-emerald-300 text-base sm:text-lg">Checked In</span>
              </div>
              {team.checked_in_at && (
                <p className="text-xs sm:text-sm text-zinc-400 ml-11 sm:ml-12 font-mono">
                  Checked in at {formatTime(new Date(team.checked_in_at))} on{' '}
                  {formatDate(new Date(team.checked_in_at))}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* C. Team Members Card */}
      <Card className="animate-slide-up p-4 sm:p-6" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
            Team Members
          </h2>
          <Badge variant="default">{team.team_members.length}</Badge>
        </div>
        <div className="space-y-2.5">
          {team.team_members.map((member) => {
            const isYou = member.id === selectedMember.id;
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-xl border gap-2 ${
                  isYou
                    ? 'bg-white/[0.07] border-white/15'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <div className="font-medium text-white text-xs sm:text-sm truncate">{member.name}</div>
                  {isYou && (
                    <Badge variant="default" className="text-[10px] bg-white/20 border-white/10">You</Badge>
                  )}
                </div>
                <Badge variant="default" className="shrink-0 text-[11px] sm:text-xs">{member.role}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* E. Check-in QR Card */}
      {isPending && (
        <Card
          className="animate-slide-up border-white/10 bg-white/5 p-4 sm:p-6"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <h3 className="font-heading font-semibold text-lg sm:text-xl text-white">
              Ready to check in?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-2">
              Present this QR code to the registration desk to check in.
            </p>
            
            <div className="p-3 sm:p-4 bg-white rounded-2xl max-w-[240px] sm:max-w-[260px] w-full flex items-center justify-center shadow-xl">
              {mounted ? (
                <QRCodeCanvas 
                  value={`${window.location.origin}/admin/teams/${team.id}`}
                  size={190}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                  style={{ width: '100%', height: 'auto', maxWidth: '200px' }}
                />
              ) : (
                <div className="w-[190px] h-[190px] bg-zinc-100 rounded-lg animate-pulse" />
              )}
            </div>
            
            <p className="text-xs text-zinc-500 mt-2 font-mono">
              Team Code: {team.id}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

