"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useViewer } from "./viewer-provider";
import { ViewportFrame } from "./viewport-frame";

export function GridLayout() {
  const { state } = useViewer();

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, bgcolor: "action.hover" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          alignItems: "flex-start",
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
