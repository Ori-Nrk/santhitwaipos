'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Search, Eye, Printer, Receipt, Store, CreditCard, Banknote, Trash2 } from 'lucide-react'

function formatDateLocale(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export default function ReceiptsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      console.log('[v0] Fetching transactions...')
      const response = await fetch('/api/transactions', {
  credentials: 'include'
})
      if (!response.ok) {
        throw new Error('Failed to load transactions')
      }
      const data = await response.json()
      console.log('[v0] Loaded', data.length, 'transactions')
      // Convert date strings to Date objects
      const transactionsWithDates = data.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }))
      setTransactions(transactionsWithDates)
    } catch (error) {
      console.error('[v0] Error fetching transactions:', error)
      alert('Error loading transactions: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(
    (t) =>
      t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )
const handlePrint = async (transaction: Transaction) => {
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
            .total-row { font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>San Thit Wai</h1>
            <p>POS System</p>
          </div>
          <p>Receipt: ${transaction.receiptNumber}</p>
        </body>
      </html>
    `)

    printWindow.document.close()

    // ✅ THIS WAS MISSING
    printWindow.focus()
    printWindow.print()
  }

  // 🔥 backend print (POS)
  try {
    await fetch('/api/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    })
  } catch (err) {
    console.error(err)
  }
}
  // const handlePrint = (transaction: Transaction) => {
  //   const printWindow = window.open('', '', 'width=300,height=600')
  //   if (printWindow) {
  //     printWindow.document.write(`
  //       <html>gi
  //         <head>
  //           <title>Receipt - ${transaction.receiptNumber}</title>
  //           <style>
  //             body {
  //               font-family: 'Courier New', monospace;
  //               font-size: 12px;
  //               padding: 10px;
  //               max-width: 280px;
  //               margin: 0 auto;
  //             }
  //             .header { text-align: center; margin-bottom: 10px; }
  //             .header h1 { font-size: 18px; margin: 0; }
  //             .header p { margin: 2px 0; font-size: 11px; }
  //             .divider { border-top: 1px dashed #000; margin: 8px 0; }
  //             .item { display: flex; justify-content: space-between; margin: 4px 0; }
  //             .total-row { font-weight: bold; }
  //             .footer { text-align: center; margin-top: 15px; font-size: 11px; }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="header">
  //             <h1>San Thit Wai</h1>
  //             <p>POS System</p>
  //             <p>123 Main Street, Yangon</p>
  //             <p>Tel: 09-123-456-789</p>
  //           </div>
  //           <div class="divider"></div>
  //           <p>Receipt: ${transaction.receiptNumber}</p>
  //           <p>Date: ${transaction.date.toLocaleString()}</p>
  //           <p>Payment: ${transaction.paymentMethod.toUpperCase()}</p>
  //           <div class="divider"></div>
  //           ${transaction.items
  //             .map(
  //               (item) => `
  //             <div class="item">
  //               <span>${item.name} x${item.quantity}</span>
  //               <span>${formatCurrency(item.price * item.quantity)}</span>
  //             </div>
  //           `
  //             )
  //             .join('')}
  //           <div class="divider"></div>
  //           <div class="item">
  //             <span>Subtotal</span>
  //             <span>${formatCurrency(transaction.subtotal)}</span>
  //           </div>
  //           <div class="item">
  //             <span>Tax (5%)</span>
  //             <span>${formatCurrency(transaction.tax)}</span>
  //           </div>
  //           <div class="item total-row">
  //             <span>TOTAL</span>
  //             <span>${formatCurrency(transaction.total)}</span>
  //           </div>
  //           ${
  //             transaction.paymentMethod === 'cash'
  //               ? `
  //             <div class="divider"></div>
  //             <div class="item">
  //               <span>Cash Received</span>
  //               <span>${formatCurrency(transaction.cashReceived || 0)}</span>
  //             </div>
  //             <div class="item total-row">
  //               <span>Change</span>
  //               <span>${formatCurrency(transaction.change || 0)}</span>
  //             </div>
  //           `
  //               : ''
  //           }
  //           <div class="footer">
  //             <p>Thank you for shopping with us!</p>
  //             <p>Please come again</p>
  //           </div>
  //         </body>
  //       </html>
  //     `)
  //     printWindow.document.close()
  //     printWindow.print()
  //   }
  // }

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setPasswordInput('')
    setDeleteError('')
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    const correctPassword = 'santhitwaireceipts'
    
    if (passwordInput !== correctPassword) {
      setDeleteError('Incorrect password')
      return
    }

    if (!transactionToDelete) return

    try {
      setDeleting(true)
      console.log('[v0] Deleting transaction:', transactionToDelete.id)
      
      const response = await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: 'DELETE'
      })

      let data: any = {}
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          console.log('[v0] Could not parse JSON response')
        }
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Failed to delete transaction')
      }

      console.log('[v0] Transaction deleted, updating UI')
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id))
      setShowDeleteDialog(false)
      setPasswordInput('')
      setDeleteError('')
      setTransactionToDelete(null)
      alert('Receipt deleted successfully!')
    } catch (error) {
      console.error('[v0] Delete error:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Receipt History</h1>
          <p className="text-sm text-muted-foreground">View and print past transactions</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                All Transactions
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt # or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {transaction.paymentMethod === 'cash' ? (
                        <Banknote className="h-5 w-5 text-primary" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold">{transaction.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLocale(transaction.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatCurrency(transaction.total)}</p>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {transaction.paymentMethod}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handlePrint(transaction)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="py-12 text-center">
                  <Receipt className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No receipts found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Receipt Details
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="rounded-lg border bg-card p-4">
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
                  <span className="font-mono">{selectedTransaction.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{selectedTransaction.date.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{selectedTransaction.date.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                {selectedTransaction.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name}{' '}
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span>{formatCurrency(selectedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedTransaction.total)}</span>
                </div>
              </div>

              {selectedTransaction.paymentMethod === 'cash' && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash Received</span>
                      <span>{formatCurrency(selectedTransaction.cashReceived || 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Change</span>
                      <span className="text-primary">
                        {formatCurrency(selectedTransaction.change || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              Close
            </Button>
            {selectedTransaction && (
              <Button onClick={() => handlePrint(selectedTransaction)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {`You are about to delete receipt ${transactionToDelete?.receiptNumber}. This action cannot be undone. Please enter the password to confirm.`}
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  setDeleteError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDeleteConfirm()
                  }
                }}
              />
              {deleteError && (
                <p className="text-sm font-medium text-destructive">{deleteError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={passwordInput === '' || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
