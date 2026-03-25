"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ExternalLink } from "lucide-react";
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
        {/* Minimal footer */}
        <Box
          component="footer"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            px: 2,
            py: 0.5,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <NextLink href="/learn" style={{ textDecoration: "none" }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              Learn Patterns
            </Typography>
          </NextLink>
          <Box
            component="a"
            href="https://github.com/saschb2b/cant-resize"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
              textDecoration: "none",
              typography: "caption",
              "&:hover": { color: "text.primary" },
            }}
          >
            GitHub
            <ExternalLink size={10} />
          </Box>
        </Box>
      </Box>
    </ViewerProvider>
  );
}
