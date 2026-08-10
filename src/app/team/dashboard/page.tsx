'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QRCodeCanvas } from 'qrcode.react';
import { STATUS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/utils';
import type { TeamWithMembers } from '@/lib/types';
import { CheckCircle2, Clock, Users } from 'lucide-react';

export default function TeamDashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

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
        setTeam(teamData.team ?? teamData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
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

  const isPending = team.status === STATUS.PENDING;

  return (
    <div className="space-y-6">
      {/* A. Welcome Header */}
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          Welcome, {team.team_name}
        </h1>
        <div className="flex items-center gap-3">
          <Badge variant="default">
            <span className="font-mono">{team.id}</span>
          </Badge>
          <span className="text-zinc-400">{team.institution}</span>
        </div>
      </div>

      {/* B. Status Card */}
      <Card glass className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/10 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium text-white">Registration Confirmed</span>
          </div>

          <div className="h-px w-full bg-white/10" />

          {isPending ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-zinc-800 text-zinc-300">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-300 text-lg">Check-in Pending</span>
              </div>
              <p className="text-zinc-500 ml-12">
                Show your QR code at the registration desk when you arrive.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-white/10 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-medium text-white text-lg">Checked In</span>
              </div>
              {team.checked_in_at && (
                <p className="text-zinc-400 ml-12 text-sm">
                  Checked in at {formatTime(new Date(team.checked_in_at))} on{' '}
                  {formatDate(new Date(team.checked_in_at))}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* C. Team Members Card */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="w-5 h-5 text-zinc-400" />
            Team Members
          </h2>
          <Badge variant="default">{team.team_members.length}</Badge>
        </div>
        <div className="space-y-3">
          {team.team_members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <div>
                <div className="font-medium text-white">{member.name}</div>
                {member.email && (
                  <div className="text-sm text-zinc-500">{member.email}</div>
                )}
              </div>
              <Badge variant="default">{member.role}</Badge>
            </div>
          ))}
        </div>
      </Card>


      {/* E. Check-in QR Card */}
      {isPending && (
        <Card
          className="animate-slide-up border-white/10 bg-white/5"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <h3 className="font-heading font-semibold text-xl text-white">
              Ready to check in?
            </h3>
            <p className="text-zinc-400 mb-4">
              Present this QR code to the registration desk to check in.
            </p>
            
            <div className="p-4 bg-white rounded-xl min-h-[252px] min-w-[252px] flex items-center justify-center">
              {mounted ? (
                <QRCodeCanvas 
                  value={`${window.location.origin}/admin/teams/${team.id}`}
                  size={220}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                />
              ) : (
                <div className="w-[220px] h-[220px] bg-zinc-100 rounded-lg animate-pulse" />
              )}
            </div>
            
            <p className="text-xs text-zinc-600 mt-4 font-mono">
              Team Code: {team.id}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
