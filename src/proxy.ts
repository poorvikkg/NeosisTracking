import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isTokenValid(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Parse the payload using atob
    const payload = JSON.parse(atob(parts[1]))
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken || !isTokenValid(adminToken)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (pathname.startsWith('/team')) {
    const token = request.cookies.get('token')?.value
    if (!token || !isTokenValid(token)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/team/:path*']
}
