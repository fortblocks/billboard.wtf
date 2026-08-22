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
import { FONTS, STICKERS, uid, rasterizeFace } from "./studioHelpers";

const HINTS = [
  "YOUR FACE",
  "Welcome to the Billboard",
  "Everything you place",
  "This is your canvas",
  "Lock & go live",
  "When it feels iconic",
  "Make it count",
  "TAP",
];

function welcome(): TextLayer[] {
  return [
    {
      id: uid(),
      type: "text",
      text: "YOUR FACE.\nONE BRAND.",
      x: 8,
      y: 14,
      w: 84,
      h: 34,
      z: 1,
      rotation: 0,
      fontFamily: "var(--font-anton), Impact, sans-serif",
      fontSize: 5.2,
      color: "#0a0a0a",
      fontWeight: 400,
      fontStyle: "normal",
      align: "center",
    },
    {
      id: uid(),
      type: "text",
      text: "Everything you place here becomes the live poster.",
      x: 12,
      y: 54,
      w: 76,
      h: 14,
      z: 2,
      rotation: 0,
      fontFamily: "var(--font-inter), system-ui, sans-serif",
      fontSize: 1.65,
      color: "#3a3a3a",
      fontWeight: 400,
      fontStyle: "normal",
      align: "center",
    },
    {
      id: uid(),
      type: "text",
      text: "TAP  +  TO BEGIN",
      x: 22,
      y: 76,
      w: 56,
      h: 12,
      z: 3,
      rotation: 0,
      fontFamily: "var(--font-oswald), sans-serif",
      fontSize: 1.7,
      color: "#888888",
      fontWeight: 500,
      fontStyle: "normal",
      align: "center",
    },
  ];
}

function isHint(l: Layer) {
  if (l.type !== "text") return false;
  if (l.background) return true;
  const t = typeof l.text === "string" ? l.text : "";
  return HINTS.some((s) => t.includes(s));
}

function FieldChip({
  value,
  placeholder,
  onCommit,
  className = "",
}: {
  value: string;
  placeholder: string;
  onCommit: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    onCommit(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className={`flex h-8 min-w-0 items-center gap-1 rounded border border-neutral-300 bg-white px-2.5 ${className}`}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={save}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-emerald-600 transition hover:bg-neutral-100"
          aria-label="Save"
          title="Save"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </div>
    );
  }

  const display = value.trim() || placeholder;
  const isEmpty = !value.trim();

  return (
    <div
      className={`group flex h-8 min-w-0 items-center gap-1 rounded px-2 transition hover:bg-neutral-100 ${className}`}
    >
      <span
        className={`min-w-0 flex-1 truncate text-[14px] ${
          isEmpty ? "text-neutral-400" : "text-neutral-800"
        }`}
      >
        {display}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 opacity-70 transition hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100"
        aria-label={`Edit ${placeholder}`}
        title="Edit"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  );
}

