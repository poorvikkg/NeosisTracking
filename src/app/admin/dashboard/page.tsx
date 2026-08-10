'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, Clock, Eye, ScanLine } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { STATUS } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import type { TeamWithMembers } from '@/lib/types';
import { StatsCard } from '@/components/ui/StatsCard';
import { Tabs } from '@/components/ui/Tabs';
import { SearchBar } from '@/components/ui/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { QrScanner } from '@/components/ui/QrScanner';

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/admin/teams');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch teams');
      }
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const channel = supabase
      .channel('teams_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchTeams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const stats = {
    total: teams.length,
    checkedIn: teams.filter((t) => t.status === STATUS.CHECKED_IN).length,
    pending: teams.filter((t) => t.status === STATUS.PENDING).length,
  };

  const filteredTeams = teams.filter((team) => {
    const matchesFilter = filter === 'ALL' || team.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      team.team_name.toLowerCase().includes(searchLower) ||
      team.id.toLowerCase().includes(searchLower) ||
      team.institution.toLowerCase().includes(searchLower) ||
      team.team_members.some((m) => m.name.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" className="text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-heading text-white">Dashboard</h1>
        <Button onClick={() => setScannerOpen(true)} className="gap-2">
          <ScanLine size={16} /> Scan QR
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Teams" value={stats.total} icon={Users} />
        <StatsCard title="Checked In" value={stats.checkedIn} icon={CheckCircle} valueColor="text-emerald-400" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} valueColor="text-amber-400" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Teams', count: stats.total },
              { id: STATUS.CHECKED_IN, label: 'Checked In', count: stats.checkedIn },
              { id: STATUS.PENDING, label: 'Pending', count: stats.pending },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
          <div className="w-full sm:w-64">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search teams..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3">Team ID</th>
                <th className="px-4 py-3">Team Name</th>
                <th className="px-4 py-3 hidden md:table-cell">Institution</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden sm:table-cell">Check-in Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-400">{team.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{team.team_name}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-zinc-400 max-w-[200px] truncate">
                      {team.institution}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {team.team_members.slice(0, 3).map((member, i) => (
                          <div
                            key={member.id}
                            className="h-7 w-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-medium text-white"
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {team.team_members.length > 3 && (
                          <div className="h-7 w-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-medium text-zinc-300">
                            +{team.team_members.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={team.status === STATUS.CHECKED_IN ? 'success' : 'warning'}>
                        {team.status === STATUS.CHECKED_IN ? 'Checked In' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                      {team.checked_in_at ? formatTime(new Date(team.checked_in_at)) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/teams/${team.id}`}>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No teams found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Modal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} title="Scan Team QR">
        <QrScanner
          onScanSuccess={(decodedText) => {
            setScannerOpen(false)
            try {
              const url = new URL(decodedText)
              router.push(url.pathname)
            } catch {
              router.push(decodedText)
            }
          }}
        />
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <Button variant="ghost" onClick={() => setScannerOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
