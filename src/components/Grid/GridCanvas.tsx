"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const GRID_SIZE = 1500;
const MIN_BLOCK = 10;

interface GridCanvasProps {
  onSelectEmpty: (selection?: { x: number; y: number; w: number; h: number }) => void;
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

  const [scale, setScale] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const lastPos = useRef({ x: 0, y: 0 });
  const spaceHeld = useRef(false);

  // Crown in the centre
  const CROWN = { x: 690, y: 690, w: 120, h: 120 };

  const snap = (v: number) => Math.floor(v / MIN_BLOCK) * MIN_BLOCK;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Full-screen dark background (no frame)
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Soft board background that fills the logical area
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Very subtle grid (only when zoomed in)
    if (scale > 0.45) {
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
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

    // Hover highlight for a single 10×10 cell
    if (hoverCell && !isSelecting) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(hoverCell.x, hoverCell.y, MIN_BLOCK, MIN_BLOCK);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeRect(hoverCell.x, hoverCell.y, MIN_BLOCK, MIN_BLOCK);
    }

    // Active drag selection
    if (selection) {
      const x = Math.min(selection.startX, selection.endX);
      const y = Math.min(selection.startY, selection.endY);
      const w = Math.abs(selection.endX - selection.startX) || MIN_BLOCK;
      const h = Math.abs(selection.endY - selection.startY) || MIN_BLOCK;

      ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(x, y, w, h);

      // Size label
      const cellsX = Math.max(1, Math.round(w / MIN_BLOCK));
      const cellsY = Math.max(1, Math.round(h / MIN_BLOCK));
      const px = cellsX * cellsY * 100;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `${12 / scale}px system-ui`;
      ctx.fillText(`${cellsX * 10}×${cellsY * 10} · ${px} px`, x + 4, y - 6);
    }

    // The Crown
    ctx.fillStyle = "rgba(250, 204, 21, 0.12)";
    ctx.fillRect(CROWN.x, CROWN.y, CROWN.w, CROWN.h);
    ctx.strokeStyle = "rgba(250, 204, 21, 0.55)";
    ctx.lineWidth = 2.5 / scale;
    ctx.strokeRect(CROWN.x, CROWN.y, CROWN.w, CROWN.h);

    ctx.fillStyle = "rgba(250, 204, 21, 0.85)";
    ctx.font = `${13 / scale}px system-ui`;
    ctx.fillText("👑 THE CROWN", CROWN.x + 10, CROWN.y + 22);

    // Gentle centre label when empty
    if (scale < 0.7) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = `${16 / scale}px system-ui`;
      ctx.fillText("billboard.wtf / 2026", 48, 56);
      ctx.font = `${11 / scale}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillText("Drag to select  ·  Scroll to zoom  ·  Space + drag to pan", 48, 78);
    }

    ctx.restore();
  }, [scale, offset, hoverCell, selection, isSelecting]);

  // Resize + initial framing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Fit board to screen on first load
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const padding = 0.92;
    const s = Math.min(
      (rect.width * padding) / GRID_SIZE,
      (rect.height * padding) / GRID_SIZE
    );
    setScale(s);
    setOffset({
      x: (rect.width - GRID_SIZE * s) / 2,
      y: (rect.height - GRID_SIZE * s) / 2,
    });
  }, []);

  // Keyboard: space to pan
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spaceHeld.current = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceHeld.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const screenToGrid = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - offset.x) / scale;
    const y = (clientY - rect.top - offset.y) / scale;
    return { x, y };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const { x, y } = screenToGrid(e.clientX, e.clientY);
    lastPos.current = { x: e.clientX, y: e.clientY };

    // Space or middle mouse = pan
    if (spaceHeld.current || e.button === 1) {
      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Left click starts selection
    if (e.button === 0) {
      // Crown hit?
      if (
        x >= CROWN.x &&
        x <= CROWN.x + CROWN.w &&
        y >= CROWN.y &&
        y <= CROWN.y + CROWN.h
      ) {
        onSelectCrown();
        return;
      }

      if (x >= 0 && x <= GRID_SIZE && y >= 0 && y <= GRID_SIZE) {
        const sx = snap(x);
        const sy = snap(y);
        setIsSelecting(true);
        setSelection({ startX: sx, startY: sy, endX: sx + MIN_BLOCK, endY: sy + MIN_BLOCK });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { x, y } = screenToGrid(e.clientX, e.clientY);

    // Hover cell
    if (!isSelecting && !isPanning) {
      if (x >= 0 && x <= GRID_SIZE && y >= 0 && y <= GRID_SIZE) {
        setHoverCell({ x: snap(x), y: snap(y) });
      } else {
        setHoverCell(null);
      }
    }

    if (isPanning) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (isSelecting && selection) {
      const ex = snap(x) + MIN_BLOCK;
      const ey = snap(y) + MIN_BLOCK;
      setSelection((s) =>
        s
          ? {
              ...s,
              endX: Math.max(MIN_BLOCK, Math.min(GRID_SIZE, ex)),
              endY: Math.max(MIN_BLOCK, Math.min(GRID_SIZE, ey)),
            }
          : null
      );
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isSelecting && selection) {
      const x = Math.min(selection.startX, selection.endX);
      const y = Math.min(selection.startY, selection.endY);
      const w = Math.max(MIN_BLOCK, Math.abs(selection.endX - selection.startX));
      const h = Math.max(MIN_BLOCK, Math.abs(selection.endY - selection.startY));

      onSelectEmpty({ x, y, w, h });
      setSelection(null);
    }
    setIsSelecting(false);
    setIsPanning(false);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Zoom toward cursor
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setScale((s) => {
      const next = Math.min(Math.max(s * delta, 0.12), 6);
      const ratio = next / s;
      setOffset((o) => ({
        x: mx - (mx - o.x) * ratio,
        y: my - (my - o.y) * ratio,
      }));
      return next;
    });
  };

  return (
    <div ref={containerRef} className="h-full w-full touch-none select-none">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          setHoverCell(null);
          setIsPanning(false);
        }}
        onWheel={onWheel}
      />
    </div>
  );
}
