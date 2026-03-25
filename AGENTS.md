# LLM Agent Guide for Can't Resize

## Project Overview

Next.js 16 app with two main sections:

1. **Viewer** (`/canvas`): Multi-device responsive design viewer with synced interactions
2. **Learn** (`/learn`): 82 responsive design patterns in Avoid/Prefer format across 16 categories

## Key Architecture

### State Management

- **ViewerProvider** (`components/viewer/viewer-provider.tsx`): Context + useReducer
- State: URL, viewports array, layout mode, canvas transform, scroll position, sync settings
- Persisted to localStorage under `responsive-viewer-state`

### Viewer Canvas

- `canvas-overlay.tsx`: Floating widget pills (Miro-style) over full-bleed canvas
- `use-canvas.ts`: Pan/zoom with pointer events, multiplicative zoom scaling
- `canvas.tsx`: Freeform mode + GridCanvas with drag-to-reorder
- `viewport-frame.tsx`: Device frame with drag, resize, iframe sync, click-to-select overlay

### Learn Section

- Challenge content in `lib/learn/challenges/` (one file per category)
- Categories defined in `lib/learn/categories.ts`
- Server-rendered with Shiki syntax highlighting (TSX + CSS, dual light/dark themes)
- Sidebar navigation on desktop, horizontal scroll on mobile

### Search

- `search-palette.tsx`: Ctrl+K dialog with fuse.js fuzzy search
- `search-items.ts`: Static index of pages, categories, and challenges with code keyword extraction

### Analytics

- `lib/analytics.ts`: Type-safe wrapper around Umami's `window.umami.track()`
- Events: search-opened, search-selected, source-link-clicked, viewer-url-loaded, device-added, 404-visited
- Tracking restricted to `cant-resize.saschb2b.com` via `data-domains`

## Adding Content

### New Challenge

Add to the relevant file in `lib/learn/challenges/`:

```ts
{
  id: "xx-001",
  category: "category-slug",
  difficulty: "easy" | "medium" | "hard",
  title: "Short title",
  badCode: `...`,
  goodCode: `...`,
  lang: "tsx" | "css",  // optional, defaults to tsx
  correctSide: "right",
  explanationCorrect: "Why the good code is better.",
  explanationWrong: "Why the bad code is problematic.",
  sourceUrl: "https://...",
  sourceLabel: "Source: Description",
}
```

### New Category

1. Add slug to `ChallengeCategory` type in `lib/learn/types.ts`
2. Add to `CATEGORY_ORDER`, `CATEGORY_LABELS`, `CATEGORY_DESCRIPTIONS`, `CATEGORY_SECTIONS` in `lib/learn/categories.ts`
3. Create challenge file in `lib/learn/challenges/`
4. Import and spread in `lib/learn/challenges/index.ts`

### New Device Preset

Add to `DEVICE_PRESETS` in `lib/viewer/device-presets.ts`:

```ts
{ id: "device-id", name: "Display Name", category: "phone", width: 390, height: 844 }
```

## Tech Stack

- Next.js 16 (App Router, View Transitions)
- React 19, TypeScript
- Material UI 7 + Emotion
- Shiki (syntax highlighting), Fuse.js (search)
- pnpm, ESLint, Prettier
