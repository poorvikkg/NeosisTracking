import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(payload: { id: string; role: string; username: string }): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' })
}

export function verifyToken(token: string): { id: string; role: string; username: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string; username: string }
  } catch (error) {
    return null
  }
}

export function getSessionFromCookies(cookieHeader: string | null): { id: string; role: string; username: string } | null {
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(';').map(c => c.trim())
  
  // Try to find admin_token first
  const adminTokenCookie = cookies.find(c => c.startsWith('admin_token='))
  if (adminTokenCookie) {
    const token = adminTokenCookie.substring('admin_token='.length)
    const session = verifyToken(token)
    if (session) return session
  }

  // Fallback to token (team token)
  const tokenCookie = cookies.find(c => c.startsWith('token='))
  if (tokenCookie) {
    const token = tokenCookie.substring('token='.length)
    return verifyToken(token)
  }
  
  return null
}
