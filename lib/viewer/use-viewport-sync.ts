"use client";

import { useEffect, useCallback, useRef } from "react";
import type { SyncMessage } from "./types";

interface UseViewportSyncOptions {
  viewportId: string;
  onScroll?: (position: number, sourceId: string) => void;
  onNavigate?: (url: string, sourceId: string) => void;
}

export function useViewportSync(options: UseViewportSyncOptions) {
  const { viewportId, onScroll, onNavigate } = options;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isReceivingSync = useRef(false);

  // Handle messages from iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const sourceId = event.data.sourceId;
      if (sourceId === viewportId) return; // Ignore own messages

      switch (event.data.type) {
        case "SCROLL":
          if (event.data.scrollY !== undefined && onScroll) {
            onScroll(event.data.scrollY, sourceId ?? "unknown");
          }
          break;
        case "NAVIGATE":
          if (event.data.url && onNavigate) {
            onNavigate(event.data.url, sourceId ?? "unknown");
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [viewportId, onScroll, onNavigate]);

  // Send scroll position to other viewports
  const broadcastScroll = useCallback(
    (position: number) => {
      if (isReceivingSync.current) return;

      const message: SyncMessage = {
        type: "SCROLL",
        scrollY: position,
        sourceId: viewportId,
      };

      // Post to parent (main app)
      window.parent.postMessage(message, "*");
    },
    [viewportId],
  );

  // Receive scroll commands
  const handleScrollCommand = useCallback((position: number) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    isReceivingSync.current = true;
    iframe.contentWindow.postMessage(
      { type: "SCROLL_TO", scrollY: position },
      "*",
    );

    // Reset flag after a short delay
    setTimeout(() => {
      isReceivingSync.current = false;
    }, 100);
  }, []);

  return {
    iframeRef,
    broadcastScroll,
    handleScrollCommand,
  };
}

// Script to inject into same-origin iframes for full sync support
export const SYNC_INJECTION_SCRIPT = `
<script>
(function() {
  const viewportId = window.frameElement?.dataset?.viewportId || 'unknown';
  let lastScrollY = 0;
  let isReceivingScroll = false;
  
  // Report scroll position to parent
  function reportScroll() {
    if (isReceivingScroll) return;
    const scrollY = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (Math.abs(scrollY - lastScrollY) > 0.001) {
      lastScrollY = scrollY;
      window.parent.postMessage({ 
        type: 'SCROLL', 
        scrollY: scrollY,
        sourceId: viewportId 
      }, '*');
    }
  }
  
  // Listen for scroll commands
  window.addEventListener('message', function(e) {
    if (e.data?.type === 'SCROLL_TO' && typeof e.data.scrollY === 'number') {
      isReceivingScroll = true;
      const targetY = e.data.scrollY * (document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: targetY, behavior: 'instant' });
      setTimeout(function() { isReceivingScroll = false; }, 50);
    }
  });
  
  // Report ready state
  window.parent.postMessage({ type: 'READY', sourceId: viewportId }, '*');
  
  // Throttled scroll listener
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(reportScroll, 16);
  }, { passive: true });
})();
</script>
`;
