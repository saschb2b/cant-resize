"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ButtonBase from "@mui/material/ButtonBase";
import { Plus, Smartphone, Tablet, Monitor, Ruler } from "lucide-react";
import { useViewer } from "./viewer-provider";
import { getDevicesByCategory } from "@/lib/viewer/device-presets";
import type { DevicePreset } from "@/lib/viewer/types";

function DeviceButton({
  device,
  onSelect,
}: {
  device: DevicePreset;
  onSelect: (id: string) => void;
}) {
  return (
    <ButtonBase
      onClick={() => onSelect(device.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        p: 1.5,
        borderRadius: 2,
        textAlign: "left",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        {device.category === "phone" && <Smartphone size={20} />}
        {device.category === "tablet" && <Tablet size={20} />}
        {device.category === "desktop" && <Monitor size={20} />}
        {device.category === "custom" && <Ruler size={20} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {device.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {device.width} x {device.height}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function DeviceList({
  devices,
  onSelect,
}: {
  devices: DevicePreset[];
  onSelect: (id: string) => void;
}) {
  return (
    <Box sx={{ maxHeight: 300, overflow: "auto", px: 0.5, py: 0.5 }}>
      {devices.map((device) => (
        <DeviceButton key={device.id} device={device} onSelect={onSelect} />
      ))}
    </Box>
  );
}

export function DevicePicker() {
  const { addViewport, addCustomViewport } = useViewer();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customWidth, setCustomWidth] = useState("1280");
  const [customHeight, setCustomHeight] = useState("720");
  const [customName, setCustomName] = useState("");

  const handleSelect = (deviceId: string) => {
    addViewport(deviceId);
    setOpen(false);
  };

  const handleAddCustom = () => {
    const width = parseInt(customWidth, 10);
    const height = parseInt(customHeight, 10);

    if (width > 0 && height > 0) {
      addCustomViewport(width, height);
      setOpen(false);
    }
  };

  const phones = getDevicesByCategory("phone");
  const tablets = getDevicesByCategory("tablet");
  const desktops = getDevicesByCategory("desktop");

  return (
    <>
      <Button
        variant="contained"
        size="small"
        startIcon={<Plus size={16} />}
        onClick={() => setOpen(true)}
      >
        Add Device
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Device Viewport</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, v: number) => setTabValue(v)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab
              icon={<Smartphone size={14} />}
              iconPosition="start"
              label="Phones"
            />
            <Tab
              icon={<Tablet size={14} />}
              iconPosition="start"
              label="Tablets"
            />
            <Tab
              icon={<Monitor size={14} />}
              iconPosition="start"
              label="Desktop"
            />
            <Tab
              icon={<Ruler size={14} />}
              iconPosition="start"
              label="Custom"
            />
          </Tabs>

          {tabValue === 0 && (
            <DeviceList devices={phones} onSelect={handleSelect} />
          )}
          {tabValue === 1 && (
            <DeviceList devices={tablets} onSelect={handleSelect} />
          )}
          {tabValue === 2 && (
            <DeviceList devices={desktops} onSelect={handleSelect} />
          )}
          {tabValue === 3 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 0.5 }}
            >
              <TextField
                label="Device Name (optional)"
                placeholder="My Custom Device"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                size="small"
                fullWidth
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Width (px)"
                  type="number"
                  slotProps={{ htmlInput: { min: 100, max: 5000 } }}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Height (px)"
                  type="number"
                  slotProps={{ htmlInput: { min: 100, max: 5000 } }}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  size="small"
                />
              </Box>
              <Button variant="contained" onClick={handleAddCustom} fullWidth>
                Add Custom Device
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
