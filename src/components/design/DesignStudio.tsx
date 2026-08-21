"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BoardEntry,
  Creative,
  Layer,
  TextLayer,
  ImageLayer,
  StickerLayer,
} from "@/lib/types";
import { saveCreative, lockAndPublish, getState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { BOARD_WIDTH, BOARD_OFFSET_Y, FACE } from "@/lib/boardGeometry";
import {
  FONTS,
  STICKERS,
  NOTES,
  uid,
  rasterizeFace,
} from "./studioHelpers";

export function DesignStudio({ entry }: { entry: BoardEntry }) {
  const router = useRouter();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [brand, setBrand] = useState(entry.brand);
  const [url, setUrl] = useState(entry.url ?? "");
  const [xHandle, setXHandle] = useState("");
  const [showNotes, setShowNotes] = useState(true);
  const faceRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef<{ x: number; y: number; lx: number; ly: number } | null>(null);

  useEffect(() => {
    if (entry.creative?.layers?.length) {
      setLayers(entry.creative.layers);
      setShowNotes(false);
    }
  }, [entry.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const creative: Creative = useMemo(
    () => ({ layers, updatedAt: new Date().toISOString() }),
    [layers]
  );
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const empty = layers.length === 0;

  const updateLayer = useCallback((lid: string, patch: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === lid ? ({ ...l, ...patch } as Layer) : l))
    );
  }, []);

  const removeLayer = (lid: string) => {
    setLayers((p) => p.filter((x) => x.id !== lid));
    if (selectedId === lid) setSelectedId(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        removeLayer(selectedId);
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setPlusOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.stopPropagation();
    setSelectedId(layerId);
    setShowNotes(false);
    const layer = layers.find((l) => l.id === layerId);
    if (!layer || !faceRef.current) return;
    dragStart.current = { x: e.clientX, y: e.clientY, lx: layer.x, ly: layer.y };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !selectedId || !faceRef.current) return;
    const rect = faceRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    updateLayer(selectedId, {
      x: Math.max(-5, Math.min(85, dragStart.current.lx + dx)),
      y: Math.max(-5, Math.min(85, dragStart.current.ly + dy)),
    });
  };

  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const addText = () => {
    const layer: TextLayer = {
      id: uid(),
      type: "text",
      text: brand.trim() || "Your text",
      x: 10, y: 30, w: 80, h: 40, z: layers.length + 1,
      fontFamily: "system-ui, sans-serif",
      fontSize: 6,
      color: "#111111",
      fontWeight: 700,
      fontStyle: "normal",
      align: "center",
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
    setShowNotes(false);
  };

  const addSticker = (emoji: string) => {
    const layer: StickerLayer = {
      id: uid(),
      type: "sticker",
      emoji,
      x: 40, y: 30, w: 20, h: 35, z: layers.length + 1,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
    setShowNotes(false);
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const layer: ImageLayer = {
        id: uid(),
        type: "image",
        src: String(reader.result),
        x: 10, y: 5, w: 80, h: 90, z: layers.length + 1,
      };
      setLayers((p) => [...p, layer]);
      setSelectedId(layer.id);
      setPlusOpen(false);
      setShowNotes(false);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    saveCreative(entry.id, creative);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const lock = async () => {
    if (!brand.trim() || !faceRef.current) return;
    const flat = await rasterizeFace(faceRef.current, layers);
    const next: Creative = {
      ...creative,
      layers: flat
        ? [{ id: "flat", type: "image", src: flat, x: 0, y: 0, w: 100, h: 100, z: 1 }]
        : creative.layers,
      updatedAt: new Date().toISOString(),
    };
    try {
      const s = getState();
      const e = s.entries.find((x) => x.id === entry.id);
      if (e) {
        e.brand = brand.trim();
        e.url = url.trim() && url.trim() !== "https://" ? url.trim() : undefined;
      }
    } catch {
      // ignore
    }
    saveCreative(entry.id, next);
    lockAndPublish(entry.id);
    router.push("/");
  };

  const shareOnX = () => {
    const handle = xHandle.replace(/^@/, "").trim();
    const lines = [
      `${brand.trim() || "My brand"} is on the board.`,
      "https://billboard.wtf",
      handle ? `@${handle}` : "",
    ].filter(Boolean);
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
      {/* Exact same board placement as homepage LiveBoard */}
      <div className="absolute inset-0 flex items-end justify-center">
        <div
          className="relative"
          style={{
            width: BOARD_WIDTH,
            transform: `translateY(${BOARD_OFFSET_Y}px)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash/board-frame.png"
            alt=""
            className="pointer-events-none relative z-10 block h-auto w-full select-none"
            draggable={false}
          />

          <div
            ref={faceRef}
            className="absolute z-20 overflow-hidden"
            style={{
              left: FACE.left,
              top: FACE.top,
              width: FACE.width,
              height: FACE.height,
            }}
            onClick={() => {
              setSelectedId(null);
              setPlusOpen(false);
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {layers
              .slice()
              .sort((a, b) => a.z - b.z)
              .map((layer) => (
                <div
                  key={layer.id}
                  className={`absolute ${
                    selectedId === layer.id
                      ? "outline outline-2 outline-sky-400 outline-offset-[-1px]"
                      : ""
                  }`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    width: `${layer.w}%`,
                    height: `${layer.h}%`,
                    zIndex: layer.z,
                    cursor:
                      dragging && selectedId === layer.id ? "grabbing" : "grab",
                  }}
                  onPointerDown={(e) => onPointerDown(e, layer.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {layer.type === "text" && (
                    <div
                      className="flex h-full w-full items-center px-[2%] leading-tight"
                      style={{
                        justifyContent:
                          layer.align === "center"
                            ? "center"
                            : layer.align === "right"
                              ? "flex-end"
                              : "flex-start",
                        fontFamily: layer.fontFamily,
                        fontSize: `${layer.fontSize}vh`,
                        color: layer.color,
                        fontWeight: layer.fontWeight,
                        fontStyle: layer.fontStyle,
                        textAlign: layer.align,
                        wordBreak: "break-word",
                        pointerEvents: "none",
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                  {layer.type === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={layer.src}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {layer.type === "sticker" && (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        fontSize: "min(8vw, 12vh)",
                        pointerEvents: "none",
                      }}
                    >
                      {layer.emoji}
                    </div>
                  )}
                  {selectedId === layer.id && (
                    <div
                      className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize rounded-sm bg-sky-400"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startW = layer.w;
                        const startH = layer.h;
                        const face = faceRef.current;
                        if (!face) return;
                        const onMove = (ev: PointerEvent) => {
                          const r = face.getBoundingClientRect();
                          const dw = ((ev.clientX - startX) / r.width) * 100;
                          const dh = ((ev.clientY - startY) / r.height) * 100;
                          updateLayer(layer.id, {
                            w: Math.max(8, Math.min(100, startW + dw)),
                            h: Math.max(8, Math.min(100, startH + dh)),
                          });
                        };
                        const onUp = () => {
                          window.removeEventListener("pointermove", onMove);
                          window.removeEventListener("pointerup", onUp);
                        };
                        window.addEventListener("pointermove", onMove);
                        window.addEventListener("pointerup", onUp);
                      }}
                    />
                  )}
                </div>
              ))}

            {empty && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlusOpen((v) => !v);
                }}
                className="absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-neutral-400/80 text-3xl text-neutral-500 transition hover:border-neutral-600 hover:bg-black/5 hover:text-neutral-800"
                aria-label="Add content"
              >
                +
              </button>
            )}

            {plusOpen && (
              <div
                className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" onClick={addText}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Text</button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Image</button>
                <button type="button" onClick={() => { setPlusOpen(false); setSelectedId("__stickers__"); }}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Sticker</button>
              </div>
            )}

            {showNotes && empty && NOTES.map((n, i) => (
              <div key={i}
                className="pointer-events-none absolute z-20 max-w-[160px] rounded-sm px-3 py-2.5 text-[12px] font-medium leading-snug text-neutral-900 shadow-lg ring-1 ring-black/10"
                style={{ left: n.x, top: n.y, transform: `rotate(${n.rot}deg)`, background: n.bg }}>
                {n.text}
              </div>
            ))}
          </div>

          {/* Listing stacked under the left side of the board */}
          <div className="absolute left-0 top-[58%] z-30 w-[min(260px,32%)] space-y-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/40">Name</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none backdrop-blur focus:border-white/35" placeholder="Brand" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/40">URL</span>
              <input value={url} onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none backdrop-blur focus:border-white/35" placeholder="https://" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/40">X</span>
              <input value={xHandle} onChange={(e) => setXHandle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none backdrop-blur focus:border-white/35" placeholder="@you" />
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={shareOnX}
                className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-white/80 transition hover:border-white/40">Share on X</button>
              <button type="button" onClick={saveDraft}
                className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-white/80 transition hover:border-white/40">{savedFlash ? "Saved" : "Save"}</button>
              <button type="button" onClick={lock} disabled={!brand.trim()}
                className="rounded-full bg-white px-4 py-1.5 text-[11px] font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40">Lock & go live</button>
            </div>
          </div>
        </div>
      </div>

      {selected && selected.id !== "__stickers__" && (
        <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
          {selected.type === "text" && (
            <>
              <input value={selected.text} onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                className="min-w-[160px] rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-sm text-white outline-none" />
              <input type="range" min={1.5} max={14} step={0.5} value={selected.fontSize}
                onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) })} className="w-24" />
              <input type="color" value={selected.color}
                onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent" />
              <select value={selected.fontFamily}
                onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
                className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white outline-none">
                {FONTS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
              </select>
            </>
          )}
          {selected.type === "sticker" && (
            <div className="flex flex-wrap gap-1">
              {STICKERS.map((e) => (
                <button key={e} type="button" onClick={() => updateLayer(selected.id, { emoji: e })}
                  className="rounded-lg bg-white/5 px-2 py-1 text-lg hover:bg-white/15">{e}</button>
              ))}
            </div>
          )}
          <button type="button" onClick={() => removeLayer(selected.id)}
            className="ml-1 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">Delete</button>
        </div>
      )}

      {selectedId === "__stickers__" && (
        <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-white/15 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
          {STICKERS.map((e) => (
            <button key={e} type="button" onClick={() => addSticker(e)}
              className="rounded-lg bg-white/5 px-2 py-1 text-xl hover:bg-white/15">{e}</button>
          ))}
          <button type="button" onClick={() => setSelectedId(null)}
            className="ml-2 text-xs text-white/40 hover:text-white">Close</button>
        </div>
      )}

      {!empty && (
        <button type="button" onClick={() => setPlusOpen((v) => !v)}
          className="fixed bottom-8 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-neutral-900 shadow-lg transition hover:scale-105"
          aria-label="Add">+</button>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
    </div>
  );
}
