'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Clock, Users, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { STATUS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { TeamWithMembers, TeamMember } from '@/lib/types'

export default function TeamDetail() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/admin/teams/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team ?? data)
      } else {
        router.push('/admin/dashboard')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchTeam()
  }, [id])

  const toggleMemberPresence = async (memberId: string, isPresent: boolean) => {
    // 1. Optimistic UI update
    setTeam((prevTeam) => {
      if (!prevTeam) return prevTeam
      
      const updatedMembers = prevTeam.team_members.map((m) =>
        m.id === memberId
          ? { ...m, is_present: isPresent, marked_at: isPresent ? new Date().toISOString() : null }
          : m
      )
      
      const presentCount = updatedMembers.filter(m => m.is_present).length
      const allPresent = presentCount === updatedMembers.length
      const newStatus = allPresent ? 'CHECKED_IN' : (prevTeam.status === 'CHECKED_IN' ? 'PENDING' : prevTeam.status)
      
      return {
        ...prevTeam,
        team_members: updatedMembers,
        status: newStatus,
        checked_in_at: newStatus === 'CHECKED_IN' && !prevTeam.checked_in_at ? new Date().toISOString() : (newStatus === 'PENDING' ? null : prevTeam.checked_in_at)
      } as TeamWithMembers
    })

    // 2. Background API call
    setTogglingId(memberId)
    try {
      const res = await fetch(`/api/admin/teams/${id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, isPresent }),
      })
      
      if (!res.ok) {
        // Revert on failure
        await fetchTeam()
        toast('Failed to update', 'error')
      }
    } catch {
      await fetchTeam()
      toast('Network error', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const forceStatusOverride = async (newStatus: 'CHECKED_IN' | 'PENDING') => {
    if (!confirm(`Force status to ${newStatus}?`)) return
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          checked_in_at: newStatus === 'CHECKED_IN' ? new Date().toISOString() : null,
        }),
      })
      if (res.ok) {
        toast(`Status → ${newStatus}`, 'success')
        fetchTeam()
      }
    } catch {
      toast('Failed', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!team) return null

  const presentCount = team.team_members?.filter((m) => m.is_present).length ?? 0
  const totalCount = team.team_members?.length ?? 0
  const allPresent = totalCount > 0 && presentCount === totalCount
  const isCheckedIn = team.status === STATUS.CHECKED_IN

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
      {/* Back link */}
      <Link
        href="/admin/dashboard"
        className="text-zinc-400 hover:text-white flex items-center gap-2 w-fit text-sm transition-colors py-1"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Team header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white leading-tight">{team.team_name}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
            <span className="font-mono text-xs sm:text-sm text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{team.id}</span>
            <span className="text-zinc-600 hidden sm:inline">·</span>
            <span className="text-xs sm:text-sm text-zinc-400">{team.institution}</span>
          </div>
        </div>
        <Badge variant={isCheckedIn ? 'success' : 'warning'} className="self-start sm:self-auto text-xs px-3 py-1">
          {isCheckedIn ? 'Checked In' : 'Pending'}
        </Badge>
      </div>

      {/* Status banner */}
      {isCheckedIn && team.checked_in_at && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <Check size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm text-emerald-200">
            Checked in at {formatTime(team.checked_in_at)}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Users size={14} />
            Attendance Progress
          </span>
          <span className="text-white font-mono font-semibold">
            {presentCount} / {totalCount} present
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allPresent ? 'bg-emerald-400' : 'bg-white'
            }`}
            style={{ width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Members list */}
      <Card className="p-0 overflow-hidden border-zinc-800">
        <div className="px-4 py-3 border-b border-zinc-800 bg-black/40 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Mark Attendance</h3>
          <span className="text-[11px] text-zinc-500">Tap member to toggle</span>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {team.team_members?.map((member: TeamMember) => {
            const isToggling = togglingId === member.id
            return (
              <button
                key={member.id}
                onClick={() => toggleMemberPresence(member.id, !member.is_present)}
                disabled={isToggling}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 sm:px-4 sm:py-4 text-left transition-colors hover:bg-zinc-800/40 min-h-[56px] active:bg-zinc-800/60 ${
                  member.is_present ? 'bg-white/[0.03]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar circle */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                      member.is_present
                        ? 'bg-emerald-400 text-black font-semibold'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {member.is_present ? (
                      <Check size={18} />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-medium text-white truncate leading-snug">{member.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {member.role}
                      {member.email && <span className="hidden sm:inline"> · {member.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  {isToggling ? (
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  ) : (
                    member.is_present && member.marked_at && (
                      <span className="text-[11px] text-zinc-500 font-mono hidden sm:flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(member.marked_at)}
                      </span>
                    )
                  )}
                  {/* Toggle indicator */}
                  <div
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      member.is_present ? 'bg-emerald-400' : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                        member.is_present
                          ? 'left-6 bg-black'
                          : 'left-1 bg-zinc-400'
                      }`}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Force override */}
      <div className="flex justify-center pt-2">
        {isCheckedIn ? (
          <Button
            variant="ghost"
            onClick={() => forceStatusOverride('PENDING')}
            className="text-xs text-zinc-500 hover:text-red-400 gap-1.5"
          >
            <ShieldAlert size={14} /> Undo check-in
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => forceStatusOverride('CHECKED_IN')}
            className="text-xs text-zinc-500 hover:text-emerald-400 gap-1.5"
          >
            <ShieldAlert size={14} /> Force check-in
          </Button>
        )}
      </div>
    </div>
  )
}
