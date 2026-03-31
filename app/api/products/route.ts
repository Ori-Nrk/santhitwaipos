
// import { query } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'
// import { getUserId } from '@/lib/getUser'

// export async function GET(request: NextRequest) {
//   try {
//     const userId = await getUserId(request)

//     const result = await query(
//       `SELECT id, name, cost_price as "costPrice", profit_margin as "profitMargin", price, category, stock, sku,
//               reorder_level as "reorderLevel", supplier_id as "supplierId"
//        FROM products
//        WHERE user_id = $1
//        ORDER BY id`,
//       [userId]
//     )

//     return NextResponse.json(result.rows)
//   } catch (error) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const userId = await getUserId(request)

//     const { name, costPrice, profitMargin, price, category, stock, sku, reorderLevel, supplierId } = await request.json()

//     if (!name || !sku) {
//       return NextResponse.json({ error: 'Name and SKU required' }, { status: 400 })
//     }

//     const result = await query(
//       `INSERT INTO products 
//        (user_id, name, cost_price, profit_margin, price, category, stock, sku, reorder_level, supplier_id)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
//        RETURNING *`,
//       [
//         userId,
//         name,
//         costPrice || 0,
//         profitMargin || 0,
//         price || 0,
//         category || 'General',
//         stock || 0,
//         sku,
//         reorderLevel || 10,
//         supplierId || null
//       ]
//     )

//     return NextResponse.json(result.rows[0], { status: 201 })
//   } catch (error) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }
// }

import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/getUser'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    const result = await query(
      `SELECT * FROM products WHERE user_id = $1 ORDER BY id`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    const body = await request.json()

    const result = await query(
      `INSERT INTO products 
       (user_id, name, cost_price, profit_margin, price, category, stock, sku, reorder_level, supplier_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        userId,
        body.name,
        body.costPrice || 0,
        body.profitMargin || 0,
        body.price || 0,
        body.category || 'General',
        body.stock || 0,
        body.sku,
        body.reorderLevel || 10,
        body.supplierId || null
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}