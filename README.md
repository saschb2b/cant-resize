# Responsive Viewer IDE

A multi-device responsive design viewer for testing web applications across different screen sizes simultaneously. All viewports are synchronized for scroll events, allowing developers to preview their designs on multiple devices at once.

## Features

- **Multi-Device Preview**: Add multiple device viewports (phones, tablets, desktops) to preview any URL
- **Device Presets**: Common device dimensions including iPhone, Pixel, iPad, Galaxy, MacBook, and desktop sizes
- **Custom Dimensions**: Create viewports with any custom width/height
- **Dual Layout Modes**:
  - **Freeform Canvas**: Infinite pan/zoom canvas with draggable, resizable device frames
  - **Grid Layout**: Auto-arranged grid view for quick comparison
- **Synchronized Scrolling**: Scroll position syncs across all viewports (percentage-based)
- **Persistent State**: Layout and device configuration saved to localStorage

## Architecture

```
/app/page.tsx                         # Main viewer application
/lib/viewer/
  types.ts                            # TypeScript types (Device, Viewport, etc.)
  device-presets.ts                   # Device dimensions catalog
  use-canvas.ts                       # Pan/zoom/drag hook for freeform canvas
  use-viewport-sync.ts                # Scroll synchronization hook
/components/viewer/
  viewer-provider.tsx                 # React Context for global state
  canvas.tsx                          # Infinite canvas with device frames
  viewport-frame.tsx                  # Individual device frame (draggable, resizable)
  toolbar.tsx                         # URL input, layout toggle, zoom controls
  device-picker.tsx                   # Device selection dialog
  grid-layout.tsx                     # Grid mode layout
```

## Usage

1. Enter a URL in the toolbar and click "Go"
2. Click "Add Device" to add device viewports
3. Switch between Freeform (drag/zoom) and Grid (auto-layout) modes
4. Drag device frames to reposition, resize using corner handles
5. Use Space+Drag or middle-mouse to pan the canvas
6. Scroll/Ctrl+scroll to zoom

## Limitations

- Cross-origin iframes: Some websites block iframe embedding via X-Frame-Options headers
- Scroll sync works best with same-origin URLs (localhost development)

## Development

```bash
pnpm install
pnpm dev
```
