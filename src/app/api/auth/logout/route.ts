export async function POST(request: Request) {
  const tokenCookie = `token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
  const adminTokenCookie = `admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;

  const headers = new Headers();
  headers.append('Set-Cookie', tokenCookie);
  headers.append('Set-Cookie', adminTokenCookie);
  headers.append('Content-Type', 'application/json');

  return new Response(
    JSON.stringify({ success: true }),
    { 
      status: 200, 
      headers 
    }
  );
}
