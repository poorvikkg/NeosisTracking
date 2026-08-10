import { createServerSupabaseClient } from '@/lib/supabase/server';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, admin.password_hash);
    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken({ id: admin.id, role: 'ADMIN', username: admin.username });
    const cookieString = `admin_token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`;

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': cookieString
        } 
      }
    );
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
