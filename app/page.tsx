'use client'

import { useState, useMemo, useEffect } from 'react'
import { Product, CartItem, Transaction } from '@/lib/types'
import { categories, formatCurrency } from '@/lib/data'
import { AppSidebar } from '@/components/app-sidebar'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { CategoryFilter } from '@/components/pos/category-filter'
import { ReceiptModal } from '@/components/pos/receipt-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'

export default function POSPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [cashReceived, setCashReceived] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)

  const fetchCustomers = async () => {
  try {
    const res = await fetch('/api/customers', {
      credentials: 'include',
    })

    if (!res.ok) throw new Error('Failed to load customers')

    const data = await res.json()
    setCustomers(data || [])
  } catch (err) {
    console.error(err)
  }
}

const fetchProducts = async () => {
  try {
    setLoading(true)

    const response = await fetch('/api/products', {
      credentials: 'include',
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Products API error:', err)
      throw new Error('Failed to load products')
    }

    const data = await response.json()
    console.log('POS products:', data)

    setProducts(data || [])
  } catch (error) {
    console.error(error)
    alert('Error loading products')
    setProducts([])
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])


//  const fetchProducts = async () => {
//   try {
//     setLoading(true) // ✅ start loading

//     const response = await fetch('/api/products', {
//       credentials: 'include',
//     })

//     if (!response.ok) {
//       const err = await response.text()
//       console.error('Products API error:', err)
//       throw new Error('Failed to load products')
//     }
//   const fetchCustomers = async () => {
//   try {
//     const res = await fetch('/api/customers', {
//       credentials: 'include',
//     })

//     if (!res.ok) throw new Error('Failed to load customers')

//     const data = await res.json()
//     setCustomers(data || [])
//   } catch (err) {
//     console.error(err)
//   }
// }
//     const data = await response.json()
//     console.log('POS products:', data) // 👈 debug

//     setProducts(data || [])
//   } catch (error) {
//     console.error(error)
//     alert('Error loading products')
//     setProducts([]) // fallback
//   } finally {
//     setLoading(false) // ✅ THIS WAS MISSING
//   }
// }
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax
  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
  }

  const handleRemoveItem = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearCart = () => {
    setCart([])
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!')
      return
    }

    if (paymentMethod === 'cash' && cashReceived < total) {
      alert('Insufficient cash received!')
      return
    }

    setIsProcessing(true)

    try {
      console.log('[v0] Processing checkout...')
      const receiptNumber = `RCP-${Date.now()}`
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  receiptNumber,
  items: cart,
  subtotal,
  tax,
  total,
  paymentMethod,
  cashReceived: paymentMethod === 'cash' ? cashReceived : null,
  change: paymentMethod === 'cash' ? change : null,
  customerId: selectedCustomer || null   // ✅ THIS FIXES EVERYTHING
}),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Checkout failed')
      }

      console.log('[v0] Transaction saved successfully:', data.id)

      // Create transaction object for receipt display
      const transaction: Transaction = {
        id: data.id,
        receiptNumber: receiptNumber,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          costPrice: item.costPrice,
          profitMargin: item.profitMargin,
          category: item.category,
          stock: item.stock,
          sku: item.sku,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
        change: paymentMethod === 'cash' ? change : undefined,
        date: new Date(),
      }

      setLastTransaction(transaction)
      setShowReceipt(true)
      
      // Clear cart and reset checkout
      setCart([])
      setShowCheckout(false)
      setCashReceived(0)
      setPaymentMethod('cash')
      
      // Refresh products to update stock
      await fetchProducts()
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      alert('Checkout error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setLastTransaction(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      <main className="ml-64">
        <div className="flex h-screen">
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">POS Terminal</h1>
              <p className="text-sm text-muted-foreground">Select products to add to cart</p>
            </div>

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto pb-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading products from database...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">No products available</div>
              ) : (
                <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
              )}
            </div>
          </div>

          <div className="w-96 border-l bg-card p-4 flex flex-col">
            <CartPanel
              items={cart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={() => setShowCheckout(true)}
            />
          </div>
        </div>
      </main>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Checkout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

<div>
  <label className="block text-sm font-medium mb-2">Customer</label>

  <select
    className="w-full border rounded-md p-2"
    value={selectedCustomer || ''}
    onChange={(e) =>
      setSelectedCustomer(
        e.target.value ? Number(e.target.value) : null
      )
    }
  >
    <option value="">Walk-in Customer</option>

    {customers.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>
</div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="flex gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Card
                </Button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-medium mb-2">Cash Received (Ks)</label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  disabled={isProcessing}
                />
                {cashReceived > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Change: <span className="font-semibold text-primary">{formatCurrency(change)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={(paymentMethod === 'cash' && cashReceived < total) || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Complete Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lastTransaction && (
        <ReceiptModal
          open={showReceipt}
          onClose={handleCloseReceipt}
          transaction={lastTransaction}
        />
      )}

    </div>
  )
}
