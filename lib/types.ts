export interface Product {
  id: string
  name: string
  price: number
  costPrice: number
  profitMargin: number
  category: string
  stock: number
  sku: string
  image?: string
  supplier?: string
  reorderLevel?: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card'
  cashReceived?: number
  change?: number
  date: Date
  receiptNumber: string
}

export interface SalesData {
  date: string
  sales: number
  transactions: number
}

export interface CategorySales {
  category: string
  sales: number
  percentage: number
}