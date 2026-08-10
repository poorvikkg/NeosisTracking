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
    setTogglingId(memberId)
    try {
      const res = await fetch(`/api/admin/teams/${id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, isPresent }),
      })
      if (res.ok) {
        await fetchTeam()
      } else {
        toast('Failed to update', 'error')
      }
    } catch {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/admin/dashboard"
        className="text-zinc-500 hover:text-white flex items-center gap-2 w-fit text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Dashboard
      </Link>

      {/* Team header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">{team.team_name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-sm text-zinc-500">{team.id}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm text-zinc-400">{team.institution}</span>
          </div>
        </div>
        <Badge variant={isCheckedIn ? 'success' : 'warning'}>
          {isCheckedIn ? 'Checked In' : 'Pending'}
        </Badge>
      </div>

      {/* Status banner */}
      {isCheckedIn && team.checked_in_at && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <Check size={16} className="text-white" />
          <span className="text-sm text-zinc-300">
            Checked in at {formatTime(team.checked_in_at)}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Users size={14} />
            Members present
          </span>
          <span className="text-white font-mono">
            {presentCount}/{totalCount}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allPresent ? 'bg-white' : 'bg-zinc-500'
            }`}
            style={{ width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Members list */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 bg-black/30">
          <h3 className="text-sm font-medium text-zinc-400">Mark attendance</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {team.team_members?.map((member: TeamMember) => {
            const isToggling = togglingId === member.id
            return (
              <button
                key={member.id}
                onClick={() => toggleMemberPresence(member.id, !member.is_present)}
                disabled={isToggling}
                className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors hover:bg-zinc-800/30 ${
                  member.is_present ? 'bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                      member.is_present
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {member.is_present ? (
                      <Check size={16} />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{member.name}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {member.role}
                      {member.email && ` · ${member.email}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {isToggling && (
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  )}
                  {member.is_present && member.marked_at && !isToggling && (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(member.marked_at)}
                    </span>
                  )}
                  {/* Toggle indicator */}
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      member.is_present ? 'bg-white' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                        member.is_present
                          ? 'left-5 bg-black'
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
            className="text-xs text-zinc-600 gap-1.5"
          >
            <ShieldAlert size={12} /> Undo check-in
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => forceStatusOverride('CHECKED_IN')}
            className="text-xs text-zinc-600 gap-1.5"
          >
            <ShieldAlert size={12} /> Force check-in
          </Button>
        )}
      </div>
    </div>
  )
}
