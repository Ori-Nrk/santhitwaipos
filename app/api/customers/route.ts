import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserId } from '@/lib/getUser'

export async function GET(req: Request) {
  const userId = await getUserId(req as any)

  const result = await db.query(
    'SELECT * FROM customers WHERE user_id = $1 ORDER BY name',
    [userId]
  )

  return NextResponse.json(result.rows)
}
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req as any)
    const body = await req.json()

    const { name, phone } = body

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const result = await db.query(
      'INSERT INTO customers (name, phone, user_id) VALUES ($1,$2,$3) RETURNING *',
      [name, phone || null, userId]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId(request as any)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    await db.query(
      `DELETE FROM customers WHERE id = $1 AND user_id = $2`,
      [Number(id), userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}