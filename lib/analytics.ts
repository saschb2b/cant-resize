/**
 * Thin wrapper around Umami's `umami.track()` for type-safe custom events.
 *
 * @see https://umami.is/docs/tracker-functions
 */

interface SearchOpenedData {
  trigger: "hotkey" | "button";
}

interface SearchSelectedData {
  query: string;
  selectedTitle: string;
  selectedHref: string;
}

interface SourceLinkClickedData {
  challengeId: string;
  category: string;
  label: string;
}

interface ViewerUrlLoadedData {
  url: string;
}

interface DeviceAddedData {
  device: string;
  width: number;
  height: number;
}

interface NotFoundVisitedData {
  path: string;
}

interface EventMap {
  "search-opened": SearchOpenedData;
  "search-selected": SearchSelectedData;
  "source-link-clicked": SourceLinkClickedData;
  "viewer-url-loaded": ViewerUrlLoadedData;
  "device-added": DeviceAddedData;
  "404-visited": NotFoundVisitedData;
}

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export function trackEvent<K extends keyof EventMap>(
  event: K,
  data: EventMap[K],
): void {
  window.umami?.track(event, data as unknown as Record<string, unknown>);
}
