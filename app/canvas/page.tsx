"use client";

import Box from "@mui/material/Box";
import { ViewerProvider } from "@/components/viewer/viewer-provider";
import { Toolbar } from "@/components/viewer/toolbar";
import { Canvas } from "@/components/viewer/canvas";

export default function ResponsiveViewerPage() {
  return (
    <ViewerProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Canvas />
      </Box>
    </ViewerProvider>
  );
}
