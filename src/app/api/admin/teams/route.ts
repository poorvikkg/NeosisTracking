import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies, hashPassword } from '@/lib/auth';
import { generateTeamId, generatePassword } from '@/lib/utils';
import { STATUS } from '@/lib/constants';

export async function GET(request: Request) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const supabase = await createServerSupabaseClient();
  let query = supabase.from('teams').select('*, team_members(*)');

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`team_name.ilike.%${search}%,id.ilike.%${search}%,institution.ilike.%${search}%`);
  }

  const { data: teams, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ teams });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { team_name, institution, members } = await request.json();
    const supabase = await createServerSupabaseClient();

    const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const teamCount = count || 0;
    const teamId = generateTeamId(teamCount + 1);

    const username = team_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const plainPassword = generatePassword();
    const hashedPassword = await hashPassword(plainPassword);

    const newTeam = {
      id: teamId,
      team_name,
      institution,
      username,
      password_hash: hashedPassword,
      status: STATUS.PENDING,
    };

    const { data: insertedTeam, error: teamError } = await supabase
      .from('teams')
      .insert(newTeam)
      .select()
      .single();

    if (teamError) throw teamError;

    if (members && members.length > 0) {
      const teamMembers = members.map((m: any) => ({
        team_id: teamId,
        name: m.name,
        email: m.email || null,
        role: m.role || 'MEMBER',
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers);

      if (membersError) throw membersError;
    }

    return Response.json({ team: insertedTeam, password: plainPassword });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
