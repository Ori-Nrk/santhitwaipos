'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Users } from 'lucide-react'

interface Customer {
  id: number
  name: string
  phone?: string
}


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>({
  totalRevenue: 0,
  topCustomersRevenue: 0,
  customers: []
})
  const [showDialog, setShowDialog] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchCustomers()
    fetch('/api/customers/analytics', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setAnalytics(data))
    .catch(() => alert('Failed to load analytics'))
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', {
        credentials: 'include',
      })

      const data = await res.json()
      setCustomers(data)
    } catch {
      alert('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!name.trim()) {
      alert('Customer name required')
      return
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
      credentials: 'include',
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to create')
      return
    }

    setCustomers((prev) => [...prev, data])
    setName('')
    setPhone('')
    setShowDialog(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return

    await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-muted-foreground text-sm">
              Manage your customer list and track loyalty
            </p>
          </div>

          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        
<div className="grid grid-cols-3 gap-4 mb-6">
  <Card>
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Total Sales</p>
      <p className="text-xl font-bold">
        {analytics.totalRevenue.toLocaleString()} Ks
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Top Customers Sales</p>
      <p className="text-xl font-bold text-primary">
        {analytics.topCustomersRevenue.toLocaleString()} Ks
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Contribution</p>
      <p className="text-xl font-bold">
        {analytics.totalRevenue > 0
          ? Math.round(
              (analytics.topCustomersRevenue / analytics.totalRevenue) * 100
            )
          : 0}
        %
      </p>
    </CardContent>
  </Card>
</div>
<Card>
  <CardHeader>
    <CardTitle>Top Customers</CardTitle>
  </CardHeader>

  <CardContent>
    {analytics.customers.slice(0, 5).map((c: any, index: number) => (
      <div
        key={c.id}
        className="flex justify-between items-center py-2 border-b"
      >
        <div>
          <p className="font-medium">
            #{index + 1} {c.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {c.total_orders} orders
          </p>
        </div>

        <p className="font-semibold">
          {Number(c.total_spent).toLocaleString()} Ks
        </p>
      </div>
    ))}
  </CardContent>
</Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer List ({customers.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center py-6 text-muted-foreground">
                Loading...
              </p>
            ) : customers.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No customers yet
              </p>
            ) : (
              <div className="space-y-2">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.phone && (
                        <p className="text-sm text-muted-foreground">
                          {c.phone}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ADD CUSTOMER MODAL */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>

            <Button onClick={handleAdd}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}