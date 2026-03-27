// import { query, getClient } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//   const client = await getClient()

//   try {
//     await client.query('BEGIN')

//     const { items, subtotal, tax, total, paymentMethod, cashReceived, change, receiptNumber } = await request.json()

//     const txResult = await client.query(
//       'INSERT INTO transactions (receipt_number, total, subtotal, tax, payment_method, cash_received, change_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
//       [receiptNumber, total, subtotal, tax, paymentMethod, cashReceived || null, change || null]
//     )

//     const transactionId = txResult.rows[0].id

//     for (const item of items) {
//       await client.query(
//         'INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
//         [transactionId, item.id, item.quantity, item.price]
//       )

//       await client.query(
//         'UPDATE products SET stock = stock - $1 WHERE id = $2',
//         [item.quantity, item.id]
//       )
//     }

//     await client.query('COMMIT')

//     return NextResponse.json({ id: transactionId, receiptNumber }, { status: 201 })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     console.error('[v0] Database error:', error)
//     return NextResponse.json(
//       { error: 'Failed to create transaction', details: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     )
//   } finally {
//     client.release()
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const result = await query(
//       `SELECT t.id, t.receipt_number as "receiptNumber", t.total, t.subtotal, t.tax, t.payment_method as "paymentMethod", t.cash_received as "cashReceived", t.change_amount as "change", t.created_at as "date",
//               json_agg(json_build_object('id', ti.product_id, 'quantity', ti.quantity, 'price', ti.price, 'name', p.name)) as items
//        FROM transactions t
//        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
//        LEFT JOIN products p ON ti.product_id = p.id
//        GROUP BY t.id
//        ORDER BY t.created_at DESC`
//     )
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('[v0] Database error:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     )
//   }
// }

// import { query, getClient } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//   const client = await getClient()

//   try {
//     console.log('[API] POST /api/transactions - Starting transaction')
//     await client.query('BEGIN')

//     const { items, subtotal, tax, total, paymentMethod, cashReceived, change, receiptNumber } = await request.json()

//     console.log('[API] Creating transaction:', { receiptNumber, total, itemCount: items.length })

//     const txResult = await client.query(
//       'INSERT INTO transactions (receipt_number, total, subtotal, tax, payment_method, cash_received, change_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
//       [receiptNumber, total, subtotal, tax, paymentMethod, cashReceived || null, change || null]
//     )

//     const transactionId = txResult.rows[0].id
//     console.log('[API] Transaction created, ID:', transactionId)

//     for (const item of items) {
//       console.log('[API] Adding item:', { productId: item.id, quantity: item.quantity })

//       await client.query(
//         'INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
//         [transactionId, item.id, item.quantity, item.price]
//       )

//       await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id])

//       console.log('[API] Stock updated for product:', item.id)
//     }

//     await client.query('COMMIT')
//     console.log('[API] Transaction committed successfully')

//     return NextResponse.json({ id: transactionId, receiptNumber }, { status: 201 })
//   } catch (error) {
//     console.error('[API] Transaction error:', error)
//     await client.query('ROLLBACK')
//     const errorMsg = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to create transaction', details: errorMsg },
//       { status: 500 }
//     )
//   } finally {
//     client.release()
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     console.log('[API] GET /api/transactions')

//     const result = await query(
//       `SELECT t.id, t.receipt_number as "receiptNumber", t.total, t.subtotal, t.tax, t.payment_method as "paymentMethod", t.cash_received as "cashReceived", t.change_amount as "change", t.created_at as "date",
//               json_agg(json_build_object('id', ti.product_id, 'quantity', ti.quantity, 'price', ti.price, 'name', p.name, 'category', p.category)) as items
//        FROM transactions t
//        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
//        LEFT JOIN products p ON ti.product_id = p.id
//        GROUP BY t.id
//        ORDER BY t.created_at DESC`
//     )

//     console.log('[API] Found', result.rows.length, 'transactions')
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('[API] Error fetching transactions:', error)
//     const errorMsg = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to fetch transactions', details: errorMsg },
//       { status: 500 }
//     )
//   }
// }

import { query, getClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const client = await getClient()

  try {
    console.log('[API] Starting transaction...')
    await client.query('BEGIN')

    const { items, subtotal, tax, total, paymentMethod, cashReceived, change, receiptNumber } = await request.json()
    
    console.log('[API] Transaction data:', { receiptNumber, total, items: items.length })

    const txResult = await client.query(
      'INSERT INTO transactions (receipt_number, total, subtotal, tax, payment_method, cash_received, change_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [receiptNumber, total, subtotal, tax, paymentMethod, cashReceived || null, change || null]
    )

    const transactionId = txResult.rows[0].id
    console.log('[API] Transaction created with ID:', transactionId)

    for (const item of items) {
      console.log('[API] Adding item:', { productId: item.id, quantity: item.quantity })
      
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [transactionId, item.id, item.quantity, item.price]
      )

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      )
      
      console.log('[API] Stock updated for product:', item.id)
    }

    await client.query('COMMIT')
    console.log('[API] Transaction committed successfully')

    return NextResponse.json({ id: transactionId, receiptNumber }, { status: 201 })
  } catch (error) {
    console.error('[API] Transaction error:', error)
    await client.query('ROLLBACK')
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create transaction', details: errorMsg },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT t.id, t.receipt_number as "receiptNumber", t.total, t.subtotal, t.tax, t.payment_method as "paymentMethod", t.cash_received as "cashReceived", t.change_amount as "change", t.created_at as "date",
              json_agg(json_build_object('id', ti.product_id, 'quantity', ti.quantity, 'price', ti.price, 'name', p.name)) as items
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
       LEFT JOIN products p ON ti.product_id = p.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[API] Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}