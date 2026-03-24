"use client";

import { useCallback, useRef, useState } from "react";

interface UseViewportDragOptions {
  viewportId: string;
  viewportX: number;
  viewportY: number;
  canvasScale: number;
  isGridMode: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export function useViewportDrag(options: UseViewportDragOptions) {
  const {
    viewportId,
    viewportX,
    viewportY,
    canvasScale,
    isGridMode,
    onSelect,
    onMove,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, viewportX: 0, viewportY: 0 });

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (isGridMode) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      onSelect(viewportId);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        viewportX,
        viewportY,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isGridMode, viewportId, viewportX, viewportY, onSelect],
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaX = (e.clientX - dragStart.current.x) / canvasScale;
      const deltaY = (e.clientY - dragStart.current.y) / canvasScale;

      onMove(viewportId, dragStart.current.viewportX + deltaX, dragStart.current.viewportY + deltaY);
    },
    [isDragging, canvasScale, viewportId, onMove],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
