# LLM Agent Guide for Responsive Viewer

## Project Overview
This is a Next.js 16 app providing a multi-device responsive design viewer. Users can preview any URL across multiple simulated device screens simultaneously with synchronized scrolling.

## Key Architecture Decisions

### State Management
- **ViewerProvider** (`components/viewer/viewer-provider.tsx`): React Context + useReducer for global state
- State includes: URL, viewports array, layout mode, canvas transform, scroll position
- Persisted to localStorage under key `responsive-viewer-state`

### Viewport System
- Each viewport has: id, deviceId, position (x, y), dimensions, orientation
- Device presets in `lib/viewer/device-presets.ts` - extend here for new devices
- Custom viewports use deviceId format: `custom-${width}x${height}`

### Canvas System
- `use-canvas.ts` hook handles pan/zoom with pointer events
- Space+Drag or middle-mouse for panning
- Ctrl/Cmd+scroll for zooming towards cursor
- CSS transforms applied to canvas container

### Event Synchronization
- Uses postMessage API for cross-iframe communication
- Events synced: scroll, mouse position, click, hover, navigation
- All positions stored as percentages (0-1) for device-agnostic sync
- `broadcastScroll/Mouse/Click/Hover/Navigation()` functions in provider
- Sync settings stored in state and toggleable via toolbar panel
- **Important**: Full sync only works for same-origin sites (localhost)
- `createSyncedIframeHtml()` in viewport-frame.tsx generates the sync wrapper script

## Adding Features

### New Device Preset
Add to `DEVICE_PRESETS` array in `lib/viewer/device-presets.ts`:
```ts
{ id: 'device-id', name: 'Display Name', category: 'phone', width: 390, height: 844 }
```

### New Toolbar Action
Add button in `components/viewer/toolbar.tsx`, use `useViewer()` hook for state access.

### Extending Viewport Frame
Modify `components/viewer/viewport-frame.tsx` - handles drag, resize, iframe loading states.

## Common Tasks

- **Change default URL**: Update `initialState.url` in `viewer-provider.tsx`
- **Adjust zoom limits**: Modify `minScale`/`maxScale` in `use-canvas.ts`
- **Add keyboard shortcuts**: Add handlers in `useCanvas` hook's useEffect

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui components
- No external drag/drop libraries - native pointer events
