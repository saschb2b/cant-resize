"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  X,
  RotateCcw,
  Maximize2,
  Loader2,
  AlertTriangle,
  Link2Off,
} from "lucide-react";
import { useViewer } from "./viewer-provider";
import { getDeviceById } from "@/lib/viewer/device-presets";
import type { Viewport } from "@/lib/viewer/types";

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

          innerWindow.addEventListener('scroll', function() {
            if (isReceiving) return;
            const maxScroll = Math.max(1, innerDoc.documentElement.scrollHeight - innerWindow.innerHeight);
            const scrollY = innerWindow.scrollY / maxScroll;
            if (Math.abs(scrollY - lastScrollY) > 0.001) {
              lastScrollY = scrollY;
              window.parent.postMessage({ type: 'SCROLL', scrollY, sourceId: viewportId }, '*');
            }
          }, { passive: true });

          innerDoc.addEventListener('mousemove', function(e) {
            if (isReceiving) return;
            const x = e.clientX / innerWindow.innerWidth;
            const y = e.clientY / innerWindow.innerHeight;
            window.parent.postMessage({ type: 'MOUSE_MOVE', mouseX: x, mouseY: y, sourceId: viewportId }, '*');
          }, { passive: true });

          innerDoc.addEventListener('click', function(e) {
            if (isReceiving) return;
            const x = e.clientX / innerWindow.innerWidth;
            const y = e.clientY / innerWindow.innerHeight;
            const selector = getUniqueSelector(e.target);
            window.parent.postMessage({ type: 'CLICK', mouseX: x, mouseY: y, selector, sourceId: viewportId }, '*');
          }, { passive: true });

          innerDoc.addEventListener('mouseover', function(e) {
            if (isReceiving) return;
            const selector = getUniqueSelector(e.target);
            window.parent.postMessage({ type: 'HOVER', selector, sourceId: viewportId }, '*');
          }, { passive: true });

          let lastUrl = innerWindow.location.href;
          const checkNav = setInterval(function() {
            try {
              const currentUrl = innerWindow.location.href;
              if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                window.parent.postMessage({ type: 'NAVIGATE', url: currentUrl, sourceId: viewportId }, '*');
              }
            } catch (e) {}
          }, 500);

          window.parent.postMessage({ type: 'VIEWPORT_READY', sourceId: viewportId, sameOrigin: true }, '*');
        } catch (e) {
          window.parent.postMessage({ type: 'VIEWPORT_READY', sourceId: viewportId, sameOrigin: false }, '*');
        }
      });

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
          inner.src = e.data.url;
        }

        setTimeout(() => { isReceiving = false; }, 50);
      });
    })();
  </script>
