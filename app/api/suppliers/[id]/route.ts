import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserId } from '@/lib/getUser'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = await getUserId(request)
    const supplierId = parseInt(id)

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Invalid supplier id' },
        { status: 400 }
      )
    }

    const result = await query(
      `DELETE FROM suppliers 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [supplierId, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Supplier not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('[API] DELETE supplier error:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}