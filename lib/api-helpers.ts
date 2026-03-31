import { NextRequest } from 'next/server'

export function getUserIdFromRequest(request: NextRequest): number | null {
  const userId = request.headers.get('x-user-id')
  if (!userId) return null
  return parseInt(userId)
}

export function extractUserHeaders(request: NextRequest) {
  return {
    userId: parseInt(request.headers.get('x-user-id') || '0'),
    email: request.headers.get('x-user-email') || '',
    storeName: request.headers.get('x-store-name') || '',
  }
}