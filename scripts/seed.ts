// Seed script: clears teams + team_members, inserts data from CSV
// Run with: npx tsx scripts/seed.ts

import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '../src/lib/auth'
import { generateTeamId, generatePassword } from '../src/lib/utils'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Parsed from the CSV
const teamsData = [
  {
    code: 'BNV-673',
    name: 'Sahaaya',
    institution: 'St Joseph Engineering College, Mangaluru',
    members: [
      { name: 'Jia Menezes', email: '23b26.jia@sjec.ac.in', role: 'Team Leader' },
      { name: 'Gaana Gowshik', email: '23b03.gowshik@sjec.ac.in', role: 'Team Member' },
      { name: 'Carol Sweedle Pinto', email: 'pintocarol130905@gmail.com', role: 'Team Member' },
      { name: 'Vernon Lee', email: 'vernonxlee@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'LXP-264',
    name: 'AJ Geeks',
    institution: 'A. J. Institute of Engineering and Technology',
    members: [
      { name: 'Praveeth P Bhandary', email: 'praveethpbhandary06@gmail.com', role: 'Team Leader' },
      { name: 'Gagan Suvarna', email: 'gaganmsuvarna@gmail.com', role: 'Team Member' },
      { name: 'Shubrath Shetty', email: 'subrathshetty2k06@gmail.com', role: 'Team Member' },
      { name: 'Ananya Suvarna', email: 'ananyasuvarna98@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'HQL-905',
    name: 'Audionix',
    institution: 'St Joseph Engineering College, Mangaluru',
    members: [
      { name: 'Akshatha Pai', email: 'akshathapai350@gmail.com', role: 'Team Leader' },
      { name: 'Earl Dsouza', email: '23j22.earl@sjec.ac.in', role: 'Team Member' },
      { name: 'Achala A Patel', email: '23j02.achala@sjec.ac.in', role: 'Team Member' },
      { name: 'Chithara Hirinja', email: '23j26.chithara@sjec.ac.in', role: 'Team Member' },
    ],
  },
  {
    code: 'MTR-824',
    name: 'BeatAhead',
    institution: 'Bangalore Institute of Technology',
    members: [
      { name: 'Skanda K N', email: 'skandakn13@gmail.com', role: 'Team Leader' },
      { name: 'Rohith Somayaji S', email: 'rohithsomayaji@gmail.com', role: 'Team Member' },
      { name: 'Trisha Shetty', email: 'tshetty014@gmail.com', role: 'Team Member' },
      { name: 'Ziya Khaleel', email: 'ziyakhaleel26@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'ZKP-736',
    name: 'TATTVIQ',
    institution: 'St Joseph Engineering College, Mangaluru',
    members: [
      { name: 'Meloon Albert Pinto', email: '23h31.meloon@sjec.ac.in', role: 'Team Leader' },
      { name: 'SaiVardhan G', email: 'vardhangolla18@gmail.com', role: 'Team Member' },
      { name: 'Alvita Corda', email: '23h03.alvita@sjec.ac.in', role: 'Team Member' },
      { name: 'Tanisha Shetty', email: 'tanishatshetty@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'VTX-392',
    name: 'IPE',
    institution: 'Institute of Public Enterprise, Hyderabad',
    members: [
      { name: 'Sejal Agrawal', email: 'sejalagrawal763@icloud.com', role: 'Team Leader' },
      { name: 'Anvisha Kanuru', email: 'kanuruanvisha@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'RVM-418',
    name: 'GreenMinders',
    institution: 'St Joseph Engineering College, Mangaluru',
    members: [
      { name: 'Gayathri G', email: '24b15.gayathrig@sjec.ac.in', role: 'Team Leader' },
      { name: 'Jaden Lenard', email: '24b28.jaden@sjec.ac.in', role: 'Team Member' },
    ],
  },
  {
    code: 'KTR-459',
    name: 'Inovexa',
    institution: 'A. J. Institute of Engineering and Technology',
    members: [
      { name: 'Raksheeta Shintri', email: 'rakshithashintri@gmail.com', role: 'Team Leader' },
      { name: 'Poornima J S', email: 'poornimajs16@gmail.com', role: 'Team Member' },
      { name: 'Pooja M', email: 'poojamerkala2006@gmail.com', role: 'Team Member' },
      { name: 'Sahanya Shetty', email: 'sahanyashetty4@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'NXS-047',
    name: "D'zine",
    institution: 'St Aloysius College (Autonomous), Mangaluru',
    members: [
      { name: 'Vivian Marcel Sequeira', email: 'svivianmarcel@gmail.com', role: 'Team Leader' },
      { name: 'Prajwal V Raghavendra', email: 'prajwalvr1357@gmail.com', role: 'Team Member' },
      { name: 'Anagha K', email: 'itsanaghak@gmail.com', role: 'Team Member' },
      { name: 'Sujeet Bengani', email: 'benganisujeet2006@gmail.com', role: 'Team Member' },
    ],
  },
  {
    code: 'QRM-581',
    name: 'Heisenbugs',
    institution: 'St Joseph Engineering College, Mangaluru',
    members: [
      { name: 'Francis Dsouza', email: 'dsouzafrancis853@gmail.com', role: 'Team Leader' },
      { name: 'Glen Hansel Noronha', email: 'glennoronha6666@gmail.com', role: 'Team Member' },
      { name: 'Joel Joshua', email: 'jjoel7654321@gmail.com', role: 'Team Member' },
      { name: 'Frenny Saldanha', email: 'saldanhafrenny@gmail.com', role: 'Team Member' },
    ],
  },
]

async function seed() {
  console.log('🗑️  Clearing teams and team_members...')

  const { error: delMembers } = await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delMembers) console.error('Error deleting members:', delMembers.message)

  const { error: delTeams } = await supabase.from('teams').delete().neq('id', 'NONE')
  if (delTeams) console.error('Error deleting teams:', delTeams.message)

  console.log('✅ Tables cleared (admins preserved)\n')

  const credentials: { code: string; team: string; username: string; password: string }[] = []

  for (const t of teamsData) {
    const teamId = t.code
    const username = t.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    const plainPassword = generatePassword(8)
    const passwordHash = await hashPassword(plainPassword)

    console.log(`Creating team ${teamId}: ${t.name}...`)

    const { error: teamErr } = await supabase.from('teams').insert({
      id: teamId,
      team_name: t.name,
      username,
      password_hash: passwordHash,
      institution: t.institution,
      status: 'PENDING',
    })

    if (teamErr) {
      console.error(`  ❌ Error inserting team: ${teamErr.message}`)
      continue
    }

    const memberRows = t.members.map((m) => ({
      team_id: teamId,
      name: m.name,
      email: m.email,
      role: m.role,
      is_present: false,
    }))

    const { error: memErr } = await supabase.from('team_members').insert(memberRows)
    if (memErr) {
      console.error(`  ❌ Error inserting members: ${memErr.message}`)
    }

    credentials.push({ code: teamId, team: t.name, username, password: plainPassword })
    console.log(`  ✅ ${t.name} — ${t.members.length} members`)
  }

  console.log('\n========================================')
  console.log('   TEAM CREDENTIALS (save these!)')
  console.log('========================================\n')

  console.log('Team Code  | Team Name         | Username          | Password')
  console.log('-----------|-------------------|-------------------|----------')
  for (const c of credentials) {
    console.log(`${c.code.padEnd(10)} | ${c.team.padEnd(17)} | ${c.username.padEnd(17)} | ${c.password}`)
  }

  // Also write to a file
  const csvLines = ['Team Code,Team Name,Username,Password']
  for (const c of credentials) {
    csvLines.push(`${c.code},${c.team},${c.username},${c.password}`)
  }
  fs.writeFileSync(path.resolve(__dirname, '../team_credentials.csv'), csvLines.join('\n'))
  console.log('\n📄 Credentials saved to team_credentials.csv')

  console.log('\n🎉 Seed complete!')
}

seed().catch(console.error)
