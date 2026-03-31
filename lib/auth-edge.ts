// Edge Runtime compatible JWT verification using jose
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-required!'
)

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
