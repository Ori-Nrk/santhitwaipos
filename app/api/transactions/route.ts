
import { query, getClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/getUser'
import db from '@/lib/db'
// export async function POST(request: NextRequest) {
//   const client = await getClient()

//   try {
//     const userId = await getUserId(request)

//     await client.query('BEGIN')

//     const { items, subtotal, tax, total, paymentMethod, cashReceived, change, receiptNumber } = await request.json()

//     const txResult = await client.query(
//       `INSERT INTO transactions 
//        (user_id, receipt_number, total, subtotal, tax, payment_method, cash_received, change_amount)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//        RETURNING id`,
//       [userId, receiptNumber, total, subtotal, tax, paymentMethod, cashReceived || null, change || null]
//     )

//     const transactionId = txResult.rows[0].id

//     for (const item of items) {
//       await client.query(
//         `INSERT INTO transaction_items (user_id, transaction_id, product_id, quantity, price)
//          VALUES ($1,$2,$3,$4,$5)`,
//         [userId, transactionId, item.id, item.quantity, item.price]
//       )

//       await client.query(
//         `UPDATE products 
//          SET stock = stock - $1 
//          WHERE id = $2 AND user_id = $3`,
//         [item.quantity, item.id, userId]
//       )
//     }

//     await client.query('COMMIT')

//     return NextResponse.json({ id: transactionId }, { status: 201 })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     return NextResponse.json({ error: 'Failed' }, { status: 500 })
//   } finally {
//     client.release()
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const userId = await getUserId(request)

//     const result = await query(
//       `SELECT t.id, t.receipt_number as "receiptNumber", t.total, t.subtotal, t.tax,
//               t.payment_method as "paymentMethod", t.cash_received as "cashReceived",
//               t.change_amount as "change", t.created_at as "date",
//               json_agg(json_build_object(
//                 'id', ti.product_id,
//                 'quantity', ti.quantity,
//                 'price', ti.price
//               )) as items
//        FROM transactions t
//        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
//        WHERE t.user_id = $1
//        GROUP BY t.id
//        ORDER BY t.created_at DESC`,
//       [userId]
//     )

//     return NextResponse.json(result.rows)
//   } catch {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }
// }
export async function GET(request: Request) {
  try {
    const userId = await getUserId(request as any)

    const result = await db.query(
      `SELECT 
        t.id, 
        t.receipt_number as "receiptNumber", 
        t.total, 
        t.subtotal, 
        t.tax,
        t.payment_method as "paymentMethod", 
        t.cash_received as "cashReceived",
        t.change_amount as "change", 
        t.created_at as "date",
        json_agg(json_build_object(
          'id', ti.product_id,
          'quantity', ti.quantity,
          'price', ti.price
        )) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET /transactions error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
export async function POST(request: NextRequest) {
  const client = await getClient()

  try {
    const userId = await getUserId(request)

    await client.query('BEGIN')

    const {
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      cashReceived,
      change,
      receiptNumber,
      customerId   // ✅ ADD THIS
    } = await request.json()

    const txResult = await client.query(
      `INSERT INTO transactions 
       (user_id, receipt_number, total, subtotal, tax, payment_method, cash_received, change_amount, customer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        userId,
        receiptNumber,
        total,
        subtotal,
        tax,
        paymentMethod,
        cashReceived || null,
        change || null,
        customerId || null   // ✅ THIS IS THE KEY FIX
      ]
    )

    const transactionId = txResult.rows[0].id

    for (const item of items) {
      await client.query(
        `INSERT INTO transaction_items (user_id, transaction_id, product_id, quantity, price)
         VALUES ($1,$2,$3,$4,$5)`,
        [userId, transactionId, item.id, item.quantity, item.price]
      )

      await client.query(
        `UPDATE products 
         SET stock = stock - $1 
         WHERE id = $2 AND user_id = $3`,
        [item.quantity, item.id, userId]
      )
    }

    await client.query('COMMIT')

    return NextResponse.json({ id: transactionId }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error) // 👈 helpful debug
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    client.release()
  }
}