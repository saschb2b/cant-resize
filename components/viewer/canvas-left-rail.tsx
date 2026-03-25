"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import {
  Smartphone,
  Tablet,
  Monitor,
  Ruler,
  Camera,
  Check,
  Columns3,
} from "lucide-react";
import { toPng } from "html-to-image";
import { useViewer } from "./viewer-provider";
import { getDevicesByCategory } from "@/lib/viewer/device-presets";
import type { DevicePreset } from "@/lib/viewer/types";

/** Shared pill styles matching the other overlay widgets. */
const pillSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 0.5,
  px: 0.75,
  py: 1,
  borderRadius: 2,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  pointerEvents: "auto" as const,
} as const;

// ── Quick preset flyout ─────────────────────────────────────────────────────

const QUICK_PHONES: string[] = [
  "iphone-15-pro",
  "iphone-se",
  "pixel-8",
  "galaxy-s24",
];
const QUICK_TABLETS: string[] = [
  "ipad-pro-11",
  "ipad-mini",
  "ipad-air",
];
const QUICK_DESKTOPS: string[] = [
  "macbook-14",
  "desktop-1080p",
  "desktop-1440p",
];

function PresetFlyout({
  anchorEl,
  open,
  onClose,
  devices,
  onAdd,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  devices: DevicePreset[];
  onAdd: (id: string) => void;
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            ml: 1,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 180,
          },
        },
      }}
    >
      <Box sx={{ py: 0.5 }}>
        {devices.map((device) => (
          <ButtonBase
            key={device.id}
            onClick={() => {
              onAdd(device.id);
              onClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: "100%",
              px: 2,
              py: 1,
              textAlign: "left",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: "0.8rem" }}>
                {device.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontFamily="var(--font-geist-mono), monospace"
                sx={{ fontSize: "0.6rem" }}
              >
                {device.width}&times;{device.height}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Popover>
  );
}

// ── Breakpoint markers ──────────────────────────────────────────────────────

const BREAKPOINTS = [
  { label: "sm", value: 640 },
  { label: "md", value: 768 },
  { label: "lg", value: 1024 },
  { label: "xl", value: 1280 },
];

export function BreakpointMarkers({
  transform,
}: {
  transform: { x: number; y: number; scale: number };
}) {
  return (
    <>
      {BREAKPOINTS.map((bp) => {
        const screenX = transform.x + bp.value * transform.scale;
        return (
          <Box
            key={bp.label}
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: "1px dashed",
              borderColor: "error.main",
              opacity: 0.35,
              zIndex: 5,
              pointerEvents: "none",
            }}
            style={{ left: screenX }}
          >
            <Typography
              sx={{
                position: "absolute",
                top: 8,
                left: 6,
                fontSize: "0.6rem",
                fontWeight: 700,
                fontFamily: "var(--font-geist-mono), monospace",
                color: "error.main",
                opacity: 0.8,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {bp.label} {bp.value}
            </Typography>
          </Box>
        );
      })}
    </>
  );
}

// ── Rulers ──────────────────────────────────────────────────────────────────

export function CanvasRulers({
  transform,
}: {
  transform: { x: number; y: number; scale: number };
}) {
  const step = getTickStep(transform.scale);
  const rulerColor = "var(--mui-palette-text-secondary)";

  return (
    <>
      {/* Horizontal ruler (top) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          overflow: "hidden",
          zIndex: 8,
          pointerEvents: "none",
          opacity: 0.85,
        }}
      >
        <svg width="100%" height="20" style={{ display: "block" }}>
          <HorizontalTicks
            offset={transform.x}
            scale={transform.scale}
            step={step}
            color={rulerColor}
          />
        </svg>
      </Box>

      {/* Vertical ruler (left) */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 0,
          bottom: 0,
          width: 20,
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          overflow: "hidden",
          zIndex: 8,
          pointerEvents: "none",
          opacity: 0.85,
        }}
      >
        <svg width="20" height="100%" style={{ display: "block" }}>
          <VerticalTicks
            offset={transform.y}
            scale={transform.scale}
            step={step}
            color={rulerColor}
          />
        </svg>
      </Box>

      {/* Corner square */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderRight: 1,
          borderColor: "divider",
          zIndex: 9,
          pointerEvents: "none",
          opacity: 0.85,
        }}
      />
    </>
  );
}

