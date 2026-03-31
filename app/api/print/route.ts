import { NextRequest, NextResponse } from 'next/server'
import iconv from 'iconv-lite'
import { spawn } from 'child_process'

function buildReceipt(data: any) {
  let text =
    '\x1B\x40' + // init printer
    'San Thit Wai\n' +
    'POS System\n' +
    '----------------------\n' +
    `Receipt: ${data.receiptNumber}\n` +
    `Date: ${new Date(data.date).toLocaleString()}\n` +
    `Payment: ${data.paymentMethod}\n\n`

  for (const item of data.items || []) {
    text += `${item.name} x${item.quantity}  ${item.price * item.quantity}\n`
  }

  text +=
    '\n----------------------\n' +
    `Subtotal: ${data.subtotal}\n` +
    `Tax: ${data.tax}\n` +
    `Total: ${data.total}\n`

  if (data.paymentMethod === 'cash') {
    text +=
      `\nCash: ${data.cashReceived ?? 0}\n` +
      `Change: ${data.change ?? 0}\n`
  }

  text += '\n\nThank you!\n\n\n'

  return text
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const text = buildReceipt(data)

    // ✅ encoding for POS printer
    const buffer = iconv.encode(text, 'cp437')

    // ✅ send directly to printer via CUPS RAW
    const printer = spawn('lp', ['-d', 'Printer_POS-80', '-o', 'raw'])

    printer.stdin.write(buffer)
    printer.stdin.end()

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Print failed' }, { status: 500 })
  }
}