// import { NextRequest, NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import { verifyPassword, createJWT } from '@/lib/auth'

// export async function POST(request: NextRequest) {
//   try {
//     const { username, password } = await request.json()

//     if (!username || !password) {
//       return NextResponse.json(
//         { error: 'Username and password are required' },
//         { status: 400 }
//       )
//     }

//     const result = await query('SELECT * FROM users WHERE username = $1', [username])
//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       )
//     }

//     const user = result.rows[0]

//     if (!verifyPassword(password, user.password_hash)) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       )
//     }

//     const token = await createJWT(user.id, user.username)

//     const response = NextResponse.json(
//       { message: 'Login successful', userId: user.id },
//       { status: 200 }
//     )

//     response.cookies.set('auth-token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 7,
//     })

//     return response
//   } catch (error) {
//     console.error('[API] Login error:', error)
//     return NextResponse.json(
//       { error: 'Login failed' },
//       { status: 500 }
//     )
//   }
// }

import { NextResponse } from 'next/server'
import { createJWT, verifyPassword } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    const user = result.rows[0]

    // if (!user || !verifyPassword(password, user.password)) {

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await createJWT({
      userId: user.id,
      username: user.username,
    })

    const res = NextResponse.json({ success: true })

    // ✅ THIS IS THE CRITICAL FIX
    res.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return res
  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}