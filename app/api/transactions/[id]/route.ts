import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[API] Deleting transaction:', id)

    // Get transaction items to restore stock
    const itemsResult = await query(
      'SELECT product_id, quantity FROM transaction_items WHERE transaction_id = $1',
      [id]
    )

    console.log('[API] Found', itemsResult.rows.length, 'items to restore')

    // Restore stock for all items
    for (const item of itemsResult.rows) {
      console.log('[API] Restoring stock for product:', item.product_id, 'quantity:', item.quantity)
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      )
    }

    // Delete transaction items
    await query('DELETE FROM transaction_items WHERE transaction_id = $1', [id])

    // Delete transaction
    const result = await query('DELETE FROM transactions WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    console.log('[API] Transaction deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}