// import { query } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'

// export async function GET() {
//   try {
//     console.log('[API] GET /api/suppliers')
//     const result = await query(
//       'SELECT id, name, contact_person as "contactPerson", phone, email, address, city, country, payment_terms as "paymentTerms" FROM suppliers ORDER BY name'
//     )
//     console.log('[API] Found', result.rows.length, 'suppliers')
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('[API] Error fetching suppliers:', error)
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to fetch suppliers', details: errorMessage },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { name, contactPerson, phone, email, address, city, country, paymentTerms } = await request.json()

//     console.log('[API] POST /api/suppliers - Creating:', name)

//     if (!name) {
//       return NextResponse.json(
//         { error: 'Supplier name is required' },
//         { status: 400 }
//       )
//     }

//     const result = await query(
//       'INSERT INTO suppliers (name, contact_person, phone, email, address, city, country, payment_terms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, contact_person as "contactPerson", phone, email, address, city, country, payment_terms as "paymentTerms"',
//       [name, contactPerson || null, phone || null, email || null, address || null, city || null, country || null, paymentTerms || null]
//     )

//     console.log('[API] Supplier created:', result.rows[0].id)
//     return NextResponse.json(result.rows[0], { status: 201 })
//   } catch (error) {
//     console.error('[API] Error creating supplier:', error)
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     return NextResponse.json(
//       { error: 'Failed to create supplier', details: errorMessage },
//       { status: 500 }
//     )
//   }
// }

import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[API] GET /api/suppliers')
    const result = await query(
      'SELECT id, name, contact_person as "contactPerson", phone, email, address FROM suppliers ORDER BY name'
    )
    console.log('[API] Found', result.rows.length, 'suppliers')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[API] Error fetching suppliers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch suppliers', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, contactPerson, phone, email, address } = await request.json()

    console.log('[API] POST /api/suppliers - Creating:', name)

    if (!name) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      )
    }

    const result = await query(
      'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, contact_person as "contactPerson", phone, email, address',
      [name, contactPerson || null, phone || null, email || null, address || null]
    )

    console.log('[API] Supplier created:', result.rows[0].id)
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('[API] Error creating supplier:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create supplier', details: errorMessage },
      { status: 500 }
    )
  }
}