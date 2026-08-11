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
    return (
      <div className="max-w-lg mx-auto space-y-5 sm:space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Who are you?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select your name to continue to the <span className="text-white font-medium">{team.team_name}</span> dashboard
          </p>
        </div>

        <Card className="p-0 overflow-hidden border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{team.id}</span>
              <span className="text-sm text-zinc-400">{team.team_name}</span>
            </div>
            <Badge variant="default" className="text-[11px]">{team.team_members.length} members</Badge>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {team.team_members.map((member, index) => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className="w-full flex items-center justify-between px-4 py-4 sm:py-5 text-left transition-all hover:bg-white/[0.04] active:bg-white/[0.08] group min-h-[60px]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0 group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base truncate leading-snug">{member.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {member.role}
                      {member.email && <span className="hidden sm:inline"> · {member.email}</span>}
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-zinc-600 group-hover:text-white shrink-0 ml-2 transition-colors" />
              </button>
            ))}
          </div>
        </Card>
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

