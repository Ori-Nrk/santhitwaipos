import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/getUser'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    const result = await query(
      `SELECT * FROM suppliers WHERE user_id = $1 ORDER BY id`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const body = await request.json()

    const result = await query(
      `INSERT INTO suppliers (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, body.name]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}