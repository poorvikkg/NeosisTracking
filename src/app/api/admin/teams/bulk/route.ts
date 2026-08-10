import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies, hashPassword } from '@/lib/auth';
import { generateTeamId, generatePassword } from '@/lib/utils';
import { STATUS } from '@/lib/constants';

export async function POST(request: Request) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { teams } = await request.json();
    const supabase = await createServerSupabaseClient();

    const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    let currentCount = count || 0;
    
    const created = [];

    for (const teamData of teams) {
      currentCount++;
      const teamId = generateTeamId(currentCount);
      const username = teamData.team_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const plainPassword = generatePassword();
      const hashedPassword = await hashPassword(plainPassword);

      const newTeam = {
        id: teamId,
        team_name: teamData.team_name,
        institution: teamData.institution,
        username,
        password: hashedPassword,
        status: STATUS.PENDING,
      };

      const { error: teamError } = await supabase.from('teams').insert(newTeam);
      if (teamError) continue;

      if (teamData.members && teamData.members.length > 0) {
        const teamMembers = teamData.members.map((m: any) => ({
          team_id: teamId,
          name: m.name,
          email: m.email || null,
          role: m.role || 'MEMBER',
        }));
        await supabase.from('team_members').insert(teamMembers);
      }

      created.push({
        id: teamId,
        team_name: teamData.team_name,
        username,
        password: plainPassword,
      });
    }

    return Response.json({ created });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
