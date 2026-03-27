import { Product, Transaction, SalesData, CategorySales } from './types'

export const products: Product[] = [
  { id: '1', name: 'Rice (5kg)', costPrice: 10000, profitMargin: 50, price: 15000, category: 'Groceries', stock: 50, sku: 'GRC001', reorderLevel: 10, supplier: 'Golden Mill' },
  { id: '2', name: 'Cooking Oil (1L)', costPrice: 3500, profitMargin: 57, price: 5500, category: 'Groceries', stock: 35, sku: 'GRC002', reorderLevel: 15, supplier: 'Sun Oil Co.' },
  { id: '3', name: 'Sugar (1kg)', costPrice: 1800, profitMargin: 56, price: 2800, category: 'Groceries', stock: 45, sku: 'GRC003', reorderLevel: 20, supplier: 'Sweet Mills' },
  { id: '4', name: 'Salt (500g)', costPrice: 400, profitMargin: 100, price: 800, category: 'Groceries', stock: 60, sku: 'GRC004', reorderLevel: 25, supplier: 'Sea Salt Ltd.' },
  { id: '5', name: 'Instant Noodles', costPrice: 250, profitMargin: 100, price: 500, category: 'Groceries', stock: 100, sku: 'GRC005', reorderLevel: 30, supplier: 'Noodle House' },
  { id: '6', name: 'Green Tea (25 bags)', costPrice: 2000, profitMargin: 75, price: 3500, category: 'Beverages', stock: 40, sku: 'BEV001', reorderLevel: 15, supplier: 'Tea Garden' },
  { id: '7', name: 'Coffee (200g)', costPrice: 5000, profitMargin: 70, price: 8500, category: 'Beverages', stock: 25, sku: 'BEV002', reorderLevel: 10, supplier: 'Java Beans' },
  { id: '8', name: 'Mineral Water (1.5L)', costPrice: 400, profitMargin: 100, price: 800, category: 'Beverages', stock: 80, sku: 'BEV003', reorderLevel: 30, supplier: 'Pure Springs' },
  { id: '9', name: 'Orange Juice (1L)', costPrice: 2500, profitMargin: 80, price: 4500, category: 'Beverages', stock: 30, sku: 'BEV004', reorderLevel: 12, supplier: 'Citrus Fresh' },
  { id: '10', name: 'Energy Drink', costPrice: 1250, profitMargin: 100, price: 2500, category: 'Beverages', stock: 45, sku: 'BEV005', reorderLevel: 20, supplier: 'Power Drinks' },
  { id: '11', name: 'Toothpaste', costPrice: 2000, profitMargin: 60, price: 3200, category: 'Personal Care', stock: 35, sku: 'PC001', reorderLevel: 15, supplier: 'Clean Care' },
  { id: '12', name: 'Soap Bar (3-pack)', costPrice: 1500, profitMargin: 67, price: 2500, category: 'Personal Care', stock: 40, sku: 'PC002', reorderLevel: 15, supplier: 'Fresh Soap Co.' },
  { id: '13', name: 'Shampoo (250ml)', costPrice: 3000, profitMargin: 83, price: 5500, category: 'Personal Care', stock: 28, sku: 'PC003', reorderLevel: 10, supplier: 'Hair Care Plus' },
  { id: '14', name: 'Tissue Paper (6 rolls)', costPrice: 2500, profitMargin: 80, price: 4500, category: 'Household', stock: 50, sku: 'HH001', reorderLevel: 20, supplier: 'Soft Touch' },
  { id: '15', name: 'Dish Soap (500ml)', costPrice: 1600, profitMargin: 75, price: 2800, category: 'Household', stock: 38, sku: 'HH002', reorderLevel: 15, supplier: 'Clean Dishes' },
  { id: '16', name: 'Laundry Detergent (1kg)', costPrice: 4000, profitMargin: 63, price: 6500, category: 'Household', stock: 32, sku: 'HH003', reorderLevel: 12, supplier: 'Wash Well' },
  { id: '17', name: 'Chocolate Bar', costPrice: 800, profitMargin: 88, price: 1500, category: 'Snacks', stock: 75, sku: 'SN001', reorderLevel: 25, supplier: 'Sweet Treats' },
  { id: '18', name: 'Potato Chips', costPrice: 1000, profitMargin: 100, price: 2000, category: 'Snacks', stock: 60, sku: 'SN002', reorderLevel: 20, supplier: 'Crispy Foods' },
  { id: '19', name: 'Biscuits (200g)', costPrice: 1000, profitMargin: 80, price: 1800, category: 'Snacks', stock: 55, sku: 'SN003', reorderLevel: 20, supplier: 'Bake House' },
  { id: '20', name: 'Mixed Nuts (250g)', costPrice: 4000, profitMargin: 88, price: 7500, category: 'Snacks', stock: 22, sku: 'SN004', reorderLevel: 10, supplier: 'Nut Farm' },
]

export const categories: string[] = []

export const sampleTransactions: Transaction[] = [
  {
    id: 't1',
    items: [
      { ...products[0], quantity: 2 },
      { ...products[5], quantity: 1 },
    ],
    subtotal: 33500,
    tax: 1675,
    total: 35175,
    paymentMethod: 'cash',
    cashReceived: 40000,
    change: 4825,
    date: new Date('2026-03-19T09:30:00'),
    receiptNumber: 'STW-20260319-001',
  },
  {
    id: 't2',
    items: [
      { ...products[6], quantity: 1 },
      { ...products[10], quantity: 2 },
      { ...products[17], quantity: 3 },
    ],
    subtotal: 20900,
    tax: 1045,
    total: 21945,
    paymentMethod: 'card',
    date: new Date('2026-03-19T10:15:00'),
    receiptNumber: 'STW-20260319-002',
  },
  {
    id: 't3',
    items: [
      { ...products[13], quantity: 2 },
      { ...products[14], quantity: 1 },
      { ...products[4], quantity: 5 },
    ],
    subtotal: 14300,
    tax: 715,
    total: 15015,
    paymentMethod: 'cash',
    cashReceived: 20000,
    change: 4985,
    date: new Date('2026-03-19T11:45:00'),
    receiptNumber: 'STW-20260319-003',
  },
]

export const weeklySalesData: SalesData[] = []

export const categorySalesData: CategorySales[] = []

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} Ks`
}

export function calculateSellingPrice(costPrice: number, profitMargin: number): number {
  return Math.round(costPrice * (1 + profitMargin / 100))
}

export function calculateProfitAmount(price: number, costPrice: number): number {
  return price - costPrice
}

export function calculateProfitMargin(price: number, costPrice: number): number {
  if (costPrice === 0) return 0
  return Math.round(((price - costPrice) / costPrice) * 100)
}

export function generateReceiptNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `STW-${dateStr}-${random}`
}
