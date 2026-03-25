"use client";

import { useCallback, useState } from "react";
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
  Grid3x3,
} from "lucide-react";
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

// ── Left rail component ─────────────────────────────────────────────────────

interface LeftRailProps {
  showBreakpoints: boolean;
  onToggleBreakpoints: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
}

export function CanvasLeftRail({
  showBreakpoints,
  onToggleBreakpoints,
  showRulers,
  onToggleRulers,
  gridSnap,
  onToggleGridSnap,
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
    try {
      // Use Screen Capture API to grab the current tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" } as MediaTrackConstraints,
        audio: false,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions);

      // Flash effect
      const flash = document.createElement("div");
      Object.assign(flash.style, {
        position: "fixed",
        inset: "0",
        background: "white",
        opacity: "0",
        zIndex: "99999",
        pointerEvents: "none",
        transition: "opacity 0.1s ease-out",
      });
      document.body.appendChild(flash);
      requestAnimationFrame(() => {
        flash.style.opacity = "0.3";
        setTimeout(() => {
          flash.style.opacity = "0";
          setTimeout(() => flash.remove(), 150);
        }, 80);
      });

      // Grab a single frame from the stream
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(() => resolve());
        };
      });

      // Small delay to ensure the frame is ready
      await new Promise((r) => setTimeout(r, 100));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Stop the stream immediately
      stream.getTracks().forEach((t) => t.stop());

      // Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `cant-resize-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setScreenshotFeedback(true);
      setTimeout(() => setScreenshotFeedback(false), 1500);
    } catch {
      // User cancelled the capture dialog or API unavailable
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

        {/* Snap to grid */}
        <Tooltip title="Snap to grid" placement="right">
          <IconButton
            size="small"
            onClick={onToggleGridSnap}
            sx={iconBtnSx(gridSnap)}
          >
            <Grid3x3 size={16} />
          </IconButton>
        </Tooltip>

        <Divider flexItem sx={{ my: 0.25 }} />

        {/* Screenshot */}
        <Tooltip
          title={screenshotFeedback ? "Saved!" : "Download screenshot"}
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
