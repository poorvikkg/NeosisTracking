import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Admin routes protection
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const adminToken = request.cookies.get('admin_token')
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Team routes protection
  if (path.startsWith('/team')) {
    const token = request.cookies.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Prevent logged-in admins from accessing login page
  if (path === '/admin/login') {
    const adminToken = request.cookies.get('admin_token')
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Prevent logged-in teams from accessing login page
  if (path === '/login') {
    const token = request.cookies.get('token')
    if (token) {
      return NextResponse.redirect(new URL('/team/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/team/:path*', '/login'],
}
