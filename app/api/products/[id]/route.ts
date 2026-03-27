import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, costPrice, profitMargin, price, category, stock, sku, supplier, reorderLevel, supplierId } = await request.json()

    console.log('[API] PUT /api/products/[id] - Updating:', id, 'with supplierId:', supplierId)

    const result = await query(
      `UPDATE products SET name=$1, cost_price=$2, profit_margin=$3, price=$4, category=$5, stock=$6, sku=$7, supplier=$8, reorder_level=$9, supplier_id=$10 
       WHERE id=$11 
       RETURNING id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku, supplier, reorder_level as "reorderLevel", supplier_id as "supplierId"`,
      [name, costPrice || 0, profitMargin || 0, price || 0, category || 'Groceries', stock || 0, sku, supplier || null, reorderLevel || 10, supplierId || null, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('[API] Product updated:', id)
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('[API] Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if product is used in any transactions
    const checkResult = await query(
      'SELECT COUNT(*) as count FROM transaction_items WHERE product_id=$1',
      [id]
    )
    
    const transactionCount = checkResult.rows[0]?.count || 0
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product', 
          details: `This product has been used in ${transactionCount} transaction(s). You can only delete products that haven't been used in any transactions.`,
          transactionCount
        },
        { status: 409 }
      )
    }
    
    const result = await query('DELETE FROM products WHERE id=$1', [id])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('[API] Product deleted:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
