export interface Team {
  id: string
  team_name: string
  username: string
  password_hash: string
  institution: string
  status: 'PENDING' | 'CHECKED_IN'
  checked_in_at: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  name: string
  email: string | null
  role: string
  is_present: boolean
  marked_at: string | null
  created_at: string
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  created_at: string
}

export interface ScheduleEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  order_index: number
  created_at: string
}

export interface TeamWithMembers extends Team {
  team_members: TeamMember[]
}

export interface SessionPayload {
  id: string
  role: string
  username: string
}
