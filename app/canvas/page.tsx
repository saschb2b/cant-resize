"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { ViewerProvider } from "@/components/viewer/viewer-provider";
import { Canvas } from "@/components/viewer/canvas";
import { CanvasOverlay } from "@/components/viewer/canvas-overlay";

export default function ResponsiveViewerPage() {
  const [gridSnap, setGridSnap] = useState(false);
  const [showBreakpoints, setShowBreakpoints] = useState(false);
  const [showRulers, setShowRulers] = useState(false);

  return (
    <ViewerProvider>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Canvas
          gridSnap={gridSnap}
          showBreakpoints={showBreakpoints}
          showRulers={showRulers}
        />
        <CanvasOverlay
          gridSnap={gridSnap}
          onToggleGridSnap={() => setGridSnap((v) => !v)}
          showBreakpoints={showBreakpoints}
          onToggleBreakpoints={() => setShowBreakpoints((v) => !v)}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((v) => !v)}
        />
      </Box>
    </ViewerProvider>
  );
}
