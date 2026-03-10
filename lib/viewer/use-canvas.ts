'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import type { CanvasTransform } from './types'

interface UseCanvasOptions {
  initialTransform?: CanvasTransform
  minScale?: number
  maxScale?: number
  onTransformChange?: (transform: CanvasTransform) => void
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const {
    initialTransform = { x: 0, y: 0, scale: 0.5 },
    minScale = 0.1,
    maxScale = 2,
    onTransformChange,
  } = options

  const [transform, setTransform] = useState<CanvasTransform>(initialTransform)
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const updateTransform = useCallback(
    (newTransform: CanvasTransform) => {
      setTransform(newTransform)
      onTransformChange?.(newTransform)
    },
    [onTransformChange]
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.001
        const newScale = Math.min(maxScale, Math.max(minScale, transform.scale + delta))
        
        // Zoom towards cursor
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const mouseX = e.clientX - rect.left
          const mouseY = e.clientY - rect.top
          const scaleFactor = newScale / transform.scale
          
          updateTransform({
            x: mouseX - (mouseX - transform.x) * scaleFactor,
            y: mouseY - (mouseY - transform.y) * scaleFactor,
            scale: newScale,
          })
        }
      } else {
        // Pan
        updateTransform({
          ...transform,
          x: transform.x - e.deltaX,
          y: transform.y - e.deltaY,
        })
      }
    },
    [transform, minScale, maxScale, updateTransform]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        // Middle mouse or Space + Left click
        e.preventDefault()
        setIsPanning(true)
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    },
    [isSpacePressed]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastMousePos.current.x
        const deltaY = e.clientY - lastMousePos.current.y
        lastMousePos.current = { x: e.clientX, y: e.clientY }
        
        updateTransform({
          ...transform,
          x: transform.x + deltaX,
          y: transform.y + deltaY,
        })
      }
    },
    [isPanning, transform, updateTransform]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const zoomTo = useCallback(
    (scale: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const scaleFactor = scale / transform.scale
        
        updateTransform({
          x: centerX - (centerX - transform.x) * scaleFactor,
          y: centerY - (centerY - transform.y) * scaleFactor,
          scale,
        })
      }
    },
    [transform, updateTransform]
  )

  const fitToContent = useCallback(
    (contentBounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const contentWidth = contentBounds.maxX - contentBounds.minX
      const contentHeight = contentBounds.maxY - contentBounds.minY
      
      if (contentWidth === 0 || contentHeight === 0) return

      const scaleX = (rect.width - 100) / contentWidth
      const scaleY = (rect.height - 100) / contentHeight
      const scale = Math.min(scaleX, scaleY, maxScale)

      const centerX = (contentBounds.minX + contentBounds.maxX) / 2
      const centerY = (contentBounds.minY + contentBounds.maxY) / 2

      updateTransform({
        x: rect.width / 2 - centerX * scale,
        y: rect.height / 2 - centerY * scale,
        scale,
      })
    },
    [maxScale, updateTransform]
  )

  const resetTransform = useCallback(() => {
    updateTransform({ x: 0, y: 0, scale: 0.5 })
  }, [updateTransform])

  // Handle space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Attach wheel listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  return {
    containerRef,
    transform,
    isPanning,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomTo,
    fitToContent,
    resetTransform,
    setTransform: updateTransform,
  }
}
