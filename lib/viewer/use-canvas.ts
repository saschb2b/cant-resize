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

  // Keep a mutable ref of the latest transform so handlers don't need it
  // in their dependency arrays. This avoids recreating handlers every frame.
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const onChangeRef = useRef(onTransformChange);
  onChangeRef.current = onTransformChange;

  const limitsRef = useRef({ minScale, maxScale });
  limitsRef.current = { minScale, maxScale };

  // Stable wheel handler — never recreates
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const t = transformRef.current;
    const { minScale: min, maxScale: max } = limitsRef.current;

    if (e.ctrlKey || e.metaKey) {
      // Multiplicative zoom towards cursor — feels consistent at every level
      const zoomFactor = Math.pow(0.995, e.deltaY);
      const newScale = Math.min(max, Math.max(min, t.scale * zoomFactor));

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleFactor = newScale / t.scale;

        onChangeRef.current({
          x: mouseX - (mouseX - t.x) * scaleFactor,
          y: mouseY - (mouseY - t.y) * scaleFactor,
          scale: newScale,
        });
      }
    } else {
      // Pan
      onChangeRef.current({
        ...t,
        x: t.x - e.deltaX,
        y: t.y - e.deltaY,
      });
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isSpacePressed],
  );

  // Stable pan handler — reads transform from ref
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      const t = transformRef.current;
      onChangeRef.current({
        ...t,
        x: t.x + deltaX,
        y: t.y + deltaY,
      });
    },
    [isPanning],
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

  // Attach wheel listener once — handleWheel is stable
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
