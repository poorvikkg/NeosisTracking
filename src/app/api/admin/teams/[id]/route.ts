import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: Request, ctx: any) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', id)
    .single();

  if (error || !team) {
    return Response.json({ error: 'Team not found' }, { status: 404 });
  }

  return Response.json({ team });
}

export async function PATCH(request: Request, ctx: any) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const updates = await request.json();
  const supabase = await createServerSupabaseClient();

  const updateData: any = {};
  if (updates.team_name) updateData.team_name = updates.team_name;
  if (updates.institution) updateData.institution = updates.institution;
  if (updates.status) {
    updateData.status = updates.status;
    if (updates.status === 'CHECKED_IN') {
      updateData.checked_in_at = new Date().toISOString();
    } else {
      updateData.checked_in_at = null;
    }
  }

  const { data: team, error } = await supabase
    .from('teams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ team });
}

export async function DELETE(request: Request, ctx: any) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
