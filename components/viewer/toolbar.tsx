'use client'

import { useState, useCallback } from 'react'
import {
  LayoutGrid,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCw,
  ExternalLink,
  Link2,
  MousePointer2,
  Hand,
  Navigation,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useViewer } from './viewer-provider'
import { DevicePicker } from './device-picker'

export function Toolbar() {
  const { state, setUrl, setLayoutMode, setCanvasTransform, setSyncSettings } = useViewer()
  const [urlInput, setUrlInput] = useState(state.url)

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      let url = urlInput.trim()
      
      // Add protocol if missing
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
        setUrlInput(url)
      }
      
      setUrl(url)
    },
    [urlInput, setUrl]
  )

  const handleZoom = useCallback(
    (delta: number) => {
      const newScale = Math.min(2, Math.max(0.1, state.canvasTransform.scale + delta))
      setCanvasTransform({ ...state.canvasTransform, scale: newScale })
    },
    [state.canvasTransform, setCanvasTransform]
  )

  const handleZoomSlider = useCallback(
    (value: number[]) => {
      setCanvasTransform({ ...state.canvasTransform, scale: value[0] })
    },
    [state.canvasTransform, setCanvasTransform]
  )

  const handleFitToContent = useCallback(() => {
    // Calculate bounds of all viewports
    if (state.viewports.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    state.viewports.forEach((v) => {
      minX = Math.min(minX, v.x)
      minY = Math.min(minY, v.y)
      maxX = Math.max(maxX, v.x + v.width)
      maxY = Math.max(maxY, v.y + v.height)
    })

    // This is a simplified fit - in reality we'd need canvas dimensions
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const scale = Math.min(0.8, 800 / Math.max(contentWidth, contentHeight))
    
    setCanvasTransform({
      x: -minX * scale + 50,
      y: -minY * scale + 50,
      scale,
    })
  }, [state.viewports, setCanvasTransform])

  const handleRefresh = useCallback(() => {
    // Force refresh all iframes by toggling URL
    const currentUrl = state.url
    setUrl('')
    setTimeout(() => setUrl(currentUrl), 50)
  }, [state.url, setUrl])

  const openInNewTab = useCallback(() => {
    if (state.url) {
      window.open(state.url, '_blank')
    }
  }, [state.url])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-background">
        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2 max-w-xl">
          <Input
            type="url"
            placeholder="Enter URL to preview..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="h-9"
          />
          <Button type="submit" variant="secondary" size="sm">
            Go
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in new tab</TooltipContent>
          </Tooltip>
        </form>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Device Picker */}
        <DevicePicker />

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={state.layoutMode === 'freeform'}
                onPressedChange={() => setLayoutMode('freeform')}
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Move className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Freeform canvas</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={state.layoutMode === 'grid'}
                onPressedChange={() => setLayoutMode('grid')}
                size="sm"
                className="h-7 w-7 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Grid layout</TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Zoom Controls - only in freeform mode */}
        {state.layoutMode === 'freeform' && (
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleZoom(-0.1)}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            
            <div className="flex items-center gap-2 w-32">
              <Slider
                value={[state.canvasTransform.scale]}
                onValueChange={handleZoomSlider}
                min={0.1}
                max={2}
                step={0.05}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round(state.canvasTransform.scale * 100)}%
              </span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleZoom(0.1)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleFitToContent}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to content</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Sync Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              <Link2 className="h-4 w-4" />
              <span className="text-xs">Sync</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Sync Events</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-scroll" className="flex items-center gap-2 text-sm">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    Scroll
                  </Label>
                  <Switch
                    id="sync-scroll"
                    checked={state.syncSettings.scroll}
                    onCheckedChange={(v) => setSyncSettings({ scroll: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-mouse" className="flex items-center gap-2 text-sm">
                    <MousePointer2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Mouse
                  </Label>
                  <Switch
                    id="sync-mouse"
                    checked={state.syncSettings.mouse}
                    onCheckedChange={(v) => setSyncSettings({ mouse: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-click" className="flex items-center gap-2 text-sm">
                    <Hand className="h-3.5 w-3.5 text-muted-foreground" />
                    Click
                  </Label>
                  <Switch
                    id="sync-click"
                    checked={state.syncSettings.click}
                    onCheckedChange={(v) => setSyncSettings({ click: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-hover" className="flex items-center gap-2 text-sm">
                    <MousePointer2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Hover
                  </Label>
                  <Switch
                    id="sync-hover"
                    checked={state.syncSettings.hover}
                    onCheckedChange={(v) => setSyncSettings({ hover: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-nav" className="flex items-center gap-2 text-sm">
                    <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                    Navigation
                  </Label>
                  <Switch
                    id="sync-nav"
                    checked={state.syncSettings.navigation}
                    onCheckedChange={(v) => setSyncSettings({ navigation: v })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sync only works for same-origin sites (e.g., localhost).
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Refresh */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh all viewports</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
