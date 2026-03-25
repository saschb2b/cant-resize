"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { ViewerProvider } from "@/components/viewer/viewer-provider";
import { Canvas } from "@/components/viewer/canvas";
import { CanvasOverlay } from "@/components/viewer/canvas-overlay";

export default function ResponsiveViewerPage() {
  const [gridSnap, setGridSnap] = useState(false);

  return (
    <ViewerProvider>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Canvas gridSnap={gridSnap} />
        <CanvasOverlay
          gridSnap={gridSnap}
          onToggleGridSnap={() => setGridSnap((v) => !v)}
        />
      </Box>
    </ViewerProvider>
  );
}
