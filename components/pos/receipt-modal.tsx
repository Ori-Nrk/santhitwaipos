'use client'

import { useRef } from 'react'
import { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Printer, CheckCircle, Store } from 'lucide-react'

interface ReceiptModalProps {
  open: boolean
  onClose: () => void
  transaction: Transaction
}

export function ReceiptModal({ open, onClose, transaction }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'width=300,height=600')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${transaction.receiptNumber}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  padding: 10px;
                  max-width: 280px;
                  margin: 0 auto;
                }
                .header { text-align: center; margin-bottom: 10px; }
                .header h1 { font-size: 18px; margin: 0; }
                .header p { margin: 2px 0; font-size: 11px; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; }
                .item { display: flex; justify-content: space-between; margin: 4px 0; }
                .item-name { flex: 1; }
                .total-row { font-weight: bold; }
                .footer { text-align: center; margin-top: 15px; font-size: 11px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>San Thit Wai</h1>
                <p>POS System</p>
                <p>123 Main Street, Yangon</p>
                <p>Tel: 09-123-456-789</p>
              </div>
              <div class="divider"></div>
              <p>Receipt: ${transaction.receiptNumber}</p>
              <p>Date: ${transaction.date.toLocaleString()}</p>
              <p>Payment: ${transaction.paymentMethod.toUpperCase()}</p>
              <div class="divider"></div>
              ${transaction.items.map(item => `
                <div class="item">
                  <span class="item-name">${item.name} x${item.quantity}</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
              `).join('')}
              <div class="divider"></div>
              <div class="item">
                <span>Subtotal</span>
                <span>${formatCurrency(transaction.subtotal)}</span>
              </div>
              <div class="item">
                <span>Tax (5%)</span>
                <span>${formatCurrency(transaction.tax)}</span>
              </div>
              <div class="item total-row">
                <span>TOTAL</span>
                <span>${formatCurrency(transaction.total)}</span>
              </div>
              ${transaction.paymentMethod === 'cash' ? `
                <div class="divider"></div>
                <div class="item">
                  <span>Cash Received</span>
                  <span>${formatCurrency(transaction.cashReceived || 0)}</span>
                </div>
                <div class="item total-row">
                  <span>Change</span>
                  <span>${formatCurrency(transaction.change || 0)}</span>
                </div>
              ` : ''}
              <div class="footer">
                <p>Thank you for shopping with us!</p>
                <p>Please come again</p>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Payment Successful
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="rounded-lg border bg-card p-4">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold">San Thit Wai</h2>
            <p className="text-xs text-muted-foreground">123 Main Street, Yangon</p>
          </div>

          <Separator className="my-3" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt #</span>
              <span className="font-mono">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{transaction.date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span>{transaction.date.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="capitalize">{transaction.paymentMethod}</span>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>{formatCurrency(transaction.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(transaction.total)}</span>
            </div>
          </div>

          {transaction.paymentMethod === 'cash' && (
            <>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Received</span>
                  <span>{formatCurrency(transaction.cashReceived || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Change</span>
                  <span className="text-primary">{formatCurrency(transaction.change || 0)}</span>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
