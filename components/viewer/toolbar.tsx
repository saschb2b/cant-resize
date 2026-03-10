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
import { useViewer } from './viewer-provider'
import { DevicePicker } from './device-picker'

export function Toolbar() {
  const { state, setUrl, setLayoutMode, setCanvasTransform } = useViewer()
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
