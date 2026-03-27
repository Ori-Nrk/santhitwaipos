// 'use client'

// import { useState } from 'react'
// import { CartItem, Transaction } from '@/lib/types'
// import { formatCurrency, generateReceiptNumber } from '@/lib/data'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Separator } from '@/components/ui/separator'
// import { Minus, Plus, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react'
// import { ReceiptModal } from './receipt-modal'

// interface CartPanelProps {
//   items: CartItem[]
//   onUpdateQuantity: (id: string, quantity: number) => void
//   onRemoveItem: (id: string) => void
//   onClearCart: () => void
// }

// const TAX_RATE = 0.05

// export function CartPanel({ items, onUpdateQuantity, onRemoveItem, onClearCart }: CartPanelProps) {
//   const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
//   const [cashReceived, setCashReceived] = useState('')
//   const [showReceipt, setShowReceipt] = useState(false)
//   const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)

//   const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
//   const tax = Math.round(subtotal * TAX_RATE)
//   const total = subtotal + tax

//   const cashAmount = parseFloat(cashReceived) || 0
//   const change = cashAmount - total

//   const canCheckout = items.length > 0 && (paymentMethod === 'card' || cashAmount >= total)

//   const handleCheckout = () => {
//     const transaction: Transaction = {
//       id: `t${Date.now()}`,
//       items: [...items],
//       subtotal,
//       tax,
//       total,
//       paymentMethod,
//       cashReceived: paymentMethod === 'cash' ? cashAmount : undefined,
//       change: paymentMethod === 'cash' ? change : undefined,
//       date: new Date(),
//       receiptNumber: generateReceiptNumber(),
//     }
//     setCurrentTransaction(transaction)
//     setShowReceipt(true)
//   }

//   const handleCloseReceipt = () => {
//     setShowReceipt(false)
//     setCurrentTransaction(null)
//     onClearCart()
//     setCashReceived('')
//   }

//   return (
//     <>
//       <Card className="flex h-full flex-col">
//         <CardHeader className="border-b pb-3">
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <ShoppingBag className="h-5 w-5 text-primary" />
//             Current Order
//             {items.length > 0 && (
//               <span className="ml-auto text-sm font-normal text-muted-foreground">
//                 {items.reduce((sum, item) => sum + item.quantity, 0)} items
//               </span>
//             )}
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="flex-1 overflow-auto p-0">
//           {items.length === 0 ? (
//             <div className="flex h-full flex-col items-center justify-center p-6 text-center">
//               <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/30" />
//               <p className="text-sm text-muted-foreground">No items in cart</p>
//               <p className="text-xs text-muted-foreground/70">Click products to add them</p>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {items.map((item) => (
//                 <div key={item.id} className="flex items-center gap-3 p-3">
//                   <div className="flex-1 min-w-0">
//                     <p className="truncate text-sm font-medium">{item.name}</p>
//                     <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       className="h-7 w-7"
//                       onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
//                     >
//                       <Minus className="h-3 w-3" />
//                     </Button>
//                     <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       className="h-7 w-7"
//                       onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
//                     >
//                       <Plus className="h-3 w-3" />
//                     </Button>
//                   </div>
//                   <div className="w-20 text-right">
//                     <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-7 w-7 text-destructive hover:text-destructive"
//                     onClick={() => onRemoveItem(item.id)}
//                   >
//                     <Trash2 className="h-3.5 w-3.5" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>

//         {items.length > 0 && (
//           <CardFooter className="flex flex-col gap-3 border-t p-4">
//             <div className="w-full space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Subtotal</span>
//                 <span>{formatCurrency(subtotal)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Tax (5%)</span>
//                 <span>{formatCurrency(tax)}</span>
//               </div>
//               <Separator className="my-2" />
//               <div className="flex justify-between text-base font-semibold">
//                 <span>Total</span>
//                 <span className="text-primary">{formatCurrency(total)}</span>
//               </div>
//             </div>

//             <div className="grid w-full grid-cols-2 gap-2">
//               <Button
//                 variant={paymentMethod === 'cash' ? 'default' : 'outline'}
//                 className="w-full"
//                 onClick={() => setPaymentMethod('cash')}
//               >
//                 <Banknote className="mr-2 h-4 w-4" />
//                 Cash
//               </Button>
//               <Button
//                 variant={paymentMethod === 'card' ? 'default' : 'outline'}
//                 className="w-full"
//                 onClick={() => setPaymentMethod('card')}
//               >
//                 <CreditCard className="mr-2 h-4 w-4" />
//                 Card
//               </Button>
//             </div>

//             {paymentMethod === 'cash' && (
//               <div className="w-full space-y-2">
//                 <Input
//                   type="number"
//                   placeholder="Cash received"
//                   value={cashReceived}
//                   onChange={(e) => setCashReceived(e.target.value)}
//                   className="text-right"
//                 />
//                 {cashAmount >= total && (
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Change</span>
//                     <span className="font-semibold text-primary">{formatCurrency(change)}</span>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="grid w-full grid-cols-2 gap-2">
//               <Button variant="outline" onClick={onClearCart}>
//                 Clear Cart
//               </Button>
//               <Button disabled={!canCheckout} onClick={handleCheckout}>
//                 Checkout
//               </Button>
//             </div>
//           </CardFooter>
//         )}
//       </Card>

//       {currentTransaction && (
//         <ReceiptModal
//           open={showReceipt}
//           onClose={handleCloseReceipt}
//           transaction={currentTransaction}
//         />
//       )}
//     </>
//   )
// }
'use client'

import { CartItem } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react'

interface CartPanelProps {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  onUpdateQuantity: (id: string | number, quantity: number) => void
  onRemoveItem: (id: string | number) => void
  onClearCart: () => void
  onCheckout: () => void
}

export function CartPanel({ 
  items, 
  subtotal, 
  tax, 
  total, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onCheckout 
}: CartPanelProps) {

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Current Order
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-0">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No items in cart</p>
              <p className="text-xs text-muted-foreground/70">Click products to add them</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {items.length > 0 && (
          <CardFooter className="flex flex-col gap-3 border-t p-4">
            <div className="w-full space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" className="w-full">
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
            </div>

            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" onClick={onClearCart}>
                Clear Cart
              </Button>
              <Button onClick={onCheckout}>
                Checkout
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  )
}