export function DesignStudio({ entry }: { entry: BoardEntry }) {
  const router = useRouter();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [fontPanelOpen, setFontPanelOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [brand, setBrand] = useState(entry.brand);
  const [url, setUrl] = useState(entry.url ?? "");
  const [xHandle, setXHandle] = useState("");
  const faceRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef<{ x: number; y: number; lx: number; ly: number } | null>(null);
  const seededForId = useRef<string | null>(null);

  useEffect(() => {
    setBrand(entry.brand);
    setUrl(entry.url ?? "");
    setSelectedId(null);
    setPlusOpen(false);
    setFontPanelOpen(false);
    if (entry.creative?.layers?.length) {
      setLayers(entry.creative.layers);
      seededForId.current = entry.id;
      return;
    }
    if (seededForId.current === entry.id) return;
    seededForId.current = entry.id;
    setLayers(welcome());
  }, [entry.id, entry.creative, entry.brand, entry.url]);

  const persistMeta = useCallback(
    (nextBrand: string, nextUrl: string) => {
      try {
        const s = getState();
        const e = s.entries.find((x) => x.id === entry.id);
        if (e) {
          e.brand = nextBrand;
          e.url =
            nextUrl.trim() && nextUrl.trim() !== "https://"
              ? nextUrl.trim()
              : undefined;
        }
        saveCreative(entry.id, {
          layers,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        /* ignore */
      }
    },
    [entry.id, layers]
  );

  const commitBrand = (v: string) => {
    const next = v || brand;
    setBrand(next);
    persistMeta(next, url);
  };

  const commitUrl = (v: string) => {
    setUrl(v);
    persistMeta(brand, v);
  };

  const commitHandle = (v: string) => {
    const cleaned = v.replace(/^@/, "").trim();
    setXHandle(cleaned ? `@${cleaned}` : "");
  };

  const creative: Creative = useMemo(
    () => ({ layers, updatedAt: new Date().toISOString() }),
    [layers]
  );
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const showCenterPlus = layers.length === 0 || layers.every(isHint);

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
        setFontPanelOpen(false);
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.stopPropagation();
    setSelectedId(layerId);
    setPlusOpen(false);
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
      x: dragStart.current.lx + dx,
      y: dragStart.current.ly + dy,
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
      text: brand.trim() || "YOUR TEXT",
      x: 10,
      y: 28,
      w: 80,
      h: 36,
      z: layers.length + 1,
      fontFamily: "var(--font-anton), Impact, sans-serif",
      fontSize: 7,
      color: "#0a0a0a",
      fontWeight: 400,
      fontStyle: "normal",
      align: "center",
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
  };

  const addSticker = (emoji: string) => {
    const layer: StickerLayer = {
      id: uid(),
      type: "sticker",
      emoji,
      x: 40,
      y: 30,
      w: 20,
      h: 35,
      z: layers.length + 1,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const layer: ImageLayer = {
        id: uid(),
        type: "image",
        src: String(reader.result),
        x: 10,
        y: 5,
        w: 80,
        h: 90,
        z: layers.length + 1,
      };
      setLayers((p) => [...p, layer]);
      setSelectedId(layer.id);
      setPlusOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    persistMeta(brand, url);
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
      /* ignore */
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
      <div className="absolute inset-0 flex items-end justify-center">
        <div
          className="relative"
          style={{
            width: BOARD_WIDTH,
            transform: `translateY(${BOARD_OFFSET_Y}px)`,
          }}
        >
          {/* White listing bar — 42px for breathing room */}
          <div
            className="absolute z-30 flex h-[42px] items-center gap-2 rounded-sm bg-white px-3 shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
            style={{ top: "15.2%", left: "7.7%", right: "7.6%" }}
          >
            <FieldChip
              value={brand}
              placeholder="Brand"
              onCommit={commitBrand}
              className="min-w-0 max-w-[10.5rem] shrink"
            />
            <div className="h-4 w-px shrink-0 bg-neutral-200" />
            <FieldChip
              value={url}
              placeholder="https://"
              onCommit={commitUrl}
              className="min-w-0 max-w-[13rem] shrink"
            />
            <div className="h-4 w-px shrink-0 bg-neutral-200" />
            <FieldChip
              value={xHandle}
              placeholder="@handle"
              onCommit={commitHandle}
              className="w-[6rem] shrink-0"
            />
            <div className="min-w-1 flex-1" />
            <button
              type="button"
              onClick={() => setHelpOpen((v) => !v)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="How it works"
              title="How it works"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
            <button
              type="button"
              onClick={shareOnX}
              className="h-7 shrink-0 rounded px-2.5 text-[13px] text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              Share
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="h-7 shrink-0 rounded px-2.5 text-[13px] text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              {savedFlash ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={lock}
              disabled={!brand.trim()}
              className="h-7 shrink-0 rounded-full bg-neutral-900 px-3.5 text-[13px] font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40"
            >
              Lock & go live
            </button>
          </div>

          {helpOpen && (
            <div
              className="absolute z-40 rounded-lg border border-neutral-200 bg-white p-4 text-[13px] leading-relaxed text-neutral-700 shadow-xl"
              style={{ top: "23%", left: "7.7%", width: "min(340px, 84%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  How the builder works
                </p>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <ol className="list-decimal space-y-1.5 pl-4">
                <li>Tap <strong>+</strong> on the face to add text, an image, or a sticker.</li>
                <li>Drag layers to place them. Resize from the corner handle.</li>
                <li>Select text to change copy, size, colour, or font.</li>
                <li>Edit brand, URL, and @handle with the pencil icons above.</li>
                <li>Save a draft anytime. When it feels right, Lock & go live.</li>
              </ol>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash/board-frame.png"
            alt=""
            className="pointer-events-none relative z-10 block h-auto w-full select-none"
            draggable={false}
          />

          <div
            ref={faceRef}
            className="absolute overflow-hidden bg-white"
            style={{
              left: FACE.left,
              top: FACE.top,
              right: FACE.right,
              bottom: FACE.bottom,
            }}
            onClick={() => {
              setSelectedId(null);
              setPlusOpen(false);
              setFontPanelOpen(false);
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
                    transform: layer.rotation
                      ? `rotate(${layer.rotation}deg)`
                      : undefined,
                    cursor:
                      dragging && selectedId === layer.id ? "grabbing" : "grab",
                  }}
                  onPointerDown={(e) => onPointerDown(e, layer.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {layer.type === "text" && (
                    <div
                      className="flex h-full w-full items-center px-[3%] py-[3%] leading-tight"
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
                        whiteSpace: "pre-wrap",
                        pointerEvents: "none",
                        background: layer.background || "transparent",
                        borderRadius: layer.background ? 4 : 0,
                        boxShadow: layer.background
                          ? "0 2px 8px rgba(0,0,0,0.25)"
                          : "none",
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
                          updateLayer(layer.id, {
                            w: Math.max(
                              8,
                              Math.min(100, startW + ((ev.clientX - startX) / r.width) * 100)
                            ),
                            h: Math.max(
                              8,
                              Math.min(100, startH + ((ev.clientY - startY) / r.height) * 100)
                            ),
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

            {showCenterPlus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlusOpen((v) => !v);
                }}
                className="absolute z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 text-2xl text-neutral-400 transition hover:border-neutral-500 hover:bg-black/5 hover:text-neutral-700"
                aria-label="Add content"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                +
              </button>
            )}

            {plusOpen && (
              <div
                className="absolute z-40 flex flex-wrap justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={addText}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200"
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200"
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlusOpen(false);
                    setSelectedId("__stickers__");
                  }}
                  className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200"
                >
                  Sticker
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && selected.id !== "__stickers__" && (
        <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
          {selected.type === "text" && (
            <>
              <input
                value={selected.text}
                onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                className="min-w-[140px] rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-sm text-white outline-none"
              />
              <input
                type="range"
                min={1.5}
                max={14}
                step={0.5}
                value={selected.fontSize}
                onChange={(e) =>
                  updateLayer(selected.id, { fontSize: Number(e.target.value) })
                }
                className="w-20"
                title="Size"
              />
              <input
                type="color"
                value={selected.color}
                onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setFontPanelOpen((v) => !v)}
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white hover:border-white/30"
                style={{ fontFamily: selected.fontFamily }}
              >
                {FONTS.find((f) => f.value === selected.fontFamily)?.label ?? "Font"}
              </button>
            </>
          )}
          {selected.type === "sticker" && (
            <div className="flex flex-wrap gap-1">
              {STICKERS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => updateLayer(selected.id, { emoji: e })}
                  className="rounded-lg bg-white/5 px-2 py-1 text-lg hover:bg-white/15"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <label className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span>Rot</span>
            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={selected.rotation ?? 0}
              onChange={(e) =>
                updateLayer(selected.id, { rotation: Number(e.target.value) })
              }
              className="w-16"
            />
          </label>
          <button
            type="button"
            onClick={() => removeLayer(selected.id)}
            className="ml-1 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      )}

      {fontPanelOpen && selected?.type === "text" && (
        <div className="fixed bottom-24 left-1/2 z-50 max-h-[50vh] w-[min(420px,92vw)] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900/98 p-3 shadow-2xl backdrop-blur">
          <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
            Fonts
          </p>
          <div className="grid grid-cols-1 gap-1">
            {FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  updateLayer(selected.id, { fontFamily: f.value });
                  setFontPanelOpen(false);
                }}
                className={`rounded-xl px-3 py-2.5 text-left transition ${
                  selected.fontFamily === f.value
                    ? "bg-white text-neutral-900"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider opacity-50">
                  {f.label}
                </span>
                <span
                  className="mt-0.5 block text-lg leading-tight"
                  style={{ fontFamily: f.value }}
                >
                  Aa · {brand.trim() || "Your brand"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedId === "__stickers__" && (
        <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-white/15 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
          {STICKERS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => addSticker(e)}
              className="rounded-lg bg-white/5 px-2 py-1 text-xl hover:bg-white/15"
            >
              {e}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="ml-2 text-xs text-white/40 hover:text-white"
          >
            Close
          </button>
        </div>
      )}

      {!showCenterPlus && (
        <button
          type="button"
          onClick={() => setPlusOpen((v) => !v)}
          className="fixed bottom-8 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-neutral-900 shadow-lg transition hover:scale-105"
          aria-label="Add"
        >
          +
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
    </div>
  );
}
