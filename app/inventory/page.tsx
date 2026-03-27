'use client'

import { useState, useMemo, useEffect } from 'react'
import { Product } from '@/lib/types'
import { categories, formatCurrency, calculateSellingPrice, calculateProfitAmount, calculateProfitMargin } from '@/lib/data'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Package, Search, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'

const PROFIT_PRESETS = [20, 30, 50, 75, 100]

interface Supplier {
  id: number
  name: string
}

interface ProductFormData extends Partial<Product> {
  supplierId?: number | string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('[v0] Fetching products and suppliers...')
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/suppliers'),
      ])
      
      if (!productsRes.ok || !suppliersRes.ok) {
        throw new Error('Failed to load data')
      }
      
      const productsData = await productsRes.json()
      const suppliersData = await suppliersRes.json()
      console.log('[v0] Loaded:', productsData.length, 'products and', suppliersData.length, 'suppliers')
      
      setProducts(productsData || [])
      setSuppliers(suppliersData || [])
    } catch (error) {
      console.error('[v0] Failed to fetch data:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert('Error loading data: ' + errorMsg)
      setProducts([])
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, categoryFilter, searchQuery])

  const lowStockProducts = products.filter(
    (p) => p.reorderLevel && p.stock <= p.reorderLevel
  )

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0)
  const totalProfit = totalValue - totalCost

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      costPrice: 0,
      profitMargin: 30,
      price: 0,
      category: 'Groceries',
      stock: 0,
      sku: '',
      supplierId: '',
      reorderLevel: 10,
    })
    setEditingProduct(null)
    setShowAddDialog(true)
  }

  const handleOpenEdit = (product: Product) => {
    setFormData(product)
    setEditingProduct(product)
    setShowAddDialog(true)
  }

  const handleApplyProfitMargin = (margin: number) => {
    if (!formData.costPrice || formData.costPrice === 0) return
    const newPrice = calculateSellingPrice(formData.costPrice, margin)
    setFormData({
      ...formData,
      profitMargin: margin,
      price: newPrice,
    })
  }

  const handleProfitMarginChange = (marginPercent: number) => {
    if (!formData.costPrice || formData.costPrice === 0) return
    const newPrice = calculateSellingPrice(formData.costPrice, marginPercent)
    setFormData({
      ...formData,
      profitMargin: marginPercent,
      price: newPrice,
    })
  }

  const handleSellingPriceChange = (newPrice: number) => {
    setFormData({ ...formData, price: newPrice })
    if (formData.costPrice && formData.costPrice > 0) {
      const calculatedMargin = calculateProfitMargin(newPrice, formData.costPrice)
      setFormData((prev) => ({ ...prev, profitMargin: calculatedMargin }))
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.costPrice || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    const profitMargin = calculateProfitMargin(formData.price, formData.costPrice)
    const selectedSupplier = suppliers.find((s) => s.id === parseInt(String(formData.supplierId)))

    try {
      if (editingProduct) {
        console.log('[v0] Updating product:', editingProduct.id, 'with supplierId:', formData.supplierId)
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            costPrice: formData.costPrice,
            profitMargin,
            price: formData.price,
            category: formData.category,
            stock: formData.stock,
            sku: formData.sku,
            supplier: selectedSupplier?.name || null,
            supplierId: formData.supplierId || null,
            reorderLevel: formData.reorderLevel,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.details || data?.error || 'Failed to update')
        }
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data : p)))
        alert('Product updated successfully!')
      } else {
        console.log('[v0] Creating product with supplierId:', formData.supplierId)
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            costPrice: formData.costPrice,
            profitMargin,
            price: formData.price,
            category: formData.category,
            stock: formData.stock,
            sku: formData.sku,
            supplier: selectedSupplier?.name || null,
            supplierId: formData.supplierId || null,
            reorderLevel: formData.reorderLevel,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.details || data?.error || 'Failed to create')
        }
        setProducts((prev) => [...prev, data])
        alert('Product added successfully!')
      }
      setShowAddDialog(false)
      setFormData({})
    } catch (error) {
      console.error('[v0] Save error:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      console.log('[v0] Deleting product:', id)
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (!response.ok) {
        const errorMsg = data?.details || data?.error || 'Failed to delete product'
        throw new Error(errorMsg)
      }
      
      setProducts((prev) => prev.filter((p) => p.id !== id))
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('[v0] Delete error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert('Cannot delete product:\n\n' + message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Manage your product stock, costs, and profit margins</p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{lowStockProducts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(totalCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalProfit)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Products</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-center">Margin %</TableHead>
                      <TableHead className="text-right">Profit/Unit</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const profitAmount = calculateProfitAmount(product.price, product.costPrice)
                        return (
                    <TableRow key={product.id}>
                            <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{formatCurrency(product.costPrice)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(product.price)}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-primary/20 text-primary">{product.profitMargin}%</Badge>
                            </TableCell>
                            <TableCell className="text-right text-primary font-semibold">{formatCurrency(profitAmount)}</TableCell>
                            <TableCell className="text-right">{product.stock}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Product Name *</FieldLabel>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>SKU</FieldLabel>
                <Input
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={formData.category || 'Groceries'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel>Supplier</FieldLabel>
              <Select
                value={String(formData.supplierId || '')}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3">Cost & Profit</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Cost Price (Ks) *</FieldLabel>
                  <Input
                    type="number"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Selling Price (Ks) *</FieldLabel>
                  <Input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleSellingPriceChange(parseFloat(e.target.value) || 0)}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <FieldLabel className="block mb-3 text-sm">Quick Profit Margin Presets</FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {PROFIT_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      variant={formData.profitMargin === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleApplyProfitMargin(preset)}
                    >
                      +{preset}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Field>
                  <FieldLabel>Custom Profit Margin (%)</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.profitMargin || ''}
                    onChange={(e) => handleProfitMarginChange(parseFloat(e.target.value) || 0)}
                    placeholder="Enter custom profit margin percentage"
                  />
                </Field>
              </div>

              {formData.costPrice && formData.price ? (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Calculated Profit Margin:</span>
                    <span className="font-bold text-primary">{formData.profitMargin}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Profit per Unit:</span>
                    <span className="font-bold">{formatCurrency(calculateProfitAmount(formData.price, formData.costPrice))}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Stock</FieldLabel>
                <Input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </Field>
              <Field>
                <FieldLabel>Reorder Level</FieldLabel>
                <Input
                  type="number"
                  value={formData.reorderLevel || ''}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 10 })}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