</body>
</html>`;
}

interface ViewportFrameProps {
  viewport: Viewport;
  isGridMode?: boolean;
}

export function ViewportFrame({
  viewport,
  isGridMode = false,
}: ViewportFrameProps) {
  const {
    state,
    removeViewport,
    toggleOrientation,
    selectViewport,
    dispatch,
    broadcastScroll,
    broadcastMouse,
    broadcastClick,
    broadcastHover,
    broadcastNavigation,
  } = useViewer();
  const device = getDeviceById(viewport.deviceId);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean | null>(null);
  const [localSize, setLocalSize] = useState({
    width: viewport.width,
    height: viewport.height,
  });

  const dragStart = useRef({ x: 0, y: 0, viewportX: 0, viewportY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const isSelected = state.selectedViewportId === viewport.id;

  // Sync local size with viewport when not actively resizing
  if (
    !isResizing &&
    (localSize.width !== viewport.width || localSize.height !== viewport.height)
  ) {
    setLocalSize({ width: viewport.width, height: viewport.height });
  }

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (isGridMode) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      selectViewport(viewport.id);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        viewportX: viewport.x,
        viewportY: viewport.y,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isGridMode, viewport.id, viewport.x, viewport.y, selectViewport],
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const scale = state.canvasTransform.scale;
      const deltaX = (e.clientX - dragStart.current.x) / scale;
      const deltaY = (e.clientY - dragStart.current.y) / scale;

      dispatch({
        type: "UPDATE_VIEWPORT",
        id: viewport.id,
        updates: {
          x: dragStart.current.viewportX + deltaX,
          y: dragStart.current.viewportY + deltaY,
        },
      });
    },
    [isDragging, state.canvasTransform.scale, viewport.id, dispatch],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      selectViewport(viewport.id);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: localSize.width,
        height: localSize.height,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [viewport.id, localSize, selectViewport],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing) return;

      const scale = state.canvasTransform.scale;
      const deltaX = (e.clientX - resizeStart.current.x) / scale;
      const deltaY = (e.clientY - resizeStart.current.y) / scale;

      const newWidth = Math.max(200, resizeStart.current.width + deltaX);
      const newHeight = Math.max(200, resizeStart.current.height + deltaY);

      setLocalSize({ width: newWidth, height: newHeight });
    },
    [isResizing, state.canvasTransform.scale],
  );

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      dispatch({
        type: "UPDATE_VIEWPORT",
        id: viewport.id,
        updates: { width: localSize.width, height: localSize.height },
      });
    }
    setIsResizing(false);
  }, [isResizing, viewport.id, localSize, dispatch]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  useEffect(() => {
    interface SyncMessageData {
      type?: string;
      sourceId?: string;
      scrollY?: number;
      mouseX?: number;
      mouseY?: number;
      selector?: string;
      url?: string;
      sameOrigin?: boolean;
    }

    const handleMessage = (e: MessageEvent<SyncMessageData>) => {
      const data = e.data;
      if (data.sourceId !== viewport.id) return;

      switch (data.type) {
        case "SCROLL":
          if (data.scrollY != null) broadcastScroll(data.scrollY, viewport.id);
          break;
        case "MOUSE_MOVE":
          if (data.mouseX != null && data.mouseY != null)
            broadcastMouse(data.mouseX, data.mouseY, viewport.id);
          break;
        case "CLICK":
          if (
            data.mouseX != null &&
            data.mouseY != null &&
            data.selector != null
          )
            broadcastClick(
              data.mouseX,
              data.mouseY,
              data.selector,
              viewport.id,
            );
          break;
        case "HOVER":
          if (data.selector != null) broadcastHover(data.selector, viewport.id);
          break;
        case "NAVIGATE":
          if (data.url != null) broadcastNavigation(data.url, viewport.id);
          break;
        case "VIEWPORT_READY":
          setIsSyncEnabled(data.sameOrigin ?? false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    viewport.id,
    broadcastScroll,
    broadcastMouse,
    broadcastClick,
    broadcastHover,
    broadcastNavigation,
  ]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      { type: "SCROLL_TO", scrollY: state.scrollPosition },
      "*",
    );
  }, [state.scrollPosition]);

  const displayWidth = isResizing ? localSize.width : viewport.width;
  const displayHeight = isResizing ? localSize.height : viewport.height;

  return (
    <Box
      ref={frameRef}
      onClick={() => selectViewport(viewport.id)}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 6,
          border: 2,
          borderColor: isSelected ? "primary.main" : "divider",
          transition: "box-shadow 0.2s",
        },
        isSelected && { boxShadow: 12, zIndex: 10 },
        isDragging && { cursor: "grabbing" },
        isGridMode ? { position: "relative" } : { position: "absolute" },
      ]}
      style={
        isGridMode
          ? {
              width: displayWidth * 0.3,
              height: displayHeight * 0.3 + 36,
            }
          : {
              left: viewport.x,
              top: viewport.y,
              width: displayWidth,
              height: displayHeight + 36,
            }
      }
    >
      {/* Header */}
      <Box
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        sx={[
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 36,
            px: 1.5,
            bgcolor: "action.hover",
            backdropFilter: "blur(8px)",
            borderBottom: 1,
            borderColor: "divider",
            userSelect: "none",
          },
          !isGridMode && { cursor: "grab" },
        ]}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={500}
            noWrap
            color="text.primary"
          >
            {device?.name ?? "Custom"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(displayWidth)} x {Math.round(displayHeight)}
          </Typography>
          {isSyncEnabled === false && (
            <Tooltip title="Scroll sync unavailable for cross-origin sites. Use localhost for full sync.">
              <Link2Off size={12} color="#f59e0b" />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleOrientation(viewport.id);
            }}
            title="Toggle orientation"
            sx={{ width: 24, height: 24 }}
          >
            <RotateCcw size={12} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              removeViewport(viewport.id);
            }}
            title="Remove device"
            sx={{ width: 24, height: 24, color: "error.main" }}
          >
            <X size={12} />
          </IconButton>
        </Box>
      </Box>

      {/* Iframe container */}
      <Box
        sx={{
          position: "relative",
          flex: 1,
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.05)",
              zIndex: 10,
            }}
          >
            <Loader2
              size={24}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </Box>
        )}

        {hasError && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.05)",
              zIndex: 10,
              p: 2,
              textAlign: "center",
            }}
          >
            <AlertTriangle size={32} color="#dc2626" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This site cannot be displayed in an iframe
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (X-Frame-Options restriction)
            </Typography>
          </Box>
        )}

        <iframe
          ref={iframeRef}
          data-viewport-iframe
          data-viewport-id={viewport.id}
          srcDoc={createSyncedIframeHtml(state.url, viewport.id)}
          style={{
            width: isGridMode ? displayWidth : "100%",
            height: isGridMode ? displayHeight : "100%",
            border: "none",
            ...(isGridMode
              ? {
                  transform: "scale(0.3)",
                  transformOrigin: "top left",
                }
              : {}),
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={device?.name ?? "Viewport"}
        />
      </Box>

      {/* Resize handle */}
      {!isGridMode && (
        <Box
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            cursor: "se-resize",
            zIndex: 20,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            p: 0.25,
          }}
        >
          <Maximize2 size={12} style={{ opacity: 0.5 }} />
        </Box>
      )}
    </Box>
  );
}
