import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserId } from '@/lib/getUser'

export async function GET(req: Request) {
  const userId = await getUserId(req as any)

  const result = await db.query(`
    SELECT 
      c.id,
      c.name,
      COUNT(t.id) AS total_orders,
      COALESCE(SUM(t.total), 0) AS total_spent
    FROM customers c
    LEFT JOIN transactions t 
      ON t.customer_id = c.id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY total_spent DESC
  `, [userId])

  const customers = result.rows

  const totalRevenue = customers.reduce(
    (sum, c) => sum + Number(c.total_spent),
    0
  )

  const topCustomers = customers.slice(0, 5)

  const topCustomersRevenue = topCustomers.reduce(
    (sum, c) => sum + Number(c.total_spent),
    0
  )

  return NextResponse.json({
    totalRevenue,
    topCustomersRevenue,
    customers
  })
}