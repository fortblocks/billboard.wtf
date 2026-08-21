"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BoardEntry,
  Creative,
  Layer,
  TextLayer,
  ImageLayer,
  StickerLayer,
  ButtonLayer,
} from "@/lib/types";
import { FaceCreative } from "@/components/board/FaceCreative";
import { SCENES } from "@/lib/scenes";
import { saveCreative, lockAndPublish } from "@/lib/store";
import { useRouter } from "next/navigation";

const FONTS = [
  { label: "Sans", value: "system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Display", value: "'Arial Black', sans-serif" },
];

const STICKERS = ["🔥", "✨", "🚀", "💎", "🎯", "👑", "⚡", "🌟", "❤️", "🎉", "🦄", "🌈"];

const TEMPLATES: { name: string; layers: Omit<Layer, "id">[] }[] = [
  {
    name: "Bold",
    layers: [
      {
        type: "text",
        text: "YOUR BRAND",
        x: 6,
        y: 30,
        w: 88,
        h: 40,
        z: 1,
        fontFamily: "system-ui, sans-serif",
        fontSize: 7.5,
        color: "#111111",
        fontWeight: 800,
        fontStyle: "normal",
        align: "center",
      },
    ],
  },
  {
    name: "Headline + line",
    layers: [
      {
        type: "text",
        text: "YOUR BRAND",
        x: 8,
        y: 22,
        w: 84,
        h: 28,
        z: 2,
        fontFamily: "system-ui, sans-serif",
        fontSize: 5.5,
        color: "#111111",
        fontWeight: 700,
        fontStyle: "normal",
        align: "center",
      },
      {
        type: "text",
        text: "Something worth staying for",
        x: 10,
        y: 55,
        w: 80,
        h: 18,
        z: 2,
        fontFamily: "Georgia, serif",
        fontSize: 2.6,
        color: "#555555",
        fontWeight: 400,
        fontStyle: "italic",
        align: "center",
      },
    ],
  },
  {
    name: "Minimal",
    layers: [
      {
        type: "text",
        text: "brand",
        x: 15,
        y: 38,
        w: 70,
        h: 24,
        z: 1,
        fontFamily: "ui-monospace, monospace",
        fontSize: 4,
        color: "#222222",
        fontWeight: 500,
        fontStyle: "normal",
        align: "center",
      },
    ],
  },
  {
    name: "CTA",
    layers: [
      {
        type: "text",
        text: "YOUR BRAND",
        x: 8,
        y: 18,
        w: 84,
        h: 26,
        z: 1,
        fontFamily: "system-ui, sans-serif",
        fontSize: 5,
        color: "#111111",
        fontWeight: 700,
        fontStyle: "normal",
        align: "center",
      },
      {
        type: "button",
        label: "Visit site →",
        url: "https://",
        bg: "#111111",
        color: "#ffffff",
        x: 30,
        y: 55,
        w: 40,
        h: 22,
        z: 2,
      },
    ],
  },
];

/** Locked face region of board-frame.png */
const FACE = {
  left: "2.0%",
  top: "3.2%",
  width: "86.7%",
  height: "56.6%",
};

function uid() {
  return crypto.randomUUID();
}

interface DesignStudioProps {
  entry: BoardEntry;
}