function getTickStep(scale: number): number {
  const pixelsPerUnit = scale;
  if (pixelsPerUnit > 2) return 50;
  if (pixelsPerUnit > 0.8) return 100;
  if (pixelsPerUnit > 0.3) return 200;
  return 500;
}

function HorizontalTicks({
  offset,
  scale,
  step,
  color,
}: {
  offset: number;
  scale: number;
  step: number;
  color: string;
}) {
  const ticks: React.ReactNode[] = [];
  // Generate ticks visible in a reasonable range
  const viewWidth = typeof window !== "undefined" ? window.innerWidth : 2000;
  const startPx = Math.floor((-offset / scale - step) / step) * step;
  const endPx = Math.ceil(((viewWidth - offset) / scale + step) / step) * step;

  for (let px = startPx; px <= endPx; px += step) {
    const screenX = offset + px * scale;
    const isMajor = px % (step * 2) === 0;
    ticks.push(
      <line
        key={px}
        x1={screenX}
        y1={isMajor ? 6 : 12}
        x2={screenX}
        y2={20}
        stroke={color}
        strokeWidth={0.5}
        opacity={isMajor ? 0.5 : 0.25}
      />,
    );
    if (isMajor) {
      ticks.push(
        <text
          key={`t${String(px)}`}
          x={screenX + 3}
          y={10}
          fill={color}
          fontSize="8"
          fontFamily="var(--font-geist-mono), monospace"
          opacity={0.6}
        >
          {px}
        </text>,
      );
    }
  }
  return <>{ticks}</>;
}

function VerticalTicks({
  offset,
  scale,
  step,
  color,
}: {
  offset: number;
  scale: number;
  step: number;
  color: string;
}) {
  const ticks: React.ReactNode[] = [];
  const viewHeight = typeof window !== "undefined" ? window.innerHeight : 1200;
  const startPx = Math.floor((-offset / scale - step) / step) * step;
  const endPx = Math.ceil(((viewHeight - offset) / scale + step) / step) * step;

  for (let px = startPx; px <= endPx; px += step) {
    const screenY = offset + px * scale;
    const isMajor = px % (step * 2) === 0;
    ticks.push(
      <line
        key={px}
        x1={isMajor ? 6 : 12}
        y1={screenY}
        x2={20}
        y2={screenY}
        stroke={color}
        strokeWidth={0.5}
        opacity={isMajor ? 0.5 : 0.25}
      />,
    );
    if (isMajor) {
      ticks.push(
        <text
          key={`t${String(px)}`}
          x={2}
          y={screenY - 3}
          fill={color}
          fontSize="8"
          fontFamily="var(--font-geist-mono), monospace"
          opacity={0.6}
          writingMode="vertical-lr"
          textAnchor="start"
        >
          {px}
        </text>,
      );
    }
  }
  return <>{ticks}</>;
}

// ── Left rail component ─────────────────────────────────────────────────────

interface LeftRailProps {
  showBreakpoints: boolean;
  onToggleBreakpoints: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
}

