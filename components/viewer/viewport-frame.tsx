'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, RotateCcw, Maximize2, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useViewer } from './viewer-provider'
import { getDeviceById } from '@/lib/viewer/device-presets'
import type { Viewport } from '@/lib/viewer/types'

interface ViewportFrameProps {
  viewport: Viewport
  isGridMode?: boolean
}

export function ViewportFrame({ viewport, isGridMode = false }: ViewportFrameProps) {
  const { state, removeViewport, toggleOrientation, selectViewport, dispatch, broadcastScroll } = useViewer()
  const device = getDeviceById(viewport.deviceId)
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [localSize, setLocalSize] = useState({ width: viewport.width, height: viewport.height })
  
  const dragStart = useRef({ x: 0, y: 0, viewportX: 0, viewportY: 0 })
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const isSelected = state.selectedViewportId === viewport.id

  // Sync local size with viewport
  useEffect(() => {
    setLocalSize({ width: viewport.width, height: viewport.height })
  }, [viewport.width, viewport.height])

  // Handle drag start
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (isGridMode) return
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    selectViewport(viewport.id)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      viewportX: viewport.x,
      viewportY: viewport.y,
    }
    
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [isGridMode, viewport.id, viewport.x, viewport.y, selectViewport])

  // Handle drag move
  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    
    const scale = state.canvasTransform.scale
    const deltaX = (e.clientX - dragStart.current.x) / scale
    const deltaY = (e.clientY - dragStart.current.y) / scale
    
    dispatch({
      type: 'UPDATE_VIEWPORT',
      id: viewport.id,
      updates: {
        x: dragStart.current.viewportX + deltaX,
        y: dragStart.current.viewportY + deltaY,
      },
    })
  }, [isDragging, state.canvasTransform.scale, viewport.id, dispatch])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    selectViewport(viewport.id)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: localSize.width,
      height: localSize.height,
    }
    
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [viewport.id, localSize, selectViewport])

  // Handle resize move
  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return
    
    const scale = state.canvasTransform.scale
    const deltaX = (e.clientX - resizeStart.current.x) / scale
    const deltaY = (e.clientY - resizeStart.current.y) / scale
    
    const newWidth = Math.max(200, resizeStart.current.width + deltaX)
    const newHeight = Math.max(200, resizeStart.current.height + deltaY)
    
    setLocalSize({ width: newWidth, height: newHeight })
  }, [isResizing, state.canvasTransform.scale])

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      dispatch({
        type: 'UPDATE_VIEWPORT',
        id: viewport.id,
        updates: { width: localSize.width, height: localSize.height },
      })
    }
    setIsResizing(false)
  }, [isResizing, viewport.id, localSize, dispatch])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Listen for scroll messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SCROLL' && e.data.sourceId === viewport.id) {
        broadcastScroll(e.data.scrollY, viewport.id)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [viewport.id, broadcastScroll])

  // Receive scroll sync
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    
    // When scrollPosition changes from another viewport, sync this one
    iframe.contentWindow.postMessage(
      { type: 'SCROLL_TO', scrollY: state.scrollPosition },
      '*'
    )
  }, [state.scrollPosition])

  const displayWidth = isResizing ? localSize.width : viewport.width
  const displayHeight = isResizing ? localSize.height : viewport.height

  return (
    <div
      ref={frameRef}
      className={cn(
        'absolute flex flex-col bg-card rounded-xl overflow-hidden shadow-xl border-2 transition-shadow',
        isSelected ? 'border-primary shadow-2xl z-10' : 'border-border',
        isDragging && 'cursor-grabbing',
        isGridMode && 'relative'
      )}
      style={
        isGridMode
          ? { width: displayWidth * 0.3, height: displayHeight * 0.3 + 36 }
          : {
              left: viewport.x,
              top: viewport.y,
              width: displayWidth,
              height: displayHeight + 36, // Header height
            }
      }
      onClick={() => selectViewport(viewport.id)}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between h-9 px-3 bg-muted/80 backdrop-blur-sm border-b border-border select-none',
          !isGridMode && 'cursor-grab'
        )}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-foreground truncate">
            {device?.name || 'Custom'}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(displayWidth)} x {Math.round(displayHeight)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              toggleOrientation(viewport.id)
            }}
            title="Toggle orientation"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              removeViewport(viewport.id)
            }}
            title="Remove device"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Iframe container */}
      <div className="relative flex-1 bg-background overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 z-10 p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">
              This site cannot be displayed in an iframe
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (X-Frame-Options restriction)
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          data-viewport-iframe
          data-viewport-id={viewport.id}
          src={state.url}
          className="w-full h-full border-0"
          style={
            isGridMode
              ? {
                  width: displayWidth,
                  height: displayHeight,
                  transform: 'scale(0.3)',
                  transformOrigin: 'top left',
                }
              : undefined
          }
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={device?.name || 'Viewport'}
        />
      </div>

      {/* Resize handle */}
      {!isGridMode && (
        <div
          className={cn(
            'absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20',
            'after:absolute after:bottom-1 after:right-1 after:w-2 after:h-2',
            'after:border-r-2 after:border-b-2 after:border-muted-foreground/50',
            'hover:after:border-foreground'
          )}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        >
          <Maximize2 className="h-3 w-3 absolute bottom-0.5 right-0.5 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}
