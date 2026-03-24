"use client";

import NextLink from "next/link";
import Image from "next/image";
import { useCallback, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";

function ThemeIcon({ isDark, size = 18 }: { isDark: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <mask id="theme-toggle-mask">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <circle
          cx={isDark ? 17 : 32}
          cy={isDark ? 7 : 2}
          r="9"
          fill="black"
          style={{ transition: "cx 0.5s ease, cy 0.5s ease" }}
        />
      </mask>
      <circle
        cx="12"
        cy="12"
        r={isDark ? 9 : 5}
        fill="currentColor"
        stroke="none"
        mask="url(#theme-toggle-mask)"
        style={{ transition: "r 0.5s ease" }}
      />
      <g
        style={{
          transformOrigin: "center",
          transition: "transform 0.5s ease, opacity 0.3s ease",
          transform: isDark
            ? "rotate(45deg) scale(0)"
            : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
        }}
      >
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );
}

function ColorSchemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const emptySubscribe = useCallback(() => () => undefined, []);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const resolvedMode = mode === "system" ? systemMode : mode;
  const isDark = resolvedMode === "dark";

  return (
    <Tooltip
      title={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : ""
      }
    >
      <IconButton
        size="small"
        onClick={
          mounted ? () => setMode(isDark ? "light" : "dark") : undefined
        }
        sx={{ color: "text.secondary" }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            opacity: mounted ? 1 : 0,
            transform: mounted
              ? "scale(1) rotate(0deg)"
              : "scale(0.5) rotate(-90deg)",
          }}
        >
          <ThemeIcon isDark={isDark} />
        </Box>
      </IconButton>
    </Tooltip>
  );
}

export function SiteHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "rgba(var(--mui-palette-background-defaultChannel) / 0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" sx={{ py: 1.5 }}>
          <NextLink
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Image src="/icon.svg" alt="" width={28} height={28} priority />
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                Responsive Viewer
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontFamily="var(--font-geist-mono), monospace"
                sx={{ fontSize: "0.65rem" }}
              >
                Multi-device preview
              </Typography>
            </Box>
          </NextLink>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ ml: "auto" }}
          >
            <ColorSchemeToggle />
            <NextLink href="/canvas" style={{ textDecoration: "none" }}>
              <Button variant="contained" size="small">
                Open Viewer
              </Button>
            </NextLink>
          </Stack>
        </Stack>
      </Container>
      <Divider />
    </Box>
  );
}
