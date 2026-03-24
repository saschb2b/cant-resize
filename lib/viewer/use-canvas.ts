"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { CanvasTransform } from "./types";

interface UseCanvasOptions {
  transform: CanvasTransform;
  onTransformChange: (transform: CanvasTransform) => void;
  minScale?: number;
  maxScale?: number;
}

export function useCanvas(options: UseCanvasOptions) {
  const {
    transform,
    onTransformChange,
    minScale = 0.1,
    maxScale = 2,
  } = options;

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, transform.scale + delta),
        );

        // Zoom towards cursor
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleFactor = newScale / transform.scale;

          onTransformChange({
            x: mouseX - (mouseX - transform.x) * scaleFactor,
            y: mouseY - (mouseY - transform.y) * scaleFactor,
            scale: newScale,
          });
        }
      } else {
        // Pan
        onTransformChange({
          ...transform,
          x: transform.x - e.deltaX,
          y: transform.y - e.deltaY,
        });
      }
    },
    [transform, minScale, maxScale, onTransformChange],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        // Middle mouse or Space + Left click
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isSpacePressed],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        onTransformChange({
          ...transform,
          x: transform.x + deltaX,
          y: transform.y + deltaY,
        });
      }
    },
    [isPanning, transform, onTransformChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Attach wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return {
    containerRef,
    transform,
    isPanning,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