export function CanvasLeftRail({
  showBreakpoints,
  onToggleBreakpoints,
  showRulers,
  onToggleRulers,
}: LeftRailProps) {
  const { addViewport } = useViewer();
  const [flyout, setFlyout] = useState<"phone" | "tablet" | "desktop" | null>(
    null,
  );
  const [flyoutAnchor, setFlyoutAnchor] = useState<HTMLElement | null>(null);
  const [screenshotFeedback, setScreenshotFeedback] = useState(false);

  const allPhones = getDevicesByCategory("phone");
  const allTablets = getDevicesByCategory("tablet");
  const allDesktops = getDevicesByCategory("desktop");

  const flyoutDevices =
    flyout === "phone"
      ? allPhones.filter((d) => QUICK_PHONES.includes(d.id))
      : flyout === "tablet"
        ? allTablets.filter((d) => QUICK_TABLETS.includes(d.id))
        : allDesktops.filter((d) => QUICK_DESKTOPS.includes(d.id));

  const openFlyout = useCallback(
    (e: React.MouseEvent<HTMLElement>, type: "phone" | "tablet" | "desktop") => {
      setFlyoutAnchor(e.currentTarget);
      setFlyout(type);
    },
    [],
  );

  const handleScreenshot = useCallback(async () => {
    const canvas = document.querySelector("[data-canvas-background]")
      ?.parentElement;
    if (!canvas) return;

    try {
      const dataUrl = await toPng(canvas as HTMLElement, {
        backgroundColor:
          getComputedStyle(document.documentElement).getPropertyValue(
            "--mui-palette-background-default",
          ) || "#0a0a0a",
      });

      // Try clipboard first, fall back to download
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch {
        const link = document.createElement("a");
        link.download = `cant-resize-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      }

      setScreenshotFeedback(true);
      setTimeout(() => setScreenshotFeedback(false), 1500);
    } catch {
      // Silently fail if capture doesn't work (cross-origin iframes)
    }
  }, []);

  const iconBtnSx = (active?: boolean) => ({
    color: active ? "primary.main" : "text.secondary",
    bgcolor: active
      ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)"
      : "transparent",
    width: 32,
    height: 32,
    "&:hover": {
      bgcolor: active
        ? "rgba(var(--mui-palette-primary-mainChannel) / 0.15)"
        : "action.hover",
    },
  });

  return (
    <>
      <Box sx={pillSx}>
        {/* Quick presets */}
        <Tooltip title="Add phone" placement="right">
          <IconButton
            size="small"
            onClick={(e) => openFlyout(e, "phone")}
            sx={iconBtnSx()}
          >
            <Smartphone size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add tablet" placement="right">
          <IconButton
            size="small"
            onClick={(e) => openFlyout(e, "tablet")}
            sx={iconBtnSx()}
          >
            <Tablet size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add desktop" placement="right">
          <IconButton
            size="small"
            onClick={(e) => openFlyout(e, "desktop")}
            sx={iconBtnSx()}
          >
            <Monitor size={16} />
          </IconButton>
        </Tooltip>

        <Divider flexItem sx={{ my: 0.25 }} />

        {/* Breakpoint markers */}
        <Tooltip title="Breakpoint markers" placement="right">
          <IconButton
            size="small"
            onClick={onToggleBreakpoints}
            sx={iconBtnSx(showBreakpoints)}
          >
            <Columns3 size={16} />
          </IconButton>
        </Tooltip>

        {/* Rulers */}
        <Tooltip title="Pixel rulers" placement="right">
          <IconButton
            size="small"
            onClick={onToggleRulers}
            sx={iconBtnSx(showRulers)}
          >
            <Ruler size={16} />
          </IconButton>
        </Tooltip>

        <Divider flexItem sx={{ my: 0.25 }} />

        {/* Screenshot */}
        <Tooltip
          title={screenshotFeedback ? "Copied!" : "Screenshot canvas"}
          placement="right"
        >
          <IconButton
            size="small"
            onClick={() => void handleScreenshot()}
            sx={iconBtnSx()}
          >
            {screenshotFeedback ? (
              <Check size={16} color="var(--mui-palette-success-main)" />
            ) : (
              <Camera size={16} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Preset flyout */}
      <PresetFlyout
        anchorEl={flyoutAnchor}
        open={Boolean(flyout)}
        onClose={() => {
          setFlyout(null);
          setFlyoutAnchor(null);
        }}
        devices={flyoutDevices}
        onAdd={(id) => addViewport(id)}
      />
    </>
  );
}
