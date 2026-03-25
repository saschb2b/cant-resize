"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { Plus, Search, Smartphone, Tablet, Monitor, Ruler } from "lucide-react";
import { useViewer } from "./viewer-provider";
import {
  DEVICE_PRESETS,
  getDevicesByCategory,
} from "@/lib/viewer/device-presets";
import type { DevicePreset } from "@/lib/viewer/types";

// Max dimension used to normalize the size preview rectangles
const MAX_DIM = Math.max(...DEVICE_PRESETS.map((d) => Math.max(d.width, d.height)));

const categoryIcon = (cat: DevicePreset["category"]) => {
  switch (cat) {
    case "phone":
      return <Smartphone size={12} />;
    case "tablet":
      return <Tablet size={12} />;
    case "desktop":
      return <Monitor size={12} />;
    default:
      return <Ruler size={12} />;
  }
};

// ── Device row ──────────────────────────────────────────────────────────────

function DeviceRow({
  device,
  selected,
  onToggle,
}: {
  device: DevicePreset;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  // Proportional size preview (max 32px tall)
  const scale = 32 / MAX_DIM;
  const previewW = Math.max(4, Math.round(device.width * scale));
  const previewH = Math.max(4, Math.round(device.height * scale));

  return (
    <Box
      component="label"
      onClick={() => onToggle(device.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        cursor: "pointer",
        transition: "background-color 0.1s",
        bgcolor: selected
          ? "rgba(var(--mui-palette-primary-mainChannel) / 0.08)"
          : "transparent",
        "&:hover": {
          bgcolor: selected
            ? "rgba(var(--mui-palette-primary-mainChannel) / 0.12)"
            : "action.hover",
        },
      }}
    >
      <Checkbox
        checked={selected}
        size="small"
        tabIndex={-1}
        sx={{ p: 0 }}
      />

      {/* Proportional size preview */}
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            border: 1.5,
            borderColor: selected ? "primary.main" : "text.disabled",
            borderRadius: 0.5,
            transition: "border-color 0.15s",
          }}
          style={{ width: previewW, height: previewH }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {device.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          fontFamily="var(--font-geist-mono), monospace"
          sx={{ fontSize: "0.65rem" }}
        >
          {device.width} &times; {device.height}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface DevicePickerProps {
  renderTrigger?: (open: () => void) => React.ReactNode;
}

export function DevicePicker({ renderTrigger }: DevicePickerProps = {}) {
  const { addViewport, addCustomViewport } = useViewer();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<
    "all" | "phone" | "tablet" | "desktop"
  >("all");

  // Custom device state
  const [customWidth, setCustomWidth] = useState("1280");
  const [customHeight, setCustomHeight] = useState("720");
  const [customName, setCustomName] = useState("");

  const phones = getDevicesByCategory("phone");
  const tablets = getDevicesByCategory("tablet");
  const desktops = getDevicesByCategory("desktop");

  // Filter + search
  const filteredDevices = useMemo(() => {
    let devices: DevicePreset[];
    if (activeFilter === "all") {
      devices = DEVICE_PRESETS;
    } else {
      devices =
        activeFilter === "phone"
          ? phones
          : activeFilter === "tablet"
            ? tablets
            : desktops;
    }

    if (!search.trim()) return devices;

    const q = search.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        `${String(d.width)}x${String(d.height)}`.includes(q) ||
        `${String(d.width)} x ${String(d.height)}`.includes(q),
    );
  }, [activeFilter, search, phones, tablets, desktops]);

  const toggleDevice = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSelected = () => {
    for (const id of selectedIds) {
      addViewport(id);
    }
    handleClose();
  };

  const handleAddCustom = () => {
    const w = parseInt(customWidth, 10);
    const h = parseInt(customHeight, 10);
    if (w > 0 && h > 0) {
      addCustomViewport(w, h, customName.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setSearch("");
      setSelectedIds(new Set());
      setActiveFilter("all");
    }, 200);
  };

  // Group devices by category for display when showing "all"
  const groupedDisplay = useMemo(() => {
    if (activeFilter !== "all") {
      return [{ label: null, devices: filteredDevices }];
    }

    const groups: { label: string | null; devices: DevicePreset[] }[] = [];
    const phoneFiltered = filteredDevices.filter((d) => d.category === "phone");
    const tabletFiltered = filteredDevices.filter(
      (d) => d.category === "tablet",
    );
    const desktopFiltered = filteredDevices.filter(
      (d) => d.category === "desktop",
    );

    if (phoneFiltered.length > 0)
      groups.push({ label: "Phones", devices: phoneFiltered });
    if (tabletFiltered.length > 0)
      groups.push({ label: "Tablets", devices: tabletFiltered });
    if (desktopFiltered.length > 0)
      groups.push({ label: "Desktop", devices: desktopFiltered });

    return groups;
  }, [activeFilter, filteredDevices]);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => setOpen(true)}
        >
          Add Device
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* Header with search */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="var(--mui-palette-text-secondary)" />
                  </InputAdornment>
                ),
                sx: { fontSize: "0.875rem" },
              },
            }}
          />

          {/* Filter chips */}
          <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, mb: 1 }}>
            {(
              [
                { value: "all", label: "All" },
                { value: "phone", label: "Phones", icon: <Smartphone size={12} /> },
                { value: "tablet", label: "Tablets", icon: <Tablet size={12} /> },
                { value: "desktop", label: "Desktop", icon: <Monitor size={12} /> },
              ] as const
            ).map((chip) => (
              <Chip
                key={chip.value}
                label={chip.label}
                icon={"icon" in chip ? chip.icon : undefined}
                size="small"
                variant={activeFilter === chip.value ? "filled" : "outlined"}
                onClick={() => setActiveFilter(chip.value)}
                sx={{
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 26,
                  borderColor:
                    activeFilter === chip.value ? "primary.main" : "divider",
                  ...(activeFilter === chip.value && {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiChip-icon": { color: "primary.contrastText" },
                  }),
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Device list */}
        <DialogContent sx={{ px: 1, py: 0.5, flex: 1, overflow: "auto" }}>
          {filteredDevices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              <Typography variant="body2">No devices match your search</Typography>
            </Box>
          ) : (
            groupedDisplay.map((group, gi) => (
              <Box key={group.label ?? gi}>
                {group.label && (
                  <Typography
                    variant="overline"
                    sx={{
                      display: "block",
                      px: 1.5,
                      pt: gi > 0 ? 1.5 : 0.5,
                      pb: 0.5,
                      color: "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {group.label}
                  </Typography>
                )}
                {group.devices.map((device) => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    selected={selectedIds.has(device.id)}
                    onToggle={toggleDevice}
                  />
                ))}
              </Box>
            ))
          )}

          {/* Custom device section */}
          <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                pb: 1,
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              Custom Size
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
              }}
            >
              <TextField
                placeholder="Width"
                type="number"
                slotProps={{ htmlInput: { min: 100, max: 5000 } }}
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                size="small"
              />
              <TextField
                placeholder="Height"
                type="number"
                slotProps={{ htmlInput: { min: 100, max: 5000 } }}
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                size="small"
              />
            </Box>
            <TextField
              placeholder="Name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddCustom}
              fullWidth
              sx={{ mt: 1 }}
            >
              Add Custom
            </Button>
          </Box>
        </DialogContent>

        {/* Footer with add button */}
        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={handleClose} size="small" sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size > 0 ? `${String(selectedIds.size)} device${selectedIds.size > 1 ? "s" : ""}` : "devices"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
