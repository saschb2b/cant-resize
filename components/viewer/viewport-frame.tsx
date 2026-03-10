'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, RotateCcw, Maximize2, Loader2, AlertTriangle, Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useViewer } from './viewer-provider'
import { getDeviceById } from '@/lib/viewer/device-presets'
import type { Viewport } from '@/lib/viewer/types'

// Generate the HTML wrapper with full sync script
function createSyncedIframeHtml(url: string, viewportId: string): string {
  return `<!DOCTYPE html>
<html style="height:100%;margin:0;padding:0;">
<head>
  <style>
    * { margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
    .sync-cursor {
      position: fixed;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.6);
      border: 2px solid rgba(59, 130, 246, 0.9);
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s;
      display: none;
    }
    .sync-hover {
      outline: 2px dashed rgba(59, 130, 246, 0.7) !important;
      outline-offset: 2px !important;
    }
  </style>
</head>
<body>
  <div id="sync-cursor" class="sync-cursor"></div>
  <iframe id="inner" src="${url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  <script>
    (function() {
      const viewportId = '${viewportId}';
      const inner = document.getElementById('inner');
      const syncCursor = document.getElementById('sync-cursor');
      let lastScrollY = 0;
      let isReceiving = false;
      let innerWindow = null;
      let innerDoc = null;
      let isSameOrigin = false;
      let lastHovered = null;
      let cursorHideTimeout = null;

      function getUniqueSelector(el) {
        if (!el || el === innerDoc.body) return 'body';
        if (el.id) return '#' + el.id;
        let path = [];
        while (el && el.nodeType === 1 && el !== innerDoc.body) {
          let selector = el.tagName.toLowerCase();
          if (el.className && typeof el.className === 'string') {
            selector += '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.');
          }
          const siblings = el.parentNode ? Array.from(el.parentNode.children).filter(c => c.tagName === el.tagName) : [];
          if (siblings.length > 1) {
            selector += ':nth-of-type(' + (siblings.indexOf(el) + 1) + ')';
          }
          path.unshift(selector);
          el = el.parentNode;
        }
        return path.join(' > ');
      }

      function findElement(selector) {
        try { return innerDoc.querySelector(selector); } catch { return null; }
      }
      
      inner.addEventListener('load', function() {
        try {
          innerWindow = inner.contentWindow;
          innerDoc = inner.contentDocument || inner.contentWindow.document;
          isSameOrigin = true;
          
          // Scroll sync
          innerWindow.addEventListener('scroll', function() {
            if (isReceiving) return;
            const maxScroll = Math.max(1, innerDoc.documentElement.scrollHeight - innerWindow.innerHeight);
            const scrollY = innerWindow.scrollY / maxScroll;
            if (Math.abs(scrollY - lastScrollY) > 0.001) {
              lastScrollY = scrollY;
              window.parent.postMessage({ type: 'SCROLL', scrollY, sourceId: viewportId }, '*');
            }
          }, { passive: true });

          // Mouse move sync
          innerDoc.addEventListener('mousemove', function(e) {
            if (isReceiving) return;
            const x = e.clientX / innerWindow.innerWidth;
            const y = e.clientY / innerWindow.innerHeight;
            window.parent.postMessage({ type: 'MOUSE_MOVE', mouseX: x, mouseY: y, sourceId: viewportId }, '*');
          }, { passive: true });

          // Click sync
          innerDoc.addEventListener('click', function(e) {
            if (isReceiving) return;
            const x = e.clientX / innerWindow.innerWidth;
            const y = e.clientY / innerWindow.innerHeight;
            const selector = getUniqueSelector(e.target);
            window.parent.postMessage({ type: 'CLICK', mouseX: x, mouseY: y, selector, sourceId: viewportId }, '*');
          }, { passive: true });

          // Hover sync
          innerDoc.addEventListener('mouseover', function(e) {
            if (isReceiving) return;
            const selector = getUniqueSelector(e.target);
            window.parent.postMessage({ type: 'HOVER', selector, sourceId: viewportId }, '*');
          }, { passive: true });

          // Navigation sync - check for URL changes periodically
          let lastUrl = innerWindow.location.href;
          console.log('[v0] Viewport ' + viewportId + ' initial URL:', lastUrl);
          const checkNav = setInterval(function() {
            try {
              const currentUrl = innerWindow.location.href;
              if (currentUrl !== lastUrl) {
                console.log('[v0] Viewport ' + viewportId + ' URL changed:', lastUrl, '->', currentUrl);
                lastUrl = currentUrl;
                window.parent.postMessage({ type: 'NAVIGATE', url: currentUrl, sourceId: viewportId }, '*');
              }
            } catch (e) {
              // Cross-origin navigation - can't read URL anymore
              console.log('[v0] Viewport ' + viewportId + ' cross-origin navigation detected');
            }
          }, 500);
          
          window.parent.postMessage({ type: 'VIEWPORT_READY', sourceId: viewportId, sameOrigin: true }, '*');
        } catch (e) {
          window.parent.postMessage({ type: 'VIEWPORT_READY', sourceId: viewportId, sameOrigin: false }, '*');
        }
      });
      
      // Handle incoming sync commands
      window.addEventListener('message', function(e) {
        if (!e.data?.type || !isSameOrigin) return;
        isReceiving = true;

        if (e.data.type === 'SCROLL_TO' && typeof e.data.scrollY === 'number') {
          const maxScroll = Math.max(1, innerDoc.documentElement.scrollHeight - innerWindow.innerHeight);
          innerWindow.scrollTo({ top: e.data.scrollY * maxScroll, behavior: 'instant' });
          lastScrollY = e.data.scrollY;
        }

        if (e.data.type === 'MOUSE_MOVE' && typeof e.data.mouseX === 'number') {
          syncCursor.style.display = 'block';
          syncCursor.style.left = (e.data.mouseX * innerWindow.innerWidth) + 'px';
          syncCursor.style.top = (e.data.mouseY * innerWindow.innerHeight) + 'px';
          clearTimeout(cursorHideTimeout);
          cursorHideTimeout = setTimeout(() => { syncCursor.style.display = 'none'; }, 2000);
        }

        if (e.data.type === 'CLICK' && e.data.selector) {
          const el = findElement(e.data.selector);
          if (el) {
            el.click();
            el.style.transition = 'box-shadow 0.15s';
            el.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            setTimeout(() => { el.style.boxShadow = ''; }, 300);
          }
        }

        if (e.data.type === 'HOVER' && e.data.selector) {
          if (lastHovered) lastHovered.classList.remove('sync-hover');
          const el = findElement(e.data.selector);
          if (el) {
            el.classList.add('sync-hover');
            lastHovered = el;
          }
        }

        if (e.data.type === 'NAVIGATE' && e.data.url) {
          console.log('[v0] Viewport ' + viewportId + ' receiving NAVIGATE to:', e.data.url);
          inner.src = e.data.url;
        }

        setTimeout(() => { isReceiving = false; }, 50);
      });
    })();
  </script>
</body>
</html>`
}

