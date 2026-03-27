
// import { query } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'

// export async function GET() {
//   try {
//     console.log('[API] GET /api/products')
//     const result = await query(
//       `SELECT id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku, supplier, 
//               reorder_level as "reorderLevel", supplier_id as "supplierId" FROM products ORDER BY id`
//     )
//     console.log('[API] Found', result.rows.length, 'products')
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('[API] Error fetching products:', error)
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to fetch products', details: errorMessage },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { name, costPrice, profitMargin, price, category, stock, sku, supplier, reorderLevel, supplierId } = await request.json()

//     console.log('[API] POST /api/products - Creating:', name, 'with supplierId:', supplierId)

//     if (!name || !sku) {
//       return NextResponse.json(
//         { error: 'Name and SKU are required' },
//         { status: 400 }
//       )
//     }

//     const result = await query(
//       `INSERT INTO products (name, cost_price, profit_margin, price, category, stock, sku, supplier, reorder_level, supplier_id) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
//        RETURNING id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku, supplier, reorder_level as "reorderLevel", supplier_id as "supplierId"`,
//       [name, costPrice || 0, profitMargin || 0, price || 0, category || 'Groceries', stock || 0, sku, supplier || null, reorderLevel || 10, supplierId || null]
//     )

//     console.log('[API] Product created:', result.rows[0].id)
//     return NextResponse.json(result.rows[0], { status: 201 })
//   } catch (error) {
//     console.error('[API] Error creating product:', error)
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to create product', details: errorMessage },
//       { status: 500 }
//     )
//   }
// }
import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[API] GET /api/products')
    const result = await query(
      `SELECT id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku, supplier, 
              reorder_level as "reorderLevel", supplier_id as "supplierId" FROM products ORDER BY id`
    )
    console.log('[API] Found', result.rows.length, 'products')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[API] Error fetching products:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, costPrice, profitMargin, price, category, stock, sku, supplier, reorderLevel, supplierId } = await request.json()

    console.log('[API] POST /api/products - Creating:', name, 'with supplierId:', supplierId)

    if (!name || !sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO products (name, cost_price, profit_margin, price, category, stock, sku, supplier, reorder_level, supplier_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku, supplier, reorder_level as "reorderLevel", supplier_id as "supplierId"`,
      [name, costPrice || 0, profitMargin || 0, price || 0, category || 'Groceries', stock || 0, sku, supplier || null, reorderLevel || 10, supplierId || null]
    )

    console.log('[API] Product created:', result.rows[0].id)
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('[API] Error creating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create product', details: errorMessage },
      { status: 500 }
    )
  }
}