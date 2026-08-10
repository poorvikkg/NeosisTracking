import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    return Response.json(
      { error: 'Admin already exists. Use existing admin to create more.' },
      { status: 403 }
    );
  }

  const hashedPassword = await hashPassword(password);
  const { error } = await supabase
    .from('admins')
    .insert({ username, password_hash: hashedPassword });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
