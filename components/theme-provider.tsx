'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

function hexToHsl(hex: string): number {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const d = max - min

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return Math.round(h * 360)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Apply saved theme on mount
    const savedColor = localStorage.getItem('theme-color') || '#10b981'
    applyTheme(savedColor)
    setMounted(true)
  }, [])

  const applyTheme = (color: string) => {
    const hue = hexToHsl(color)
    const root = document.documentElement

    root.style.setProperty('--primary', `oklch(0.5 0.14 ${hue})`)
    root.style.setProperty('--secondary', `oklch(0.95 0.02 ${hue})`)
    root.style.setProperty('--accent', `oklch(0.45 0.12 ${hue})`)
    root.style.setProperty('--border', `oklch(0.9 0.02 ${hue})`)
    root.style.setProperty('--ring', `oklch(0.5 0.14 ${hue})`)
    root.style.setProperty('--sidebar', `oklch(0.22 0.04 ${hue})`)
    root.style.setProperty('--sidebar-primary', `oklch(0.5 0.14 ${hue})`)
    root.style.setProperty('--sidebar-accent', `oklch(0.32 0.05 ${hue})`)
    root.style.setProperty('--sidebar-border', `oklch(0.32 0.04 ${hue})`)
    root.style.setProperty('--sidebar-ring', `oklch(0.5 0.14 ${hue})`)
    root.style.setProperty('--chart-1', `oklch(0.5 0.14 ${hue})`)
    root.style.setProperty('--chart-2', `oklch(0.6 0.12 ${hue})`)
    root.style.setProperty('--chart-3', `oklch(0.4 0.1 ${hue})`)
    root.style.setProperty('--chart-4', `oklch(0.65 0.08 ${hue})`)
    root.style.setProperty('--chart-5', `oklch(0.35 0.08 ${hue})`)
  }

  // Don't render children until mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
