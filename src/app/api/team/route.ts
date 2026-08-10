import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'TEAM') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.id;
  const supabase = await createServerSupabaseClient();

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', teamId)
    .single();

  if (error || !team) {
    return Response.json({ error: 'Team not found' }, { status: 404 });
  }

  return Response.json({ team });
}
