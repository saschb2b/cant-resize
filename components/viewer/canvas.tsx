"use client";

import { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useViewer } from "./viewer-provider";
import { useCanvas } from "@/lib/viewer/use-canvas";
import { ViewportFrame } from "./viewport-frame";

export function Canvas() {
  const { state, setCanvasTransform } = useViewer();

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
  });

  const contentBounds = useMemo(() => {
    if (state.viewports.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    state.viewports.forEach((v) => {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x + v.width);
      maxY = Math.max(maxY, v.y + v.height + 36);
    });

    return { minX, minY, maxX, maxY };
  }, [state.viewports]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Deselect handled by viewportFrame
  }, []);

  if (state.layoutMode === "grid") {
    return (
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          bgcolor: "action.hover",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {state.viewports.map((viewport) => (
            <ViewportFrame key={viewport.id} viewport={viewport} isGridMode />
          ))}
          {state.viewports.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 256,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">No devices added</Typography>
              <Typography variant="body2">
                Click &quot;Add Device&quot; to get started
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={[
        {
          flex: 1,
          overflow: "hidden",
          position: "relative",
        },
        isSpacePressed && { cursor: "grab" },
        isPanning && { cursor: "grabbing" },
      ]}
      style={{
        backgroundColor: "var(--mui-palette-action-hover)",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, var(--mui-palette-divider) 1px, transparent 0)",
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
      <Box
        data-canvas-background
        sx={{ position: "absolute", transformOrigin: "top left" }}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: "10000px",
          height: "10000px",
        }}
      >
        {state.viewports.map((viewport) => (
          <ViewportFrame key={viewport.id} viewport={viewport} />
        ))}
      </Box>

      {/* Empty state */}
      {state.viewports.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            pointerEvents: "none",
          }}
        >
          <Typography variant="h6">No devices added</Typography>
          <Typography variant="body2">
            Click &quot;Add Device&quot; to get started
          </Typography>
          <Typography variant="caption" sx={{ mt: 2 }}>
            Space + Drag to pan | Scroll to zoom
          </Typography>
        </Box>
      )}

      {/* Canvas info */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          fontSize: "0.75rem",
          color: "text.secondary",
          bgcolor: "background.paper",
          backdropFilter: "blur(8px)",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          opacity: 0.8,
        }}
      >
        {Math.round(transform.scale * 100)}% | {state.viewports.length} device
        {state.viewports.length !== 1 ? "s" : ""}
      </Box>
    </Box>
  );
}
