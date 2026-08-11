import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const teamName = body.teamName;
    const teamCode = body.teamCode;

    if (!teamName || !teamCode) {
      return Response.json({ error: 'Team name and team code are required.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Look up team by id (team code) and verify team_name matches
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', String(teamCode).trim().toUpperCase())
      .single();

    if (error || !team) {
      return Response.json({ error: 'Invalid team code. Please check and try again.' }, { status: 401 });
    }

    // Case-insensitive team name comparison
    if (team.team_name.toLowerCase() !== String(teamName).trim().toLowerCase()) {
      return Response.json({ error: 'Team name does not match the given code.' }, { status: 401 });
    }

    const token = await createToken({ id: team.id, role: 'TEAM', username: team.username || team.id });
    const cookieString = `token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        team: { 
          id: team.id, 
          team_name: team.team_name, 
          username: team.username || team.id, 
          institution: team.institution, 
          status: team.status 
        } 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': cookieString
        } 
      }
    );
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
