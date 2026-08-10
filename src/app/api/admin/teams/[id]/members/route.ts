import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth';

export async function PATCH(request: Request, ctx: any) {
  const session = await getSessionFromCookies(request.headers.get('cookie'));
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { memberId, isPresent } = await request.json();
  const supabase = await createServerSupabaseClient();

  const markedAt = isPresent ? new Date().toISOString() : null;

  const { data: member, error } = await supabase
    .from('team_members')
    .update({ is_present: isPresent, marked_at: markedAt })
    .eq('id', memberId)
    .eq('team_id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Count present members
  const { count: presentCount, error: presentCountError } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id)
    .eq('is_present', true);

  // Count total members
  const { count: totalCount, error: totalCountError } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id);

  if (!presentCountError && !totalCountError && totalCount !== null && presentCount !== null) {
    if (totalCount > 0 && presentCount === totalCount) {
      await supabase
        .from('teams')
        .update({ status: 'CHECKED_IN', checked_in_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'PENDING');
    } else {
      await supabase
        .from('teams')
        .update({ status: 'PENDING', checked_in_at: null })
        .eq('id', id);
    }
  }

  return Response.json({ success: true, member });
}
