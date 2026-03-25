"use client";

import Box from "@mui/material/Box";
import { ViewerProvider } from "@/components/viewer/viewer-provider";
import { Canvas } from "@/components/viewer/canvas";
import { CanvasOverlay } from "@/components/viewer/canvas-overlay";

export default function ResponsiveViewerPage() {
  return (
    <ViewerProvider>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Canvas />
        <CanvasOverlay />
      </Box>
    </ViewerProvider>
  );
}
