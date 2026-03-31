import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserId } from '@/lib/getUser'

// ✅ GET categories (user-specific)
export async function GET(req: Request) {
  try {
    const userId = await getUserId(req as any)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET categories error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ✅ CREATE category (user-specific)
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req as any)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name required' },
        { status: 400 }
      )
    }

    const result = await db.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    )

    return NextResponse.json(result.rows[0])
  } catch (err: any) {
    console.error('POST categories error:', err)

    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}