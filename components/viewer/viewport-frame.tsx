"use client";

import { useRef } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  X,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Link2Off,
} from "lucide-react";
import { useViewer } from "./viewer-provider";
import { getDeviceById } from "@/lib/viewer/device-presets";
import { useViewportDrag } from "@/lib/viewer/use-viewport-drag";
import { useViewportResize } from "@/lib/viewer/use-viewport-resize";
import { useIframeSync } from "@/lib/viewer/use-iframe-sync";
import type { Viewport } from "@/lib/viewer/types";

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
  const isSelected = state.selectedViewportId === viewport.id;
  const canvasScale = state.canvasTransform.scale;

  // Header stays a constant 40px on screen regardless of canvas zoom
  const headerScreenHeight = 40;
  const headerCanvasHeight = isGridMode
    ? headerScreenHeight
    : headerScreenHeight / canvasScale;
  const headerInverseScale = isGridMode ? 1 : 1 / canvasScale;

  const { isDragging, handleDragStart, handleDragMove, handleDragEnd } =
    useViewportDrag({
      viewportId: viewport.id,
      viewportX: viewport.x,
      viewportY: viewport.y,
      canvasScale: state.canvasTransform.scale,
      isGridMode,
      onSelect: selectViewport,
      onMove: (id, x, y) =>
        dispatch({ type: "UPDATE_VIEWPORT", id, updates: { x, y } }),
    });

  const {
    isResizing,
    displayWidth,
    displayHeight,
    localSize,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  } = useViewportResize({
    viewportId: viewport.id,
    width: viewport.width,
    height: viewport.height,
    canvasScale: state.canvasTransform.scale,
    onSelect: selectViewport,
    onResize: (id, width, height) =>
      dispatch({ type: "UPDATE_VIEWPORT", id, updates: { width, height } }),
  });

  const {
    iframeRef,
    isLoading,
    hasError,
    isSyncEnabled,
    handleIframeLoad,
    handleIframeError,
    srcDoc,
  } = useIframeSync({
    viewportId: viewport.id,
    url: state.url,
    scrollPosition: state.scrollPosition,
    broadcastScroll,
    broadcastMouse,
    broadcastClick,
    broadcastHover,
    broadcastNavigation,
  });

  return (
    <Box
      ref={frameRef}
      onClick={() => selectViewport(viewport.id)}
      sx={[
        isDragging && { cursor: "grabbing" },
        isGridMode ? { position: "relative" } : { position: "absolute" },
      ]}
      style={
        isGridMode
          ? {
              width: displayWidth * 0.3,
              height: displayHeight * 0.3 + headerScreenHeight,
            }
          : {
              left: viewport.x,
              top: viewport.y,
              width: displayWidth,
              height: displayHeight + headerCanvasHeight,
            }
      }
    >
      {/* Header - positioned above the frame, inverse-scaled to stay readable */}
      <Box
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        sx={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: headerScreenHeight,
            px: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            userSelect: "none",
            transformOrigin: "top left",
            zIndex: 5,
            borderTopLeftRadius: 12,
            borderTopRightRadius: isGridMode ? 12 : `${String(12 * canvasScale)}px`,
          },
          !isGridMode && { cursor: "grab" },
        ]}
        style={
          isGridMode
            ? {}
            : {
                transform: `scale(${String(headerInverseScale)})`,
                width: `${String(displayWidth * canvasScale)}px`,
              }
        }
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
            variant="body2"
            fontWeight={600}
            noWrap
            color="text.primary"
          >
            {viewport.customName ?? device?.name ?? "Custom"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            {Math.round(displayWidth)} x {Math.round(displayHeight)}
          </Typography>
          {isSyncEnabled === false && (
            <Tooltip title="Scroll sync unavailable for cross-origin sites. Use localhost for full sync.">
              <Link2Off size={14} color="#f59e0b" />
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
            sx={{ width: 28, height: 28 }}
          >
            <RotateCcw size={14} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              removeViewport(viewport.id);
            }}
            title="Remove device"
            sx={{ width: 28, height: 28, color: "error.main" }}
          >
            <X size={14} />
          </IconButton>
        </Box>
      </Box>

      {/* Iframe container */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "background.paper",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: 6,
          border: 2,
          borderColor: isSelected ? "primary.main" : "divider",
          transition: "box-shadow 0.2s",
          ...(isSelected ? { boxShadow: 12 } : {}),
        }}
        style={{ top: headerCanvasHeight }}
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
              Failed to load this site
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ maxWidth: 240 }}
            >
              The site may block iframe embedding (X-Frame-Options /
              CSP), the URL may be invalid, or the server may be
              unreachable.
            </Typography>
          </Box>
        )}

        <iframe
          ref={iframeRef}
          data-viewport-iframe
          data-viewport-id={viewport.id}
          srcDoc={srcDoc}
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

      {/* Resize handles */}
      {!isGridMode && (
        <>
          {/* Dimension tooltip while resizing */}
          {isResizing && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "rgba(0,0,0,0.8)",
                color: "#fff",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
                zIndex: 30,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(localSize.width)} × {Math.round(localSize.height)}
            </Box>
          )}

          {/* Edge handles */}
          {(
            [
              { dir: "n", cursor: "ns-resize", top: -4, left: 12, right: 12, height: 8 },
              { dir: "s", cursor: "ns-resize", bottom: -4, left: 12, right: 12, height: 8 },
              { dir: "w", cursor: "ew-resize", left: -4, top: 12, bottom: 12, width: 8 },
              { dir: "e", cursor: "ew-resize", right: -4, top: 12, bottom: 12, width: 8 },
            ] as const
          ).map(({ dir, cursor, ...pos }) => (
            <Box
              key={dir}
              onPointerDown={(e) => handleResizeStart(e, dir)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
              sx={{
                position: "absolute",
                cursor,
                zIndex: 20,
                "&:hover": { bgcolor: "rgba(59,130,246,0.15)" },
                ...pos,
              }}
            />
          ))}

          {/* Corner handles */}
          {(
            [
              { dir: "nw", cursor: "nwse-resize", top: -5, left: -5 },
              { dir: "ne", cursor: "nesw-resize", top: -5, right: -5 },
              { dir: "sw", cursor: "nesw-resize", bottom: -5, left: -5 },
              { dir: "se", cursor: "nwse-resize", bottom: -5, right: -5 },
            ] as const
          ).map(({ dir, cursor, ...pos }) => (
            <Box
              key={dir}
              onPointerDown={(e) => handleResizeStart(e, dir)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
              sx={{
                position: "absolute",
                width: 12,
                height: 12,
                cursor,
                zIndex: 21,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "primary.main",
                bgcolor: "background.paper",
                opacity: isSelected ? 1 : 0,
                transition: "opacity 0.15s",
                "&:hover": { opacity: 1, transform: "scale(1.3)" },
                ...pos,
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
}
