import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserId } from '@/lib/getUser'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request as any)

    const { id } = await params  // ✅ IMPORTANT FIX

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
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