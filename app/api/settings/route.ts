import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[API] GET /api/settings')
    const result = await query(
      'SELECT * FROM store_settings ORDER BY id DESC LIMIT 1'
    )
    
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        storeInfo: {
          name: 'San Thit Wai',
          address: '83, Taung Yoe Road, Nann Oo Myo Thit, Sagaing',
          phone: '09797966033, 09442026209',
          taxRate: 5,
        },
        receiptSettings: {
          showLogo: true,
          showAddress: true,
          showPhone: true,
          footerMessage: 'Thank you for shopping with us!',
        },
        notifications: {
          lowStockAlerts: true,
          dailySummary: false,
          newSaleAlert: false,
        },
        appearance: {
          theme: 'green',
        },
      })
    }

    const s = result.rows[0]
    return NextResponse.json({
      id: s.id,
      storeInfo: {
        name: s.store_name,
        address: s.address,
        phone: s.phone_number,
        taxRate: parseFloat(s.tax_rate),
      },
      receiptSettings: {
        showLogo: s.show_logo,
        showAddress: s.show_address,
        showPhone: s.show_phone,
        footerMessage: s.footer_message,
      },
      notifications: {
        lowStockAlerts: s.low_stock_alerts,
        dailySummary: s.daily_summary,
        newSaleAlert: s.new_sale_alert,
      },
      appearance: {
        theme: s.theme_color,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { storeInfo, receiptSettings, notifications, appearance } = await request.json()

    console.log('[API] POST /api/settings - Saving settings')

    // Check if settings exist
    const existing = await query('SELECT id FROM store_settings LIMIT 1')

    let result
    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE store_settings 
         SET store_name = $1, address = $2, phone_number = $3, tax_rate = $4,
             show_logo = $5, show_address = $6, show_phone = $7, footer_message = $8,
             low_stock_alerts = $9, daily_summary = $10, new_sale_alert = $11,
             theme_color = $12, updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
          storeInfo.name,
          storeInfo.address,
          storeInfo.phone,
          storeInfo.taxRate,
          receiptSettings.showLogo,
          receiptSettings.showAddress,
          receiptSettings.showPhone,
          receiptSettings.footerMessage,
          notifications.lowStockAlerts,
          notifications.dailySummary,
          notifications.newSaleAlert,
          appearance.theme,
          existing.rows[0].id,
        ]
      )
    } else {
      // Insert new
      result = await query(
        `INSERT INTO store_settings 
         (store_name, address, phone_number, tax_rate, show_logo, show_address, show_phone, footer_message, low_stock_alerts, daily_summary, new_sale_alert, theme_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          storeInfo.name,
          storeInfo.address,
          storeInfo.phone,
          storeInfo.taxRate,
          receiptSettings.showLogo,
          receiptSettings.showAddress,
          receiptSettings.showPhone,
          receiptSettings.footerMessage,
          notifications.lowStockAlerts,
          notifications.dailySummary,
          notifications.newSaleAlert,
          appearance.theme,
        ]
      )
    }

    const s = result.rows[0]
    const responseData = {
      id: s.id,
      storeInfo: {
        name: s.store_name,
        address: s.address,
        phone: s.phone_number,
        taxRate: parseFloat(s.tax_rate),
      },
      receiptSettings: {
        showLogo: s.show_logo,
        showAddress: s.show_address,
        showPhone: s.show_phone,
        footerMessage: s.footer_message,
      },
      notifications: {
        lowStockAlerts: s.low_stock_alerts,
        dailySummary: s.daily_summary,
        newSaleAlert: s.new_sale_alert,
      },
      appearance: {
        theme: s.theme_color,
      },
    }

    console.log('[API] Settings saved successfully')
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('[API] Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
