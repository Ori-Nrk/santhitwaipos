'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Plus, Pencil, Trash2, Building2, AlertTriangle, ShoppingCart, Phone, Mail, MapPin } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string
  stock: number
  costPrice: number
  reorderLevel: number
  supplierId?: number
}

interface Supplier {
  id: string | number
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  paymentTerms?: string
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace('$', '')
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<Partial<Supplier>>({})
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('[v0] Fetching suppliers and products...')
      const [suppliersRes, productsRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/products'),
      ])

      if (!suppliersRes.ok || !productsRes.ok) {
        throw new Error('Failed to load data')
      }

      const suppliersData = await suppliersRes.json()
      const productsData = await productsRes.json()
      
      console.log('[v0] Loaded:', suppliersData.length, 'suppliers and', productsData.length, 'products')
      setSuppliers(suppliersData || [])
      setProducts(productsData || [])
      
      if (suppliersData.length > 0) {
        setSelectedSupplierId(suppliersData[0].id)
      }
    } catch (error) {
      console.error('[v0] Error fetching data:', error)
      alert('Error loading data: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getSupplierProducts = (supplierId: string | number) => {
    return products.filter((p) => p.supplierId === parseInt(String(supplierId)))
  }

  const getLowStockItems = (supplierId: string | number) => {
    return getSupplierProducts(supplierId).filter((p) => p.stock <= p.reorderLevel)
  }

  const calculateReorderCost = (items: Product[]) => {
    return items.reduce((sum, item) => {
      const reorderQuantity = Math.max(0, item.reorderLevel * 2 - item.stock)
      return sum + reorderQuantity * item.costPrice
    }, 0)
  }

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId)
  const supplierProducts = selectedSupplier ? getSupplierProducts(selectedSupplier.id) : []
  const lowStockItems = selectedSupplier ? getLowStockItems(selectedSupplier.id) : []
  const reorderCost = calculateReorderCost(lowStockItems)

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.includes(searchQuery)
  )

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      paymentTerms: '',
    })
    setEditingSupplier(null)
    setShowAddDialog(true)
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setFormData(supplier)
    setEditingSupplier(supplier)
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please enter supplier name')
      return
    }

    try {
      if (editingSupplier) {
        console.log('[v0] Updating supplier:', editingSupplier.id)
        const response = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.details || data?.error || 'Failed to update supplier')
        }

        setSuppliers((prev) => prev.map((s) => (s.id === editingSupplier.id ? data : s)))
        alert('Supplier updated successfully!')
      } else {
        console.log('[v0] Creating new supplier')
        const response = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.details || data?.error || 'Failed to create supplier')
        }

        setSuppliers((prev) => [...prev, data])
        setSelectedSupplierId(data.id)
        alert('Supplier added successfully!')
      }
      setShowAddDialog(false)
      setFormData({})
    } catch (error) {
      console.error('[v0] Error saving supplier:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      console.log('[v0] Deleting supplier:', id)
      const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Failed to delete supplier')
      }

      setSuppliers((prev) => prev.filter((s) => s.id !== id))
      if (selectedSupplierId === id) {
        setSelectedSupplierId(suppliers.length > 1 ? suppliers[0].id : null)
      }
      alert('Supplier deleted successfully!')
    } catch (error) {
      console.error('[v0] Error deleting supplier:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suppliers Management</h1>
            <p className="text-sm text-muted-foreground">Manage your suppliers and view reorder information</p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading suppliers...</CardContent>
          </Card>
        ) : suppliers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No suppliers yet. Click "Add Supplier" to create one.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Suppliers List - Left Sidebar */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-base">Suppliers List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredSuppliers.map((supplier) => {
                    const lowStockCount = getLowStockItems(supplier.id).length
                    const isSelected = selectedSupplierId === supplier.id
                    return (
                      <button
                        key={supplier.id}
                        onClick={() => setSelectedSupplierId(supplier.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-medium truncate text-sm">{supplier.name}</span>
                        {lowStockCount > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {lowStockCount}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Details - Right Content */}
            <div className="lg:col-span-3 space-y-4">
              {selectedSupplier ? (
                <>
                  {/* Supplier Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {selectedSupplier.name}
                          </CardTitle>
                          <div className="space-y-1 mt-3 text-sm">
                            {selectedSupplier.contactPerson && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Contact:</span> {selectedSupplier.contactPerson}
                              </p>
                            )}
                            {selectedSupplier.phone && (
                              <p className="text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {selectedSupplier.phone}
                              </p>
                            )}
                            {selectedSupplier.email && (
                              <p className="text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {selectedSupplier.email}
                              </p>
                            )}
                            {(selectedSupplier.address || selectedSupplier.city) && (
                              <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {[selectedSupplier.address, selectedSupplier.city, selectedSupplier.country].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {selectedSupplier.paymentTerms && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Payment Terms:</span> {selectedSupplier.paymentTerms}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(selectedSupplier)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(selectedSupplier.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Low Stock Alert */}
                  {lowStockItems.length > 0 && (
                    <Alert className="border-destructive bg-destructive/5">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertTitle className="text-destructive">Low Stock Alert</AlertTitle>
                      <AlertDescription>
                        {lowStockItems.length} item(s) need to be reordered from this supplier. Total estimated reorder cost: <span className="font-bold text-destructive">{formatCurrency(reorderCost)} Ks</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Products Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Products ({supplierProducts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {supplierProducts.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">No products from this supplier</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Current Stock</TableHead>
                                <TableHead className="text-right">Reorder Level</TableHead>
                                <TableHead className="text-right">Cost Price</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {supplierProducts.map((product) => {
                                const isLowStock = product.stock <= product.reorderLevel
                                const reorderQty = Math.max(0, product.reorderLevel * 2 - product.stock)
                                const reorderCostPerItem = reorderQty * product.costPrice

                                return (
                                  <TableRow key={product.id} className={isLowStock ? 'bg-destructive/5' : ''}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                    <TableCell className="text-right font-semibold">{product.stock}</TableCell>
                                    <TableCell className="text-right">{product.reorderLevel}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.costPrice)} Ks</TableCell>
                                    <TableCell className="text-center">
                                      {isLowStock ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                                          <span className="text-xs text-destructive font-semibold">Reorder: {reorderQty}</span>
                                          <span className="text-xs text-muted-foreground">{formatCurrency(reorderCostPerItem)} Ks</span>
                                        </div>
                                      ) : (
                                        <Badge variant="outline">In Stock</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reorder Summary */}
                  {lowStockItems.length > 0 && (
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Reorder Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Items to Reorder</p>
                            <p className="text-2xl font-bold text-primary">{lowStockItems.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Units Needed</p>
                            <p className="text-2xl font-bold text-primary">
                              {lowStockItems.reduce((sum, item) => sum + Math.max(0, item.reorderLevel * 2 - item.stock), 0)}
                            </p>
                          </div>
                          <div className="border-l pl-4">
                            <p className="text-sm text-muted-foreground">Total Reorder Cost</p>
                            <p className="text-2xl font-bold text-destructive">{formatCurrency(reorderCost)} Ks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">Select a supplier to view details</CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Supplier Name *</FieldLabel>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter supplier name"
              />
            </Field>

            <Field>
              <FieldLabel>Contact Person</FieldLabel>
              <Input
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Enter contact person name"
              />
            </Field>

            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </Field>

            <Field>
              <FieldLabel>Address</FieldLabel>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </Field>

            <Field>
              <FieldLabel>City</FieldLabel>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
              />
            </Field>

            <Field>
              <FieldLabel>Country</FieldLabel>
              <Input
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country"
              />
            </Field>

            <Field>
              <FieldLabel>Payment Terms</FieldLabel>
              <Input
                value={formData.paymentTerms || ''}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="e.g., Net 30, COD, Prepaid"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