export function DesignStudio({ entry }: DesignStudioProps) {
  const router = useRouter();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewScene, setPreviewScene] = useState(0);
  const [tab, setTab] = useState<"add" | "edit" | "templates">("add");
  const [dragging, setDragging] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const faceRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; lx: number; ly: number } | null>(null);

  useEffect(() => {
    if (entry.creative?.layers?.length) {
      setLayers(entry.creative.layers);
    } else {
      const t = TEMPLATES[0];
      setLayers(
        t.layers.map((l) => ({
          ...l,
          id: uid(),
          ...(l.type === "text" ? { text: entry.brand.toUpperCase() } : {}),
        })) as Layer[]
      );
    }
  }, [entry.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const creative: Creative = useMemo(
    () => ({ layers, updatedAt: new Date().toISOString() }),
    [layers]
  );

  const selected = layers.find((l) => l.id === selectedId) ?? null;

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
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.stopPropagation();
    setSelectedId(layerId);
    setTab("edit");
    const layer = layers.find((l) => l.id === layerId);
    if (!layer || !faceRef.current) return;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      lx: layer.x,
      ly: layer.y,
    };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !selectedId || !faceRef.current) return;
    const rect = faceRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    updateLayer(selectedId, {
      x: Math.max(-10, Math.min(90, dragStart.current.lx + dx)),
      y: Math.max(-10, Math.min(90, dragStart.current.ly + dy)),
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
      text: "New text",
      x: 20,
      y: 38,
      w: 60,
      h: 24,
      z: layers.length + 1,
      fontFamily: "system-ui, sans-serif",
      fontSize: 4,
      color: "#111111",
      fontWeight: 600,
      fontStyle: "normal",
      align: "center",
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setTab("edit");
  };

  const addSticker = (emoji: string) => {
    const layer: StickerLayer = {
      id: uid(),
      type: "sticker",
      emoji,
      x: 38,
      y: 30,
      w: 24,
      h: 40,
      z: layers.length + 1,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setTab("edit");
  };

  const addButton = () => {
    const layer: ButtonLayer = {
      id: uid(),
      type: "button",
      label: "Click me",
      url: entry.url || "https://",
      bg: "#111111",
      color: "#ffffff",
      x: 30,
      y: 55,
      w: 40,
      h: 22,
      z: layers.length + 1,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
    setTab("edit");
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const layer: ImageLayer = {
        id: uid(),
        type: "image",
        src: String(reader.result),
        x: 25,
        y: 12,
        w: 50,
        h: 76,
        z: layers.length + 1,
      };
      setLayers((p) => [...p, layer]);
      setSelectedId(layer.id);
      setTab("edit");
    };
    reader.readAsDataURL(file);
  };

  const applyTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setLayers(
      t.layers.map((l) => ({
        ...l,
        id: uid(),
        ...(l.type === "text" ? { text: entry.brand.toUpperCase() } : {}),
        ...(l.type === "button" && entry.url ? { url: entry.url } : {}),
      })) as Layer[]
    );
    setSelectedId(null);
  };

  const saveDraft = () => {
    saveCreative(entry.id, creative);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const lock = () => {
    saveCreative(entry.id, creative);
    lockAndPublish(entry.id);
    router.push("/");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 pt-4 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Design studio
            </p>
            <p className="text-sm font-medium text-white/90">{entry.brand}</p>
          </div>
          <div className="flex gap-1">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPreviewScene(i)}
                className={`rounded-full px-2.5 py-1 text-[10px] transition ${
                  previewScene === i
                    ? "bg-white/20 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {s.location.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl"
          style={{
            backgroundImage: `url(${SCENES[previewScene].src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
            <div className="relative w-full max-w-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/splash/board-frame.png"
                alt=""
                className="pointer-events-none relative z-10 block h-auto w-full select-none"
                draggable={false}
              />
              <div
                ref={faceRef}
                className="absolute z-20 cursor-crosshair overflow-hidden bg-white"
                style={{
                  left: FACE.left,
                  top: FACE.top,
                  width: FACE.width,
                  height: FACE.height,
                }}
                onClick={() => setSelectedId(null)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                {layers.length === 0 ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-sm text-neutral-400">Add something…</p>
                  </div>
                ) : (
                  layers
                    .slice()
                    .sort((a, b) => a.z - b.z)
                    .map((layer) => (
                      <div
                        key={layer.id}
                        className={`absolute ${
                          selectedId === layer.id
                            ? "outline outline-2 outline-sky-400 outline-offset-[-1px]"
                            : "hover:outline hover:outline-1 hover:outline-sky-300/50 hover:outline-offset-[-1px]"
                        }`}
                        style={{
                          left: `${layer.x}%`,
                          top: `${layer.y}%`,
                          width: `${layer.w}%`,
                          height: `${layer.h}%`,
                          zIndex: layer.z,
                          cursor: dragging && selectedId === layer.id ? "grabbing" : "grab",
                          opacity: layer.opacity ?? 1,
                          transform: layer.rotation
                            ? `rotate(${layer.rotation}deg)`
                            : undefined,
                        }}
                        onPointerDown={(e) => onPointerDown(e, layer.id)}
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
                        {layer.type === "button" && (
                          <div
                            className="flex h-full w-full items-center justify-center rounded-full px-[4%] font-semibold"
                            style={{
                              background: layer.bg,
                              color: layer.color,
                              fontSize: "min(2vw, 2.2vh)",
                              pointerEvents: "none",
                            }}
                          >
                            {layer.label}
                          </div>
                        )}
                        {layer.type === "shape" && (
                          <div
                            className="h-full w-full"
                            style={{
                              background: layer.fill,
                              borderRadius: layer.shape === "circle" ? "50%" : 4,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
          <p className="pb-3 text-center text-[10px] text-white/50">
            Drag layers · click to select · worlds rotate live
          </p>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(["add", "edit", "templates"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 text-[11px] capitalize transition ${
                tab === t
                  ? "bg-white/15 text-white"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "add" && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <button
              type="button"
              onClick={addText}
              className="w-full rounded-lg border border-dashed border-white/20 py-2.5 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
            >
              + Text
            </button>
            <label className="flex w-full cursor-pointer justify-center rounded-lg border border-dashed border-white/20 py-2.5 text-xs text-white/70 transition hover:border-white/40 hover:text-white">
              + Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>
            <button
              type="button"
              onClick={addButton}
              className="w-full rounded-lg border border-dashed border-white/20 py-2.5 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
            >
              + Button / link
            </button>
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-wider text-white/35">
                Stickers
              </p>
              <div className="flex flex-wrap gap-1">
                {STICKERS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => addSticker(e)}
                    className="rounded-lg bg-white/5 px-2 py-1.5 text-lg transition hover:bg-white/15"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "templates" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
              Start from a template
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(i)}
                  className="rounded-lg border border-white/15 px-3 py-3 text-left text-[12px] text-white/70 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "edit" && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
            {!selected ? (
              <p className="py-6 text-center text-xs text-white/40">
                Select a layer on the board
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    {selected.type}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLayer(selected.id)}
                    className="text-[11px] text-red-400/80 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                {selected.type === "text" && (
                  <div className="space-y-2">
                    <textarea
                      value={selected.text}
                      onChange={(e) =>
                        updateLayer(selected.id, { text: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-md border border-white/15 bg-black/40 px-2.5 py-2 text-sm outline-none focus:border-white/35"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-white/40">
                        Size
                        <input
                          type="range"
                          min={1.5}
                          max={14}
                          step={0.5}
                          value={selected.fontSize}
                          onChange={(e) =>
                            updateLayer(selected.id, {
                              fontSize: Number(e.target.value),
                            })
                          }
                          className="mt-1 w-full"
                        />
                      </label>
                      <label className="text-[10px] text-white/40">
                        Colour
                        <input
                          type="color"
                          value={selected.color}
                          onChange={(e) =>
                            updateLayer(selected.id, { color: e.target.value })
                          }
                          className="mt-1 h-8 w-full cursor-pointer rounded border-0 bg-transparent"
                        />
                      </label>
                    </div>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) =>
                        updateLayer(selected.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-xs outline-none"
                    >
                      {FONTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateLayer(selected.id, {
                            fontWeight: selected.fontWeight >= 600 ? 400 : 700,
                          })
                        }
                        className={`rounded border px-2.5 py-1 text-xs font-bold ${
                          selected.fontWeight >= 600
                            ? "border-white/40 bg-white/10"
                            : "border-white/15"
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLayer(selected.id, {
                            fontStyle:
                              selected.fontStyle === "italic"
                                ? "normal"
                                : "italic",
                          })
                        }
                        className={`rounded border px-2.5 py-1 text-xs italic ${
                          selected.fontStyle === "italic"
                            ? "border-white/40 bg-white/10"
                            : "border-white/15"
                        }`}
                      >
                        I
                      </button>
                      {(["left", "center", "right"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() =>
                            updateLayer(selected.id, { align: a })
                          }
                          className={`rounded border px-2 py-1 text-[10px] capitalize ${
                            selected.align === a
                              ? "border-white/40 bg-white/10"
                              : "border-white/15"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selected.type === "button" && (
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/40">
                      Label
                      <input
                        value={selected.label}
                        onChange={(e) =>
                          updateLayer(selected.id, { label: e.target.value })
                        }
                        className="mt-0.5 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm outline-none"
                      />
                    </label>
                    <label className="block text-[10px] text-white/40">
                      URL
                      <input
                        value={selected.url}
                        onChange={(e) =>
                          updateLayer(selected.id, { url: e.target.value })
                        }
                        className="mt-0.5 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm outline-none"
                        placeholder="https://"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-white/40">
                        Button
                        <input
                          type="color"
                          value={selected.bg}
                          onChange={(e) =>
                            updateLayer(selected.id, { bg: e.target.value })
                          }
                          className="mt-1 h-8 w-full cursor-pointer"
                        />
                      </label>
                      <label className="text-[10px] text-white/40">
                        Text
                        <input
                          type="color"
                          value={selected.color}
                          onChange={(e) =>
                            updateLayer(selected.id, { color: e.target.value })
                          }
                          className="mt-1 h-8 w-full cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {selected.type === "sticker" && (
                  <div className="flex flex-wrap gap-1">
                    {STICKERS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() =>
                          updateLayer(selected.id, { emoji: e })
                        }
                        className={`rounded-lg px-2 py-1.5 text-lg ${
                          selected.emoji === e
                            ? "bg-white/20"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
                  {(
                    [
                      ["X", "x"],
                      ["Y", "y"],
                      ["W", "w"],
                      ["H", "h"],
                    ] as const
                  ).map(([label, key]) => (
                    <label key={key} className="text-[10px] text-white/40">
                      {label} %
                      <input
                        type="number"
                        value={Math.round(selected[key])}
                        onChange={(e) =>
                          updateLayer(selected.id, {
                            [key]: Number(e.target.value),
                          })
                        }
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/40 px-1.5 py-1 text-xs text-white outline-none"
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
            Layers ({layers.length})
          </p>
          <ul className="max-h-36 space-y-0.5 overflow-y-auto">
            {layers
              .slice()
              .sort((a, b) => b.z - a.z)
              .map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(l.id);
                      setTab("edit");
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] transition ${
                      selectedId === l.id
                        ? "bg-white/15 text-white"
                        : "text-white/55 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">
                      {l.type === "text"
                        ? l.text
                        : l.type === "sticker"
                          ? l.emoji
                          : l.type === "button"
                            ? l.label
                            : l.type}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-2 text-white/25 hover:text-red-300"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeLayer(l.id);
                      }}
                    >
                      ×
                    </span>
                  </button>
                </li>
              ))}
            {layers.length === 0 && (
              <li className="py-2 text-center text-[11px] text-white/30">
                Empty board
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-full border border-white/20 py-2.5 text-sm text-white/80 transition hover:border-white/40"
          >
            {savedFlash ? "Saved ✓" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={lock}
            disabled={layers.length === 0}
            className="rounded-full bg-white py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40"
          >
            Lock board & go live
          </button>
          <p className="text-center text-[10px] text-white/30">
            Once locked, your face is permanent on the hall
          </p>
        </div>
      </aside>
    </div>
  );
}
