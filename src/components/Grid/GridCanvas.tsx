"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const GRID_SIZE = 1500; // logical pixels
const MIN_BLOCK = 10;

interface GridCanvasProps {
  onSelectEmpty: () => void;
  onSelectCrown: () => void;
  onSelectPlot: () => void;
}

export function GridCanvas({
  onSelectEmpty,
  onSelectCrown,
  onSelectPlot,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state
  const [scale, setScale] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Crown roughly in the center (example 120×120)
  const CROWN = { x: 690, y: 690, w: 120, h: 120 };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Apply camera
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw subtle grid lines (only when zoomed in enough)
    if (scale > 0.6) {
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1 / scale;
      for (let i = 0; i <= GRID_SIZE; i += MIN_BLOCK) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GRID_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GRID_SIZE, i);
        ctx.stroke();
      }
    }

    // Background of the logical board
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);

    // The Crown zone
    ctx.fillStyle = "rgba(250, 204, 21, 0.15)"; // amber
    ctx.fillRect(CROWN.x, CROWN.y, CROWN.w, CROWN.h);
    ctx.strokeStyle = "rgba(250, 204, 21, 0.6)";
    ctx.lineWidth = 3 / scale;
    ctx.strokeRect(CROWN.x, CROWN.y, CROWN.w, CROWN.h);

    // Crown label
    ctx.fillStyle = "rgba(250, 204, 21, 0.9)";
    ctx.font = `${14 / scale}px sans-serif`;
    ctx.fillText("👑 THE CROWN", CROWN.x + 8, CROWN.y + 20);

    // Placeholder text for empty board
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = `${18 / scale}px sans-serif`;
    ctx.fillText("billboard.wtf / 2026", 40, 60);
    ctx.font = `${12 / scale}px sans-serif`;
    ctx.fillText("Zoom • Pan • Click empty space to claim", 40, 85);

    ctx.restore();
  }, [scale, offset]);

  // Resize canvas to container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Center the board initially
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const initialScale = Math.min(
      (rect.width * 0.85) / GRID_SIZE,
      (rect.height * 0.85) / GRID_SIZE,
      0.6
    );
    setScale(initialScale);
    setOffset({
      x: (rect.width - GRID_SIZE * initialScale) / 2,
      y: (rect.height - GRID_SIZE * initialScale) / 2,
    });
  }, []);

  // Pointer handlers
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => {
      const next = Math.min(Math.max(s * delta, 0.15), 8);
      return next;
    });
  };

  const onClick = (e: React.MouseEvent) => {
    // Very basic hit test for now — will be improved
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offset.x) / scale;
    const my = (e.clientY - rect.top - offset.y) / scale;

    if (
      mx >= CROWN.x &&
      mx <= CROWN.x + CROWN.w &&
      my >= CROWN.y &&
      my <= CROWN.y + CROWN.h
    ) {
      onSelectCrown();
      return;
    }

    if (mx >= 0 && mx <= GRID_SIZE && my >= 0 && my <= GRID_SIZE) {
      onSelectEmpty();
    }
  };

  return (
    <div ref={containerRef} className="h-full w-full touch-none">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onClick={onClick}
      />
    </div>
  );
}