interface ViewportFrameProps {
  viewport: Viewport
  isGridMode?: boolean
}

export function ViewportFrame({ viewport, isGridMode = false }: ViewportFrameProps) {
  const { state, removeViewport, toggleOrientation, selectViewport, dispatch, broadcastScroll, broadcastMouse, broadcastClick, broadcastHover, broadcastNavigation } = useViewer()
  const device = getDeviceById(viewport.deviceId)
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean | null>(null)
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

  // Listen for messages from iframe (all sync events)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.sourceId !== viewport.id) return
      
      switch (e.data?.type) {
        case 'SCROLL':
          broadcastScroll(e.data.scrollY, viewport.id)
          break
        case 'MOUSE_MOVE':
          broadcastMouse(e.data.mouseX, e.data.mouseY, viewport.id)
          break
        case 'CLICK':
          broadcastClick(e.data.mouseX, e.data.mouseY, e.data.selector, viewport.id)
          break
        case 'HOVER':
          broadcastHover(e.data.selector, viewport.id)
          break
        case 'NAVIGATE':
          console.log('[v0] NAVIGATE received from viewport', viewport.id, 'url:', e.data.url)
          broadcastNavigation(e.data.url, viewport.id)
          break
        case 'VIEWPORT_READY':
          setIsSyncEnabled(e.data.sameOrigin)
          break
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [viewport.id, broadcastScroll, broadcastMouse, broadcastClick, broadcastHover, broadcastNavigation])

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
          {isSyncEnabled === false && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link2Off className="h-3 w-3 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">Scroll sync unavailable for cross-origin sites. Use localhost for full sync.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
          srcDoc={createSyncedIframeHtml(state.url, viewport.id)}
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
