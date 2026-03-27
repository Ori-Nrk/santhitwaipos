'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Store, Receipt, Bell, Palette, Save } from 'lucide-react'

// Helper function to convert hex color to HSL
function hexToHsl(hex: string): string {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

interface Settings {
  storeInfo: {
    name: string
    address: string
    phone: string
    taxRate: number
  }
  receiptSettings: {
    showLogo: boolean
    showAddress: boolean
    showPhone: boolean
    footerMessage: string
  }
  notifications: {
    lowStockAlerts: boolean
    dailySummary: boolean
    newSaleAlert: boolean
  }
  appearance: {
    theme: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeInfo: {
      name: 'San Thit Wai',
      address: '83, Taung Yoe Road, Nann Oo Myo Thit, Sagaing',
      phone: '09797966033, 09442026209',
      taxRate: 5,
    },
    receiptSettings: {
      showLogo: true,
      showAddress: true,
      showPhone: true,
      footerMessage: 'Thank you for shopping with us!',
    },
    notifications: {
      lowStockAlerts: true,
      dailySummary: false,
      newSaleAlert: false,
    },
    appearance: {
      theme: 'green',
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('green')
  const [themeColor, setThemeColor] = useState('#10b981') // Default green

  // Update theme in real-time
  useEffect(() => {
    const root = document.documentElement
    
    // Convert hex to HSL to get the hue
    const hsl = hexToHsl(themeColor)
    const [hueStr] = hsl.split(' ')
    const hue = parseInt(hueStr)
    
    // Set all color variables using oklch format with the new hue
    // Light mode
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
    
    // Dark mode
    document.documentElement.classList.add('updating-theme')
    setTimeout(() => {
      document.documentElement.classList.remove('updating-theme')
    }, 0)
    
    console.log('[v0] Theme updated to hue:', hue, 'from color:', themeColor)
  }, [themeColor])

  // Save theme color to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme-color', themeColor)
    localStorage.setItem('selected-theme', selectedTheme)
  }, [themeColor, selectedTheme])

  // Load settings from localStorage on mount, then try database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from localStorage first for immediate visual consistency
        const savedColor = localStorage.getItem('theme-color')
        const savedTheme = localStorage.getItem('selected-theme')
        
        if (savedColor) {
          setThemeColor(savedColor)
          setSelectedTheme(savedTheme || 'green')
          console.log('[v0] Theme loaded from localStorage:', savedColor)
        }

        // Then fetch from database
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          setSelectedTheme(data.appearance.theme)
          
          // Map theme names to hex colors
          const themeMap: { [key: string]: string } = {
            green: '#10b981',
            blue: '#3b82f6',
            purple: '#a855f7',
            orange: '#f97316',
            red: '#ef4444',
            custom: localStorage.getItem('theme-color') || '#10b981',
          }
          const dbColor = themeMap[data.appearance.theme] || localStorage.getItem('theme-color') || '#10b981'
          setThemeColor(dbColor)
          localStorage.setItem('theme-color', dbColor)
          console.log('[v0] Settings loaded from database:', data)
        }
      } catch (error) {
        console.error('[v0] Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Map hex color back to theme name, or use 'custom' for custom colors
      const themeMap: { [key: string]: string } = {
        '#10b981': 'green',
        '#3b82f6': 'blue',
        '#a855f7': 'purple',
        '#f97316': 'orange',
        '#ef4444': 'red',
      }
      const themeName = themeMap[themeColor.toLowerCase()] || 'custom'
      
      const updatedSettings = {
        ...settings,
        appearance: { theme: themeName },
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(updatedSettings)
        console.log('[Settings] Saved successfully with color:', themeColor)
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('[Settings] Error saving:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="ml-64 p-6">
          <p className="text-muted-foreground">Loading settings...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Store Information
              </CardTitle>
              <CardDescription>Update your store details</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Store Name</FieldLabel>
                  <Input
                    value={settings.storeInfo.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storeInfo: { ...settings.storeInfo, name: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    value={settings.storeInfo.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storeInfo: { ...settings.storeInfo, address: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    value={settings.storeInfo.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storeInfo: { ...settings.storeInfo, phone: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Tax Rate (%)</FieldLabel>
                  <Input
                    type="number"
                    value={settings.storeInfo.taxRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storeInfo: {
                          ...settings.storeInfo,
                          taxRate: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Receipt Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Receipt Settings
              </CardTitle>
              <CardDescription>Customize your receipt layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Show Logo</FieldLabel>
                  <p className="text-xs text-muted-foreground">Display store logo on receipts</p>
                </div>
                <Switch
                  checked={settings.receiptSettings.showLogo}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      receiptSettings: { ...settings.receiptSettings, showLogo: checked },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Show Address</FieldLabel>
                  <p className="text-xs text-muted-foreground">Display store address on receipts</p>
                </div>
                <Switch
                  checked={settings.receiptSettings.showAddress}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      receiptSettings: { ...settings.receiptSettings, showAddress: checked },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Show Phone</FieldLabel>
                  <p className="text-xs text-muted-foreground">Display phone number on receipts</p>
                </div>
                <Switch
                  checked={settings.receiptSettings.showPhone}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      receiptSettings: { ...settings.receiptSettings, showPhone: checked },
                    })
                  }
                />
              </div>
              <Separator />
              <Field>
                <FieldLabel>Footer Message</FieldLabel>
                <Input
                  value={settings.receiptSettings.footerMessage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      receiptSettings: {
                        ...settings.receiptSettings,
                        footerMessage: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Low Stock Alerts</FieldLabel>
                  <p className="text-xs text-muted-foreground">Get notified when products are running low</p>
                </div>
                <Switch
                  checked={settings.notifications.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, lowStockAlerts: checked },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Daily Summary</FieldLabel>
                  <p className="text-xs text-muted-foreground">Receive daily sales summary reports</p>
                </div>
                <Switch
                  checked={settings.notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, dailySummary: checked },
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>New Sale Alert</FieldLabel>
                  <p className="text-xs text-muted-foreground">Get notified for each new sale</p>
                </div>
                <Switch
                  checked={settings.notifications.newSaleAlert}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, newSaleAlert: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look of your POS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Theme Color</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-12 w-20 cursor-pointer rounded-lg border border-input"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#10b981"
                      className="w-32"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Select a color using the color wheel or enter a hex code
                  </p>
                </Field>
              </FieldGroup>

              <Separator />

              <FieldLabel className="mb-3 block">Preset Colors</FieldLabel>
              <div className="flex gap-3">
                {[
                  { name: 'Green', hex: '#10b981' },
                  { name: 'Blue', hex: '#3b82f6' },
                  { name: 'Purple', hex: '#a855f7' },
                  { name: 'Orange', hex: '#f97316' },
                  { name: 'Red', hex: '#ef4444' },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    className={`relative h-10 w-10 rounded-lg transition-transform hover:scale-110 ${
                      themeColor.toLowerCase() === preset.hex.toLowerCase()
                        ? 'ring-2 ring-offset-2 ring-foreground'
                        : ''
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    onClick={() => setThemeColor(preset.hex)}
                    title={preset.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </main>
    </div>
  )
}
