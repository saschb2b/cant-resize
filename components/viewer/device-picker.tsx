'use client'

import { useState } from 'react'
import { Plus, Smartphone, Tablet, Monitor, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useViewer } from './viewer-provider'
import { getDevicesByCategory } from '@/lib/viewer/device-presets'
import type { DevicePreset } from '@/lib/viewer/types'

function DeviceButton({ device, onSelect }: { device: DevicePreset; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(device.id)}
      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent text-left transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
        {device.category === 'phone' && <Smartphone className="h-5 w-5 text-muted-foreground" />}
        {device.category === 'tablet' && <Tablet className="h-5 w-5 text-muted-foreground" />}
        {device.category === 'desktop' && <Monitor className="h-5 w-5 text-muted-foreground" />}
        {device.category === 'custom' && <Ruler className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-foreground">{device.name}</p>
        <p className="text-xs text-muted-foreground">
          {device.width} x {device.height}
        </p>
      </div>
    </button>
  )
}

function DeviceList({ devices, onSelect }: { devices: DevicePreset[]; onSelect: (id: string) => void }) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1 p-1">
        {devices.map((device) => (
          <DeviceButton key={device.id} device={device} onSelect={onSelect} />
        ))}
      </div>
    </ScrollArea>
  )
}

export function DevicePicker() {
  const { addViewport, addCustomViewport } = useViewer()
  const [open, setOpen] = useState(false)
  const [customWidth, setCustomWidth] = useState('1280')
  const [customHeight, setCustomHeight] = useState('720')
  const [customName, setCustomName] = useState('')

  const handleSelect = (deviceId: string) => {
    addViewport(deviceId)
    setOpen(false)
  }

  const handleAddCustom = () => {
    const width = parseInt(customWidth, 10)
    const height = parseInt(customHeight, 10)
    
    if (width > 0 && height > 0) {
      addCustomViewport(width, height, customName || undefined)
      setOpen(false)
    }
  }

  const phones = getDevicesByCategory('phone')
  const tablets = getDevicesByCategory('tablet')
  const desktops = getDevicesByCategory('desktop')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Device Viewport</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="phones" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phones" className="gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              Phones
            </TabsTrigger>
            <TabsTrigger value="tablets" className="gap-1.5">
              <Tablet className="h-3.5 w-3.5" />
              Tablets
            </TabsTrigger>
            <TabsTrigger value="desktops" className="gap-1.5">
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              Custom
            </TabsTrigger>
          </TabsList>
          <TabsContent value="phones" className="mt-4">
            <DeviceList devices={phones} onSelect={handleSelect} />
          </TabsContent>
          <TabsContent value="tablets" className="mt-4">
            <DeviceList devices={tablets} onSelect={handleSelect} />
          </TabsContent>
          <TabsContent value="desktops" className="mt-4">
            <DeviceList devices={desktops} onSelect={handleSelect} />
          </TabsContent>
          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Device Name (optional)</Label>
                <Input
                  id="custom-name"
                  placeholder="My Custom Device"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Width (px)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min={100}
                    max={5000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-height">Height (px)</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    min={100}
                    max={5000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddCustom} className="w-full">
                Add Custom Device
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
