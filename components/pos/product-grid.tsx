'use client'

import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20"
          onClick={() => onAddToCart(product)}
        >
          <div className="flex h-24 items-center justify-center bg-secondary/50">
            <span className="text-3xl text-muted-foreground/50">
              {product.category === 'Groceries' && '🍚'}
              {product.category === 'Beverages' && '🥤'}
              {product.category === 'Personal Care' && '🧴'}
              {product.category === 'Household' && '🏠'}
              {product.category === 'Snacks' && '🍫'}
            </span>
          </div>
          <div className="p-3">
            <h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-semibold text-primary">{formatCurrency(product.price)}</span>
              <Badge variant={product.stock > 10 ? 'secondary' : 'destructive'} className="text-xs">
                {product.stock} left
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-center rounded-md bg-primary/10 py-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              <Plus className="mr-1 h-3 w-3" />
              Add to Cart
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
