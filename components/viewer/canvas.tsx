'use client'

import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useViewer } from './viewer-provider'
import { useCanvas } from '@/lib/viewer/use-canvas'
import { ViewportFrame } from './viewport-frame'

export function Canvas() {
  const { state, setCanvasTransform } = useViewer()
  
  const {
    containerRef,
    transform,
    isPanning,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas({
    initialTransform: state.canvasTransform,
    onTransformChange: setCanvasTransform,
  })

  // Calculate content bounds for fit-to-content
  const contentBounds = useMemo(() => {
    if (state.viewports.length === 0) return null
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    state.viewports.forEach((v) => {
      minX = Math.min(minX, v.x)
      minY = Math.min(minY, v.y)
      maxX = Math.max(maxX, v.x + v.width)
      maxY = Math.max(maxY, v.y + v.height + 36) // Include header
    })
    
    return { minX, minY, maxX, maxY }
  }, [state.viewports])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Deselect when clicking on empty canvas
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBackground) {
      // Handled by the viewportFrame component
    }
  }, [])

  if (state.layoutMode === 'grid') {
    return (
      <div className="flex-1 overflow-auto p-6 bg-muted/30">
        <div className="flex flex-wrap gap-6 justify-center">
          {state.viewports.map((viewport) => (
            <ViewportFrame key={viewport.id} viewport={viewport} isGridMode />
          ))}
          {state.viewports.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-lg font-medium">No devices added</p>
              <p className="text-sm">Click &quot;Add Device&quot; to get started</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-hidden relative',
        isSpacePressed && 'cursor-grab',
        isPanning && 'cursor-grabbing'
      )}
      style={{
        backgroundColor: 'var(--muted)',
        backgroundImage: `
          radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)
        `,
        backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
        backgroundPosition: `${transform.x}px ${transform.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Transformed canvas content */}
      <div
        data-canvas-background
        className="absolute origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: '10000px',
          height: '10000px',
        }}
      >
        {state.viewports.map((viewport) => (
          <ViewportFrame key={viewport.id} viewport={viewport} />
        ))}
      </div>

      {/* Empty state */}
      {state.viewports.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
          <p className="text-lg font-medium">No devices added</p>
          <p className="text-sm">Click &quot;Add Device&quot; to get started</p>
          <p className="text-xs mt-4">Space + Drag to pan | Scroll to zoom</p>
        </div>
      )}

      {/* Canvas info */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
        {Math.round(transform.scale * 100)}% | {state.viewports.length} device{state.viewports.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
