
'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react'

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']

interface Transaction {
  id: string
  receiptNumber: string
  date: string
  total: number
  paymentMethod: string
  items: { id: string; name: string; quantity: number; price: number }[]
}

interface ProductSales {
  productId: string
  name: string
  quantity: number
  revenue: number
}

interface DailyData {
  date: string
  sales: number
  transactions: number
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklySalesData, setWeeklySalesData] = useState<DailyData[]>([])
  const [topProducts, setTopProducts] = useState<ProductSales[]>([])
  const [categorySalesData, setCategorySalesData] = useState<any[]>([])
  const [weekOverWeekMetrics, setWeekOverWeekMetrics] = useState({
    revenuePct: 0,
    transactionsPct: 0,
    avgTransactionPct: 0,
    customersPct: 0,
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions', {
  credentials: 'include'
})
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data)
      calculateAnalytics(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (data: Transaction[]) => {
    // Calculate this week and last week metrics
    const today = new Date()
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1)

    let thisWeekSales = 0
    let thisWeekTransactions = 0
    let lastWeekSales = 0
    let lastWeekTransactions = 0

    // Calculate daily sales data for the last 7 days
    const dailyMap: { [key: string]: DailyData } = {}

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap[dateStr] = { date: dateStr, sales: 0, transactions: 0 }
    }

    // Calculate product sales and category breakdown
    const productMap: { [key: string]: ProductSales } = {}
    const categoryMap: { [key: string]: number } = {}

    data.forEach((tx) => {
      const txDate = new Date(tx.date)
      const dateStr = txDate.toLocaleDateString('en-US', { weekday: 'short' })

      // Categorize into this week or last week
      if (txDate >= thisWeekStart) {
        thisWeekSales += tx.total
        thisWeekTransactions += 1
      } else if (txDate >= lastWeekStart && txDate <= lastWeekEnd) {
        lastWeekSales += tx.total
        lastWeekTransactions += 1
      }

      if (dailyMap[dateStr]) {
        dailyMap[dateStr].sales += tx.total
        dailyMap[dateStr].transactions += 1
      }

      tx.items?.forEach((item) => {
        if (!productMap[item.id]) {
          productMap[item.id] = {
            productId: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
          }
        }
        productMap[item.id].quantity += item.quantity
        productMap[item.id].revenue += item.price * item.quantity
      })
    })

    // Calculate week-over-week percentages
    const revenuePct = lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100 : 0
    const transactionsPct = lastWeekTransactions > 0 ? ((thisWeekTransactions - lastWeekTransactions) / lastWeekTransactions) * 100 : 0
    const thisWeekAvg = thisWeekTransactions > 0 ? thisWeekSales / thisWeekTransactions : 0
    const lastWeekAvg = lastWeekTransactions > 0 ? lastWeekSales / lastWeekTransactions : 0
    const avgTransactionPct = lastWeekAvg > 0 ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 : 0

    setWeekOverWeekMetrics({
      revenuePct: isNaN(revenuePct) ? 0 : revenuePct,
      transactionsPct: isNaN(transactionsPct) ? 0 : transactionsPct,
      avgTransactionPct: isNaN(avgTransactionPct) ? 0 : avgTransactionPct,
      customersPct: 0, // Customers would need additional logic
    })

    const sortedProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    setWeeklySalesData(Object.values(dailyMap))
    setTopProducts(sortedProducts)
  }

  const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0)
  const totalTransactions = transactions.length
  const avgTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0
  const dailyAvgCustomers = totalTransactions > 0 ? Math.round(totalTransactions / 7) : 0

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your sales performance and insights</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalSales)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={weekOverWeekMetrics.revenuePct >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {weekOverWeekMetrics.revenuePct >= 0 ? '+' : ''}{weekOverWeekMetrics.revenuePct.toFixed(1)}%
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={weekOverWeekMetrics.transactionsPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {weekOverWeekMetrics.transactionsPct >= 0 ? '+' : ''}{weekOverWeekMetrics.transactionsPct.toFixed(1)}%
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(avgTransaction)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={weekOverWeekMetrics.avgTransactionPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {weekOverWeekMetrics.avgTransactionPct >= 0 ? '+' : ''}{weekOverWeekMetrics.avgTransactionPct.toFixed(1)}%
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Avg. Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dailyAvgCustomers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={weekOverWeekMetrics.customersPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {weekOverWeekMetrics.customersPct >= 0 ? '+' : ''}{weekOverWeekMetrics.customersPct.toFixed(1)}%
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {weeklySalesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: '#000000',
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Sales']}
                        labelStyle={{ color: '#000000' }}
                        itemStyle={{ color: '#000000' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">{formatCurrency(product.revenue)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No product sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {weeklySalesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">{transaction.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleString()} - {transaction.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(transaction.total)}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transactions available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
