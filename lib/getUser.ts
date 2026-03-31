import { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function getUserId(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    throw new Error('No token')
  }

  const payload = await verifyJWT(token)

  if (!payload || !payload.userId) {
    throw new Error('Invalid token')
  }

  return payload.userId
}