// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { ShoppingCart, Package, BarChart3, Receipt, Settings, Store } from 'lucide-react'
// import { cn } from '@/lib/utils'

// const navItems = [
//   { href: '/', label: 'POS Terminal', icon: ShoppingCart },
//   { href: '/inventory', label: 'Inventory', icon: Package },
//   { href: '/analytics', label: 'Analytics', icon: BarChart3 },
//   { href: '/receipts', label: 'Receipts', icon: Receipt },
//   { href: '/settings', label: 'Settings', icon: Settings },
// ]

// export function AppSidebar() {
//   const pathname = usePathname()

//   return (
//     <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
//       <div className="flex h-full flex-col">
//         <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
//             <Store className="h-5 w-5 text-primary-foreground" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold">San Thit Wai</h1>
//             <p className="text-xs text-sidebar-foreground/70">POS System</p>
//           </div>
//         </div>

//         <nav className="flex-1 space-y-1 px-3 py-4">
//           {navItems.map((item) => {
//             const Icon = item.icon
//             const isActive = pathname === item.href
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
//                   isActive
//                     ? 'bg-sidebar-accent text-sidebar-accent-foreground'
//                     : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
//                 )}
//               >
//                 <Icon className="h-5 w-5" />
//                 {item.label}
//               </Link>
//             )
//           })}
//         </nav>

//         <div className="border-t border-sidebar-border p-4">
//           <p className="text-xs text-sidebar-foreground/60">
//             Version 1.0.0
//           </p>
//         </div>
//       </div>
//     </aside>
//   )
// }
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, BarChart3, Receipt, Settings, Store, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'POS Terminal', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/receipts', label: 'Receipts', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">San Thit Wai</h1>
            <p className="text-xs text-sidebar-foreground/70">POS System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
