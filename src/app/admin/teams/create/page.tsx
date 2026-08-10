'use client'

import { useState } from 'react'
import { Plus, X, Copy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

export default function CreateTeam() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [institution, setInstitution] = useState('')
  const [members, setMembers] = useState([{ name: '', email: '', role: 'Team Lead' }])
  const [result, setResult] = useState<{ id: string, username: string, password?: string } | null>(null)

  const handleAddMember = () => {
    if (members.length < 6) {
      setMembers([...members, { name: '', email: '', role: 'Member' }])
    }
  }

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName, institution, members })
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ...data.team, password: data.password })
        toast('Team created successfully', 'success')
      } else {
        toast(data.error || 'Failed to create team', 'error')
      }
    } catch (err) {
      toast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTeamName('')
    setInstitution('')
    setMembers([{ name: '', email: '', role: 'Team Lead' }])
    setResult(null)
  }

  const copyCredentials = () => {
    if (!result) return
    const text = `Team: ${teamName}\nUsername: ${result.username}\nPassword: ${result.password}`
    navigator.clipboard.writeText(text)
    toast('Credentials copied to clipboard', 'success')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-outfit font-bold">Create New Team</h1>
      
      <Card className="p-6 border-white/10 bg-zinc-900/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-300">Team Name</label>
              <Input required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Code Ninjas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-300">Institution</label>
              <Input required value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. MIT" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h3 className="text-lg font-medium text-zinc-200">Members ({members.length}/6)</h3>
              {members.length < 6 && (
                <Button type="button" variant="secondary" size="sm" onClick={handleAddMember} className="gap-2">
                  <Plus size={16} /> Add Member
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 bg-black/20 rounded-lg border border-white/5 relative">
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-zinc-400 mb-1">Name</label>
                    <Input required value={member.name} onChange={e => handleMemberChange(index, 'name', e.target.value)} placeholder="Member Name" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-zinc-400 mb-1">Email (Optional)</label>
                    <Input type="email" value={member.email} onChange={e => handleMemberChange(index, 'email', e.target.value)} placeholder="member@example.com" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="block text-xs text-zinc-400 mb-1">Role</label>
                    <select 
                      value={member.role} 
                      onChange={e => handleMemberChange(index, 'role', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="Team Lead">Team Lead</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  {members.length > 1 && (
                    <Button type="button" variant="ghost" className="absolute top-2 right-2 md:static md:w-auto w-8 h-8 md:h-auto p-0 md:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleRemoveMember(index)}>
                      <X size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" isLoading={loading} className="w-full md:w-auto">Create Team</Button>
          </div>
        </form>
      </Card>

      <Modal isOpen={!!result} onClose={() => setResult(null)} title="Team Created Successfully!">
        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-900 p-4 rounded-lg border border-white/10 font-mono text-sm space-y-2 selection:bg-zinc-700">
              <p><span className="text-zinc-500">Team ID:</span> <span className="text-zinc-200">{result.id}</span></p>
              <p><span className="text-zinc-500">Username:</span> <span className="text-zinc-200">{result.username}</span></p>
              <p><span className="text-zinc-500">Password:</span> <span className="text-white font-bold">{result.password}</span></p>
            </div>
            <p className="text-sm text-zinc-400">Please save these credentials now. The password will not be shown again.</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={copyCredentials} className="flex-1 gap-2"><Copy size={16} /> Copy Credentials</Button>
              <Button variant="secondary" onClick={resetForm} className="flex-1 border-dashed">Create Another</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
