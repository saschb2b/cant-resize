"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useViewer } from "./viewer-provider";
import { useCanvas } from "@/lib/viewer/use-canvas";
import { ViewportFrame } from "./viewport-frame";
import { DevicePicker } from "./device-picker";
import type { GuideLine } from "@/lib/viewer/use-snap";

// ── Grid drag-to-reorder state ──────────────────────────────────────────────

interface GridDragState {
  /** Index of the viewport being dragged. */
  fromIndex: number;
  /** Current insertion target index. */
  overIndex: number;
  /** Cursor offset from the top-left of the dragged element. */
  offset: { x: number; y: number };
  /** Current cursor position (fixed). */
  cursor: { x: number; y: number };
  /** Size of the dragged element for the ghost. */
  size: { width: number; height: number };
}

// ── Grid mode component ─────────────────────────────────────────────────────

function GridCanvas() {
  const { state, dispatch, selectViewport } = useViewer();
  const [drag, setDrag] = useState<GridDragState | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      // Only left button
      if (e.button !== 0) return;

      const el = itemRefs.current[index];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      el.setPointerCapture(e.pointerId);

      setDrag({
        fromIndex: index,
        overIndex: index,
        offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        cursor: { x: e.clientX, y: e.clientY },
        size: { width: rect.width, height: rect.height },
      });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;

      // Find which item the cursor is over
      let newOverIndex = drag.overIndex;
      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        if (!el || i === drag.fromIndex) continue;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        if (
          e.clientX > rect.left &&
          e.clientX < rect.right &&
          e.clientY > rect.top &&
          e.clientY < rect.bottom
        ) {
          // Decide before/after based on cursor relative to center
          if (e.clientX < centerX || e.clientY < centerY) {
            newOverIndex = i;
          } else {
            newOverIndex = i + 1;
          }
        }
      }

      // Clamp
      newOverIndex = Math.max(
        0,
        Math.min(newOverIndex, state.viewports.length),
      );

      setDrag((prev) =>
        prev
          ? {
              ...prev,
              cursor: { x: e.clientX, y: e.clientY },
              overIndex: newOverIndex,
            }
          : null,
      );
    },
    [drag, state.viewports.length],
  );

  const handlePointerUp = useCallback(() => {
    if (!drag) return;

    if (drag.fromIndex !== drag.overIndex) {
      // Adjust target index: if moving forward, account for removal
      const toIndex =
        drag.overIndex > drag.fromIndex
          ? drag.overIndex - 1
          : drag.overIndex;
      dispatch({
        type: "REORDER_VIEWPORTS",
        fromIndex: drag.fromIndex,
        toIndex,
      });
    }

    setDrag(null);
  }, [drag, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && drag) {
        setDrag(null);
      }
    },
    [drag],
  );

  // Calculate the visual position each item should shift to
  const getItemTransform = (index: number): string => {
    if (!drag || index === drag.fromIndex) return "none";

    // Items between fromIndex and overIndex need to shift
    const { fromIndex, overIndex } = drag;

    if (fromIndex < overIndex) {
      // Dragging forward: items between (from, over) shift left
      if (index > fromIndex && index < overIndex) {
        return `translateX(-${String(drag.size.width + 24)}px)`;
      }
    } else {
      // Dragging backward: items between [over, from) shift right
      if (index >= overIndex && index < fromIndex) {
        return `translateX(${String(drag.size.width + 24)}px)`;
      }
    }

    return "none";
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        p: 3,
        bgcolor: "action.hover",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) selectViewport(null);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {state.viewports.map((viewport, index) => {
          const isDragged = drag?.fromIndex === index;

          return (
            <Box
              key={viewport.id}
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[index] = el;
              }}
              onPointerDown={isDragged ? undefined : (e) => handlePointerDown(e, index)}
              sx={{
                cursor: drag ? "grabbing" : "grab",
                transition:
                  drag && !isDragged ? "transform 0.2s ease" : "none",
              }}
              style={{
                transform: getItemTransform(index),
                // Keep the element in flow for sizing but make it invisible
                ...(isDragged ? { visibility: "hidden" as const } : {}),
              }}
            >
              <ViewportFrame viewport={viewport} isGridMode />
            </Box>
          );
        })}

        {/* Drag ghost: cloned as a visual-only overlay following the cursor.
            Uses a portal-style fixed box. The actual ViewportFrame stays
            mounted in the grid (hidden) so the iframe doesn't reload. */}
        {drag && state.viewports[drag.fromIndex] && (
          <Box
            sx={{
              position: "fixed",
              zIndex: 9999,
              pointerEvents: "none",
              boxShadow: 24,
              borderRadius: 2,
              overflow: "hidden",
              opacity: 0.9,
            }}
            style={{
              left: drag.cursor.x - drag.offset.x,
              top: drag.cursor.y - drag.offset.y,
              width: drag.size.width,
              height: drag.size.height,
              transform: "scale(1.03)",
            }}
          >
            {/* Visual-only clone — lightweight, no iframe */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "background.paper",
                border: 2,
                borderColor: "primary.main",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {state.viewports[drag.fromIndex]!.customName ??
                  state.viewports[drag.fromIndex]!.deviceId}
              </Typography>
            </Box>
          </Box>
        )}
        {state.viewports.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 400,
              color: "text.secondary",
              gap: 2,
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Image src="/icon.svg" alt="" width={48} height={48} />
            </Box>
            <Typography variant="h6">No devices added</Typography>
            <Typography variant="body2" color="text.secondary">
              Add a device to start previewing your site across screen sizes
            </Typography>
            <DevicePicker
              renderTrigger={(open) => (
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={open}
                  sx={{ mt: 1 }}
                >
                  Add Device
                </Button>
              )}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Main canvas export ──────────────────────────────────────────────────────

interface CanvasProps {
  gridSnap?: boolean;
  showBreakpoints?: boolean;
  showRulers?: boolean;
}

export function Canvas({ gridSnap = false, showBreakpoints = false, showRulers = false }: CanvasProps) {
  const { state, selectViewport, setCanvasTransform } = useViewer();
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const {
    containerRef,
    transform,
    isPanning,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas({
    transform: state.canvasTransform,
    onTransformChange: setCanvasTransform,
  });

  if (state.layoutMode === "grid") {
    return <GridCanvas />;
  }

  return (
    <Box
      ref={containerRef}
      sx={[
        {
          height: "100%",
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
        backgroundSize: `${String(20 * transform.scale)}px ${String(20 * transform.scale)}px`,
        backgroundPosition: `${String(transform.x)}px ${String(transform.y)}px`,
      }}
      onClick={(e) => {
        // Deselect when clicking the canvas background (not a viewport)
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBackground !== undefined) {
          selectViewport(null);
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transformed canvas content */}
      <Box
        data-canvas-background
        sx={{ position: "absolute", transformOrigin: "top left" }}
        style={{
          transform: `translate(${String(transform.x)}px, ${String(transform.y)}px) scale(${String(transform.scale)})`,
          width: "10000px",
          height: "10000px",
        }}
      >
        {state.viewports.map((viewport) => (
          <ViewportFrame
            key={viewport.id}
            viewport={viewport}
            gridSnap={gridSnap}
            showBreakpoints={showBreakpoints}
            showRulers={showRulers}
            onGuidesChange={setGuides}
          />
        ))}
      </Box>

      {/* Alignment guide lines */}
      {guides.map((guide, i) => {
        if (guide.axis === "v") {
          const screenX = transform.x + guide.position * transform.scale;
          const screenFrom = transform.y + guide.from * transform.scale;
          const screenTo = transform.y + guide.to * transform.scale;
          return (
            <Box
              key={`g${String(i)}`}
              sx={{
                position: "absolute",
                width: 0,
                borderLeft: "1px solid",
                borderColor: "primary.main",
                opacity: 0.6,
                pointerEvents: "none",
                zIndex: 50,
              }}
              style={{
                left: screenX,
                top: screenFrom,
                height: screenTo - screenFrom,
              }}
            />
          );
        }
        // Horizontal guide
        const screenY = transform.y + guide.position * transform.scale;
        const screenFrom = transform.x + guide.from * transform.scale;
        const screenTo = transform.x + guide.to * transform.scale;
        return (
          <Box
            key={`g${String(i)}`}
            sx={{
              position: "absolute",
              height: 0,
              borderTop: "1px solid",
              borderColor: "primary.main",
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 50,
            }}
            style={{
              top: screenY,
              left: screenFrom,
              width: screenTo - screenFrom,
            }}
          />
        );
      })}

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
            gap: 2,
          }}
        >
          <Box sx={{ mb: 1 }}>
            <Image src="/icon.svg" alt="" width={48} height={48} />
          </Box>
          <Typography variant="h6">No devices added</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a device to start previewing your site across screen sizes
          </Typography>
          <DevicePicker
            renderTrigger={(open) => (
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={open}
                sx={{ mt: 1 }}
              >
                Add Device
              </Button>
            )}
          />
        </Box>
      )}

    </Box>
  );
}
