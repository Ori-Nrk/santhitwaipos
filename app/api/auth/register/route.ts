// import { NextRequest, NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import { hashPassword, createJWT } from '@/lib/auth'

// export async function POST(request: NextRequest) {
//   try {
//     const { username, password } = await request.json()

//     if (!username || !password) {
//       return NextResponse.json(
//         { error: 'Username and password are required' },
//         { status: 400 }
//       )
//     }

//     if (username.length < 3) {
//       return NextResponse.json(
//         { error: 'Username must be at least 3 characters' },
//         { status: 400 }
//       )
//     }

//     if (password.length < 6) {
//       return NextResponse.json(
//         { error: 'Password must be at least 6 characters' },
//         { status: 400 }
//       )
//     }

//     const existing = await query('SELECT id FROM users WHERE username = $1', [username])
//     if (existing.rows.length > 0) {
//       return NextResponse.json(
//         { error: 'Username already taken' },
//         { status: 400 }
//       )
//     }

//     const passwordHash = hashPassword(password)

//     const result = await query(
//       'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
//       [username, passwordHash]
//     )

//     const user = result.rows[0]
//     const token = await createJWT(user.id, user.username)

//     const response = NextResponse.json(
//       { message: 'Account created successfully', userId: user.id },
//       { status: 201 }
//     )

//     response.cookies.set('auth-token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 7,
//     })

//     return response
//   } catch (error) {
//     console.error('[API] Registration error:', error)
//     return NextResponse.json(
//       { error: 'Registration failed' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, createJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const existing = await query('SELECT id FROM users WHERE username = $1', [username])
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    const passwordHash = hashPassword(password)

    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    )

    const user = result.rows[0]
    const token = await createJWT({ id: user.id, username: user.username })

    const response = NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('[API] Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
