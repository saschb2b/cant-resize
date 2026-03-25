"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useViewer } from "./viewer-provider";
import { useCanvas } from "@/lib/viewer/use-canvas";
import { ViewportFrame } from "./viewport-frame";
import { DevicePicker } from "./device-picker";

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
    transform: state.canvasTransform,
    onTransformChange: setCanvasTransform,
  });

  if (state.layoutMode === "grid") {
    return (
      <Box
        sx={{
          height: "100%",
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
