"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BoardEntry,
  Creative,
  Layer,
  TextLayer,
  ImageLayer,
  StickerLayer,
  DrawLayer,
} from "@/lib/types";
import { saveCreative, lockAndPublish, getState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { BOARD_WIDTH, BOARD_OFFSET_Y, FACE } from "@/lib/boardGeometry";
import { FONTS, STICKERS, STICKER_PACKS, EMOJI_LIB, searchEmojis, searchIconify, uid, rasterizeFace } from "./studioHelpers";

const HINTS = ["YOUR FACE", "Welcome to the Billboard", "Everything you place", "This is your canvas", "Lock & go live", "When it feels iconic", "Make it count", "TAP"];
const HISTORY_LIMIT = 50;

function welcome(): TextLayer[] {
  return [
    { id: uid(), type: "text", text: "YOUR FACE.\nONE BRAND.", x: 8, y: 14, w: 84, h: 34, z: 1, rotation: 0, opacity: 1, fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 5.2, color: "#0a0a0a", fontWeight: 400, fontStyle: "normal", align: "center" },
    { id: uid(), type: "text", text: "Everything you place here becomes the live poster.", x: 12, y: 54, w: 76, h: 14, z: 2, rotation: 0, opacity: 1, fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 1.65, color: "#3a3a3a", fontWeight: 400, fontStyle: "normal", align: "center" },
    { id: uid(), type: "text", text: "TAP  +  TO BEGIN", x: 22, y: 76, w: 56, h: 12, z: 3, rotation: 0, opacity: 1, fontFamily: "var(--font-oswald), sans-serif", fontSize: 1.7, color: "#888888", fontWeight: 500, fontStyle: "normal", align: "center" },
  ];
}

function isHint(l: Layer) {
  if (l.type !== "text") return false;
  if (l.background) return true;
  const t = typeof l.text === "string" ? l.text : "";
  return HINTS.some((s) => t.includes(s));
}

function snapAngle(deg: number): number {
  for (const s of [0, 45, 90, 135, 180, -45, -90, -135, -180]) {
    if (Math.abs(deg - s) < 4) return s;
  }
  return Math.round(deg);
}

function FieldChip({ value, placeholder, onCommit, className = "" }: { value: string; placeholder: string; onCommit: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);
  const save = () => { onCommit(draft.trim()); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };
  if (editing) {
    return (
      <div className={`flex h-8 min-w-0 items-center gap-1 rounded border border-neutral-300 bg-white px-2.5 ${className}`}>
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }} className="min-w-0 flex-1 bg-transparent text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400" placeholder={placeholder} />
        <button type="button" onClick={save} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-emerald-600 hover:bg-neutral-100" aria-label="Save">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </button>
      </div>
    );
  }
  const display = value.trim() || placeholder;
  const isEmpty = !value.trim();
  return (
    <div className={`group flex h-8 min-w-0 items-center gap-1 rounded px-2 transition hover:bg-neutral-100 ${className}`}>
      <span className={`min-w-0 flex-1 truncate text-[14px] ${isEmpty ? "text-neutral-400" : "text-neutral-800"}`}>{display}</span>
      <button type="button" onClick={() => setEditing(true)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 opacity-70 transition hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100" aria-label={`Edit ${placeholder}`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
      </button>
    </div>
  );
}

function ToolBtn({ onClick, title, children, danger, active }: { onClick: () => void; title: string; children: React.ReactNode; danger?: boolean; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={`flex h-8 items-center justify-center rounded-lg px-2 text-xs transition ${danger ? "text-red-400 hover:bg-red-500/10" : active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
      {children}
    </button>
  );
}

export function DesignStudio({ entry }: { entry: BoardEntry }) {
  const router = useRouter();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [fontPanelOpen, setFontPanelOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawColor, setDrawColor] = useState("#0a0a0a");
  const [drawWidth, setDrawWidth] = useState(4);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [stickerTab, setStickerTab] = useState<"emoji" | "icons" | "gif">("emoji");
  const [stickerQuery, setStickerQuery] = useState("");
  const [iconResults, setIconResults] = useState<{ id: string; svgUrl: string }[]>([]);
  const [iconLoading, setIconLoading] = useState(false);
  const drawingRef = useRef<{ points: { x: number; y: number }[]; layerId: string } | null>(null);
  const [brand, setBrand] = useState(entry.brand);
  const [url, setUrl] = useState(entry.url ?? "");
  const [xHandle, setXHandle] = useState("");
  const faceRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceImageRef = useRef<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; lx: number; ly: number } | null>(null);
  const seededForId = useRef<string | null>(null);
  const history = useRef<Layer[][]>([]);
  const historyIndex = useRef(-1);
  const skipHistory = useRef(false);

  const pushHistory = useCallback((next: Layer[]) => {
    if (skipHistory.current) return;
    const snapshot = structuredClone(next);
    const trimmed = history.current.slice(0, historyIndex.current + 1);
    trimmed.push(snapshot);
    if (trimmed.length > HISTORY_LIMIT) trimmed.shift();
    history.current = trimmed;
    historyIndex.current = trimmed.length - 1;
  }, []);

  const setLayersTracked = useCallback((updater: Layer[] | ((prev: Layer[]) => Layer[])) => {
    setLayers((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    skipHistory.current = true;
    setLayers(structuredClone(history.current[historyIndex.current]));
    skipHistory.current = false;
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current += 1;
    skipHistory.current = true;
    setLayers(structuredClone(history.current[historyIndex.current]));
    skipHistory.current = false;
  }, []);

  useEffect(() => {
    setBrand(entry.brand);
    setUrl(entry.url ?? "");
    setSelectedId(null);
    setInlineEditingId(null);
    setPlusOpen(false);
    setFontPanelOpen(false);
    let initial: Layer[];
    if (entry.creative?.layers?.length) {
      initial = entry.creative.layers;
      seededForId.current = entry.id;
    } else if (seededForId.current === entry.id) {
      return;
    } else {
      seededForId.current = entry.id;
      initial = welcome();
    }
    skipHistory.current = true;
    setLayers(initial);
    history.current = [structuredClone(initial)];
    historyIndex.current = 0;
    skipHistory.current = false;
  }, [entry.id, entry.creative, entry.brand, entry.url]);

  const persistMeta = useCallback((nextBrand: string, nextUrl: string) => {
    try {
      const s = getState();
      const e = s.entries.find((x) => x.id === entry.id);
      if (e) {
        e.brand = nextBrand;
        e.url = nextUrl.trim() && nextUrl.trim() !== "https://" ? nextUrl.trim() : undefined;
      }
      saveCreative(entry.id, { layers, updatedAt: new Date().toISOString() });
    } catch { /* ignore */ }
  }, [entry.id, layers]);

  const commitBrand = (v: string) => { const next = v || brand; setBrand(next); persistMeta(next, url); };
  const commitUrl = (v: string) => { setUrl(v); persistMeta(brand, v); };
  const commitHandle = (v: string) => { const cleaned = v.replace(/^@/, "").trim(); setXHandle(cleaned ? `@${cleaned}` : ""); };

  const creative: Creative = useMemo(() => ({ layers, updatedAt: new Date().toISOString() }), [layers]);
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const showCenterPlus = layers.length === 0 || layers.every(isHint);

  const updateLayer = useCallback((lid: string, patch: Partial<Layer>) => {
    setLayersTracked((prev) => prev.map((l) => (l.id === lid ? ({ ...l, ...patch } as Layer) : l)));
  }, [setLayersTracked]);

  const updateLayerLive = useCallback((lid: string, patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === lid ? ({ ...l, ...patch } as Layer) : l)));
  }, []);

  const commitLive = useCallback(() => {
    setLayers((prev) => { pushHistory(prev); return prev; });
  }, [pushHistory]);

  const removeLayer = useCallback((lid: string) => {
    setLayersTracked((p) => p.filter((x) => x.id !== lid));
    if (selectedId === lid) setSelectedId(null);
  }, [selectedId, setLayersTracked]);

  const duplicateLayer = useCallback((lid: string) => {
    setLayersTracked((prev) => {
      const src = prev.find((l) => l.id === lid);
      if (!src) return prev;
      const maxZ = prev.reduce((m, l) => Math.max(m, l.z), 0);
      const copy = { ...structuredClone(src), id: uid(), x: src.x + 3, y: src.y + 3, z: maxZ + 1, locked: false } as Layer;
      setSelectedId(copy.id);
      return [...prev, copy];
    });
  }, [setLayersTracked]);

  const reorderZ = useCallback((lid: string, mode: "front" | "forward" | "back" | "backward") => {
    setLayersTracked((prev) => {
      const sorted = [...prev].sort((a, b) => a.z - b.z);
      const idx = sorted.findIndex((l) => l.id === lid);
      if (idx < 0) return prev;
      let next = [...sorted];
      const [item] = next.splice(idx, 1);
      if (mode === "front") next.push(item);
      else if (mode === "back") next.unshift(item);
      else if (mode === "forward" && idx < sorted.length - 1) next.splice(idx + 1, 0, item);
      else if (mode === "backward" && idx > 0) next.splice(idx - 1, 0, item);
      else next.splice(idx, 0, item);
      return next.map((l, i) => ({ ...l, z: i + 1 }));
    });
  }, [setLayersTracked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (meta && (e.key === "Z" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (meta && e.key === "d" && selectedId && selectedId !== "__stickers__") { e.preventDefault(); duplicateLayer(selectedId); return; }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId && !typing) {
        const layer = layers.find((l) => l.id === selectedId);
        if (layer?.locked) return;
        e.preventDefault();
        removeLayer(selectedId);
        return;
      }
      if (e.key === "Escape") { if (inlineEditingId) { setInlineEditingId(null); return; } if (drawMode) { setDrawMode(false); return; } if (aiOpen) { setAiOpen(false); return; } setSelectedId(null); setPlusOpen(false); setFontPanelOpen(false); setHelpOpen(false); return; }
      if (!typing && selectedId && selectedId !== "__stickers__") {
        const layer = layers.find((l) => l.id === selectedId);
        if (!layer || layer.locked) return;
        const step = e.shiftKey ? 5 : 1;
        if (e.key === "ArrowLeft") { e.preventDefault(); updateLayer(selectedId, { x: layer.x - step }); }
        else if (e.key === "ArrowRight") { e.preventDefault(); updateLayer(selectedId, { x: layer.x + step }); }
        else if (e.key === "ArrowUp") { e.preventDefault(); updateLayer(selectedId, { y: layer.y - step }); }
        else if (e.key === "ArrowDown") { e.preventDefault(); updateLayer(selectedId, { y: layer.y + step }); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, layers, undo, redo, duplicateLayer, removeLayer, updateLayer, inlineEditingId, drawMode, aiOpen]);

  const onPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.stopPropagation();
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    setSelectedId(layerId);
    setPlusOpen(false);
    if (layer.locked || inlineEditingId === layerId || !faceRef.current) return;
    dragStart.current = { x: e.clientX, y: e.clientY, lx: layer.x, ly: layer.y };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !selectedId || !faceRef.current) return;
    const rect = faceRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    updateLayerLive(selectedId, { x: dragStart.current.lx + dx, y: dragStart.current.ly + dy });
  };

  const onPointerUp = () => {
    if (dragging) commitLive();
    setDragging(false);
    dragStart.current = null;
  };

  const startResize = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    if (layer.locked || !faceRef.current) return;
    const startX = e.clientX, startY = e.clientY, startW = layer.w, startH = layer.h;
    const face = faceRef.current;
    const onMove = (ev: PointerEvent) => {
      const r = face.getBoundingClientRect();
      let dw = ((ev.clientX - startX) / r.width) * 100;
      let dh = ((ev.clientY - startY) / r.height) * 100;
      if (ev.shiftKey) { const avg = (dw + dh) / 2; dw = avg; dh = avg; }
      updateLayerLive(layer.id, { w: Math.max(6, Math.min(120, startW + dw)), h: Math.max(6, Math.min(120, startH + dh)) });
    };
    const onUp = () => { commitLive(); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startRotate = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    if (layer.locked || !faceRef.current) return;
    const face = faceRef.current;
    const r = face.getBoundingClientRect();
    const cx = r.left + ((layer.x + layer.w / 2) / 100) * r.width;
    const cy = r.top + ((layer.y + layer.h / 2) / 100) * r.height;
    const onMove = (ev: PointerEvent) => {
      let deg = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      if (deg < -180) deg += 360;
      updateLayerLive(layer.id, { rotation: snapAngle(deg) });
    };
    const onUp = () => { commitLive(); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const addText = () => {
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    const label = brand.trim() || "YOUR TEXT";
    const approxW = Math.min(70, Math.max(28, label.length * 4.2));
    const layer: TextLayer = { id: uid(), type: "text", text: label, x: (100 - approxW) / 2, y: 34, w: approxW, h: 18, z: maxZ + 1, rotation: 0, opacity: 1, fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 5.5, color: "#0a0a0a", fontWeight: 400, fontStyle: "normal", align: "center" };
    setLayersTracked((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
  };

  const addSticker = (emoji: string) => {
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    const layer: StickerLayer = { id: uid(), type: "sticker", emoji, stickerKind: "emoji", x: 42, y: 32, w: 14, h: 28, z: maxZ + 1, rotation: 0, opacity: 1 };
    setLayersTracked((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
  };

  const addIconSticker = (svgUrl: string, kind: "icon" | "gif" = "icon") => {
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    const layer: StickerLayer = {
      id: uid(),
      type: "sticker",
      src: svgUrl,
      stickerKind: kind,
      x: 40,
      y: 28,
      w: 16,
      h: 32,
      z: maxZ + 1,
      rotation: 0,
      opacity: 1,
    };
    setLayersTracked((p) => [...p, layer]);
    setSelectedId(layer.id);
    setPlusOpen(false);
  };

  const runIconSearch = async (q: string) => {
    setStickerQuery(q);
    if (stickerTab !== "icons") return;
    if (!q.trim()) {
      setIconResults([]);
      return;
    }
    setIconLoading(true);
    try {
      const results = await searchIconify(q, 64);
      setIconResults(results);
    } finally {
      setIconLoading(false);
    }
  };

  const onUpload = (file: File, replaceId?: string) => {
    const isVideo = file.type.startsWith("video/");
    const reader = new FileReader();
    reader.onload = () => {
      const srcData = String(reader.result);
      if (replaceId) {
        updateLayer(replaceId, { src: srcData, isVideo, objectFit: "cover" } as Partial<Layer>);
        setSelectedId(replaceId);
        setPlusOpen(false);
        return;
      }
      const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
      const layer: ImageLayer = {
        id: uid(),
        type: "image",
        src: srcData,
        isVideo,
        objectFit: "cover",
        x: 22,
        y: 12,
        w: 56,
        h: 72,
        z: maxZ + 1,
        rotation: 0,
        opacity: 1,
      };
      setLayersTracked((p) => [...p, layer]);
      setSelectedId(layer.id);
      setPlusOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const facePct = (clientX: number, clientY: number) => {
    if (!faceRef.current) return { x: 0, y: 0 };
    const r = faceRef.current.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };
  const pointsToPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    const [a, ...rest] = pts;
    return `M ${a.x} ${a.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
  };
  const onDrawPointerDown = (e: React.PointerEvent) => {
    if (!drawMode || !faceRef.current) return;
    e.stopPropagation();
    const pt = facePct(e.clientX, e.clientY);
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    const id = uid();
    const layer: DrawLayer = { id, type: "draw", x: 0, y: 0, w: 100, h: 100, z: maxZ + 1, rotation: 0, opacity: 1, paths: [{ d: `M ${pt.x} ${pt.y}`, color: drawColor, width: drawWidth }] };
    drawingRef.current = { points: [pt], layerId: id };
    setLayersTracked((p) => [...p, layer]);
    setSelectedId(id);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onDrawPointerMove = (e: React.PointerEvent) => {
    if (!drawMode || !drawingRef.current) return;
    const pt = facePct(e.clientX, e.clientY);
    const { points, layerId } = drawingRef.current;
    points.push(pt);
    const d = pointsToPath(points);
    setLayers((prev) => prev.map((l) => {
      if (l.id !== layerId || l.type !== "draw") return l;
      const paths = [...l.paths];
      paths[paths.length - 1] = { ...paths[paths.length - 1], d };
      return { ...l, paths };
    }));
  };
  const onDrawPointerUp = () => {
    if (drawingRef.current) { commitLive(); drawingRef.current = null; }
  };
  const runAi = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt || aiBusy) return;
    setAiBusy(true);
    try {
      const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
      const words = prompt.split(/\s+/).slice(0, 8).join(" ").toUpperCase();
      const approxW = Math.min(78, Math.max(32, words.length * 3.8));
      const layer: TextLayer = { id: uid(), type: "text", text: words, x: (100 - approxW) / 2, y: 32, w: approxW, h: 20, z: maxZ + 1, rotation: 0, opacity: 1, fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 5, color: "#0a0a0a", fontWeight: 400, fontStyle: "normal", align: "center" };
      setLayersTracked((p) => [...p, layer]);
      setSelectedId(layer.id);
      setAiOpen(false);
      setAiPrompt("");
    } finally { setAiBusy(false); }
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
    const next: Creative = { ...creative, layers: flat ? [{ id: "flat", type: "image", src: flat, x: 0, y: 0, w: 100, h: 100, z: 1 }] : creative.layers, updatedAt: new Date().toISOString() };
    try {
      const s = getState();
      const e = s.entries.find((x) => x.id === entry.id);
      if (e) { e.brand = brand.trim(); e.url = url.trim() && url.trim() !== "https://" ? url.trim() : undefined; }
    } catch { /* ignore */ }
    saveCreative(entry.id, next);
    lockAndPublish(entry.id);
    router.push("/");
  };

  const shareOnX = () => {
    const handle = xHandle.replace(/^@/, "").trim();
    const lines = [`${brand.trim() || "My brand"} is on the board.`, "https://billboard.wtf", handle ? `@${handle}` : ""].filter(Boolean);
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 flex items-end justify-center">
        <div className="relative" style={{ width: BOARD_WIDTH, transform: `translateY(${BOARD_OFFSET_Y}px)` }}>
          <div className="absolute z-30 flex h-[42px] items-center gap-2 rounded-sm bg-white px-3 shadow-[0_1px_3px_rgba(0,0,0,0.12)]" style={{ top: "15.2%", left: "7.7%", right: "7.6%" }}>
            <FieldChip value={brand} placeholder="Brand" onCommit={commitBrand} className="min-w-0 max-w-[10.5rem] shrink" />
            <div className="h-4 w-px shrink-0 bg-neutral-200" />
            <FieldChip value={url} placeholder="https://" onCommit={commitUrl} className="min-w-0 max-w-[13rem] shrink" />
            <div className="h-4 w-px shrink-0 bg-neutral-200" />
            <FieldChip value={xHandle} placeholder="@handle" onCommit={commitHandle} className="w-[6rem] shrink-0" />
            <div className="min-w-1 flex-1" />
            <button type="button" onClick={() => setHelpOpen((v) => !v)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700" aria-label="How it works" title="How it works">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            </button>
            <button type="button" onClick={shareOnX} className="h-7 shrink-0 rounded px-2.5 text-[13px] text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800">Share</button>
            <button type="button" onClick={saveDraft} className="h-7 shrink-0 rounded px-2.5 text-[13px] text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800">{savedFlash ? "Saved" : "Save"}</button>
            <button type="button" onClick={lock} disabled={!brand.trim()} className="h-7 shrink-0 rounded-full bg-neutral-900 px-3.5 text-[13px] font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40">Lock & go live</button>
          </div>

          {helpOpen && (
            <div className="absolute z-40 rounded-lg border border-neutral-200 bg-white p-4 text-[13px] leading-relaxed text-neutral-700 shadow-xl" style={{ top: "23%", left: "7.7%", width: "min(340px, 84%)" }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">How the builder works</p>
                <button type="button" onClick={() => setHelpOpen(false)} className="text-neutral-400 hover:text-neutral-700" aria-label="Close">✕</button>
              </div>
              <ol className="list-decimal space-y-1.5 pl-4">
                <li>Tap <strong>+</strong> for text, image/video, sticker, draw, or AI.</li>
                <li>Drag to move. Double-click text to edit in place.</li>
                <li>Violet knob rotates — snaps near 45°.</li>
                <li>⌘Z / ⌘⇧Z undo · redo. ⌘D duplicate. Arrows nudge.</li>
                <li>Save draft anytime. Lock & go live when ready.</li>
              </ol>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/splash/board-frame.png" alt="" className="pointer-events-none relative z-10 block h-auto w-full select-none" draggable={false} />

          <div ref={faceRef} className="absolute z-20 overflow-hidden bg-white" style={{ left: FACE.left, top: FACE.top, right: FACE.right, bottom: FACE.bottom, cursor: drawMode ? "crosshair" : undefined }} onClick={() => { if (!drawMode) { setSelectedId(null); setInlineEditingId(null); setPlusOpen(false); setFontPanelOpen(false); setAiOpen(false); } }} onPointerDown={(e) => { if (drawMode) onDrawPointerDown(e); }} onPointerMove={(e) => { if (drawMode) onDrawPointerMove(e); else onPointerMove(e); }} onPointerUp={() => { if (drawMode) onDrawPointerUp(); else onPointerUp(); }} onPointerLeave={() => { if (drawMode) onDrawPointerUp(); else onPointerUp(); }}>
            {layers.slice().filter((l) => l.visible !== false).sort((a, b) => a.z - b.z).map((layer) => {
              const isSel = selectedId === layer.id;
              const contentTransform = [layer.rotation ? `rotate(${layer.rotation}deg)` : "", layer.flipX ? "scaleX(-1)" : "", layer.flipY ? "scaleY(-1)" : ""].filter(Boolean).join(" ");
              return (
                <div key={layer.id} className="absolute" style={{ left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.w}%`, height: `${layer.h}%`, zIndex: layer.z }} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (layer.type === "text" && !layer.locked) {
                    setSelectedId(layer.id);
                    setInlineEditingId(layer.id);
                  }
                }}>
                  <div className={`h-full w-full ${isSel ? "outline outline-2 outline-sky-400 outline-offset-[-1px]" : ""}`} style={{ transform: contentTransform || undefined, opacity: layer.opacity ?? 1, cursor: layer.locked ? "default" : dragging && isSel ? "grabbing" : "grab" }} onPointerDown={(e) => { if (!drawMode) onPointerDown(e, layer.id); }}>
                    {layer.type === "text" && (
                      inlineEditingId === layer.id ? (
                        <textarea autoFocus defaultValue={layer.text} onBlur={(e) => { updateLayer(layer.id, { text: e.target.value }); setInlineEditingId(null); }} onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); setInlineEditingId(null); } if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); updateLayer(layer.id, { text: (e.target as HTMLTextAreaElement).value }); setInlineEditingId(null); } e.stopPropagation(); }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="h-full w-full resize-none bg-transparent px-[3%] py-[3%] leading-tight outline-none" style={{ fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}vh`, color: layer.color, fontWeight: layer.fontWeight, fontStyle: layer.fontStyle, textAlign: layer.align, wordBreak: "break-word", whiteSpace: "pre-wrap", background: layer.background || "transparent", borderRadius: layer.background ? 4 : 0 }} />
                      ) : (
                        <div className="flex h-full w-full items-center px-[3%] py-[3%] leading-tight" style={{ justifyContent: layer.align === "center" ? "center" : layer.align === "right" ? "flex-end" : "flex-start", fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}vh`, color: layer.color, fontWeight: layer.fontWeight, fontStyle: layer.fontStyle, textAlign: layer.align, wordBreak: "break-word", whiteSpace: "pre-wrap", pointerEvents: "none", background: layer.background || "transparent", borderRadius: layer.background ? 4 : 0, boxShadow: layer.background ? "0 2px 8px rgba(0,0,0,0.25)" : "none" }}>{layer.text}</div>
                      )
                    )}
                    {layer.type === "image" && (
                      layer.isVideo ? (
                        <video src={layer.src} className="h-full w-full" style={{ objectFit: layer.objectFit || "cover", pointerEvents: "none" }} autoPlay muted loop playsInline draggable={false} />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={layer.src} alt="" className="h-full w-full" draggable={false} style={{ objectFit: layer.objectFit || "cover", pointerEvents: "none" }} />
                      )
                    )}
                    {layer.type === "sticker" && (
                      layer.src ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={layer.src} alt="" className="h-full w-full object-contain" draggable={false} style={{ pointerEvents: "none" }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ fontSize: "min(7vw, 11vh)", pointerEvents: "none", lineHeight: 1 }}>{layer.emoji}</div>
                      )
                    )}
                    {layer.type === "draw" && (
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" style={{ pointerEvents: "none" }}>
                        {layer.paths.map((p, i) => (
                          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={p.width * 0.15} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        ))}
                      </svg>
                    )}
                  </div>
                  {isSel && !layer.locked && !inlineEditingId && !drawMode && (
                    <>
                      <div className="absolute -bottom-1.5 -right-1.5 z-20 h-3.5 w-3.5 cursor-se-resize rounded-sm border-2 border-white bg-sky-400 shadow" onPointerDown={(e) => startResize(e, layer)} />
                      <div className="absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center" style={{ top: "-28px" }}>
                        <div className="h-3.5 w-3.5 cursor-grab rounded-full border-2 border-white bg-violet-500 shadow active:cursor-grabbing" onPointerDown={(e) => startRotate(e, layer)} title="Rotate" />
                        <div className="h-3 w-px bg-violet-400/80" />
                      </div>
                    </>
                  )}
                  {isSel && layer.locked && (<div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[10px] text-white/70">Locked</div>)}
                </div>
              );
            })}

            {showCenterPlus && !drawMode && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setPlusOpen((v) => !v); }} className="absolute z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 text-2xl text-neutral-400 transition hover:border-neutral-500 hover:bg-black/5 hover:text-neutral-700" aria-label="Add content" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>+</button>
            )}

            {plusOpen && (
              <div className="absolute z-40 flex flex-wrap justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={addText} className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Text</button>
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Image / Video</button>
                <button type="button" onClick={() => { setPlusOpen(false); setSelectedId("__stickers__"); }} className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Sticker</button>
                <button type="button" onClick={() => { setPlusOpen(false); setDrawMode(true); setSelectedId(null); }} className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200">Draw</button>
                <button type="button" onClick={() => { setPlusOpen(false); setAiOpen(true); }} className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700">AI</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && selected.id !== "__stickers__" && !inlineEditingId && !drawMode && (
        <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-white/15 bg-neutral-900/95 px-3 py-2.5 shadow-2xl backdrop-blur">
          {selected.type === "text" && (
            <>
              <span className="px-2 text-[11px] text-white/40">Double-click text to edit</span>
              <input type="range" min={1.5} max={14} step={0.5} value={selected.fontSize} onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) })} className="w-16" title="Size" />
              <input type="color" value={selected.color} onChange={(e) => updateLayer(selected.id, { color: e.target.value })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
              <button type="button" onClick={() => setFontPanelOpen((v) => !v)} className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white hover:border-white/30" style={{ fontFamily: selected.fontFamily }}>{FONTS.find((f) => f.value === selected.fontFamily)?.label ?? "Font"}</button>
              <div className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}
          {selected.type === "image" && (
            <>
              <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/30 p-0.5">
                {(["cover", "contain", "fill"] as const).map((fit) => (
                  <button key={fit} type="button" onClick={() => updateLayer(selected.id, { objectFit: fit })} className={`rounded-md px-2 py-1 text-[11px] capitalize transition ${(selected.objectFit || "cover") === fit ? "bg-white text-neutral-900" : "text-white/60 hover:text-white"}`}>{fit}</button>
                ))}
              </div>
              <button type="button" onClick={() => { replaceImageRef.current = selected.id; fileRef.current?.click(); }} className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white hover:border-white/30">Replace</button>
              {selected.isVideo && <span className="px-1 text-[10px] uppercase tracking-wider text-violet-300/80">Video</span>}
              <div className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}
          {selected.type === "sticker" && (
            <>
              <div className="flex flex-wrap gap-0.5">{STICKERS.slice(0, 10).map((e) => (<button key={e} type="button" onClick={() => updateLayer(selected.id, { emoji: e })} className="rounded-lg bg-white/5 px-1.5 py-0.5 text-base hover:bg-white/15">{e}</button>))}</div>
              <div className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}
          <label className="flex items-center gap-1 text-[11px] text-white/50" title="Rotation">
            <span>Rot</span>
            <input type="range" min={-180} max={180} step={1} value={selected.rotation ?? 0} onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })} className="w-14" />
            <span className="w-7 tabular-nums text-white/40">{selected.rotation ?? 0}°</span>
          </label>
          <label className="flex items-center gap-1 text-[11px] text-white/50" title="Opacity">
            <span>Op</span>
            <input type="range" min={0} max={100} step={1} value={Math.round((selected.opacity ?? 1) * 100)} onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) / 100 })} className="w-14" />
          </label>
          <div className="mx-0.5 h-5 w-px bg-white/10" />
          <ToolBtn title="Flip horizontal" onClick={() => updateLayer(selected.id, { flipX: !selected.flipX })} active={!!selected.flipX}>↔</ToolBtn>
          <ToolBtn title="Flip vertical" onClick={() => updateLayer(selected.id, { flipY: !selected.flipY })} active={!!selected.flipY}>↕</ToolBtn>
          <ToolBtn title={selected.locked ? "Unlock" : "Lock"} onClick={() => updateLayer(selected.id, { locked: !selected.locked })} active={!!selected.locked}>{selected.locked ? "🔓" : "🔒"}</ToolBtn>
          <div className="mx-0.5 h-5 w-px bg-white/10" />
          <ToolBtn title="Bring to front" onClick={() => reorderZ(selected.id, "front")}>⬆︎</ToolBtn>
          <ToolBtn title="Bring forward" onClick={() => reorderZ(selected.id, "forward")}>↑</ToolBtn>
          <ToolBtn title="Send backward" onClick={() => reorderZ(selected.id, "backward")}>↓</ToolBtn>
          <ToolBtn title="Send to back" onClick={() => reorderZ(selected.id, "back")}>⬇︎</ToolBtn>
          <div className="mx-0.5 h-5 w-px bg-white/10" />
          <ToolBtn title="Duplicate (⌘D)" onClick={() => duplicateLayer(selected.id)}>⧉</ToolBtn>
          <ToolBtn title="Undo (⌘Z)" onClick={undo}>↶</ToolBtn>
          <ToolBtn title="Redo (⌘⇧Z)" onClick={redo}>↷</ToolBtn>
          <ToolBtn title="Delete" danger onClick={() => removeLayer(selected.id)}>Delete</ToolBtn>
        </div>
      )}

      {fontPanelOpen && selected?.type === "text" && (
        <div className="fixed bottom-24 left-1/2 z-50 max-h-[50vh] w-[min(420px,92vw)] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900/98 p-3 shadow-2xl backdrop-blur">
          <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">Fonts</p>
          <div className="grid grid-cols-1 gap-1">
            {FONTS.map((f) => (
              <button key={f.value} type="button" onClick={() => { updateLayer(selected.id, { fontFamily: f.value }); setFontPanelOpen(false); }} className={`rounded-xl px-3 py-2.5 text-left transition ${selected.fontFamily === f.value ? "bg-white text-neutral-900" : "bg-white/5 text-white hover:bg-white/10"}`}>
                <span className="block text-[10px] uppercase tracking-wider opacity-50">{f.label}</span>
                <span className="mt-0.5 block text-lg leading-tight" style={{ fontFamily: f.value }}>Aa · {brand.trim() || "Your brand"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedId === "__stickers__" && (
        <div className="fixed bottom-8 left-1/2 z-50 w-[min(560px,94vw)] -translate-x-1/2 rounded-2xl border border-white/15 bg-neutral-900/98 p-3 shadow-2xl backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">Stickers</p>
            <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5">
              {(["emoji", "icons", "gif"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStickerTab(tab);
                    setStickerQuery("");
                    setIconResults([]);
                  }}
                  className={`rounded-md px-2.5 py-1 text-[11px] capitalize transition ${stickerTab === tab ? "bg-white text-neutral-900" : "text-white/55 hover:text-white"}`}
                >
                  {tab === "gif" ? "Animated" : tab}
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1" />
            <button type="button" onClick={() => setSelectedId(null)} className="text-xs text-white/40 hover:text-white">Close</button>
          </div>
          <div className="mb-2">
            <input
              type="search"
              value={stickerQuery}
              onChange={(e) => {
                const v = e.target.value;
                setStickerQuery(v);
                if (stickerTab === "icons") {
                  void runIconSearch(v);
                }
              }}
              placeholder={stickerTab === "emoji" ? "Search emoji — fire, smile, rocket…" : stickerTab === "icons" ? "Search icons — rocket, heart, logo…" : "Search animated…"}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              autoFocus
            />
          </div>
          <div className="max-h-[44vh] overflow-y-auto pr-1">
            {stickerTab === "emoji" && (
              stickerQuery.trim() ? (
                <div className="flex flex-wrap gap-1">
                  {searchEmojis(stickerQuery, 100).map((item) => (
                    <button
                      key={`${item.e}-${item.k}`}
                      type="button"
                      title={item.k}
                      onClick={() => addSticker(item.e)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-2xl transition hover:scale-110 hover:bg-white/15"
                    >
                      {item.e}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {STICKER_PACKS.map((pack) => (
                    <div key={pack.id}>
                      <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-white/30">{pack.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {pack.items.map((e) => (
                          <button key={`${pack.id}-${e}`} type="button" onClick={() => addSticker(e)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-2xl transition hover:scale-110 hover:bg-white/15">{e}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="px-1 pt-1 text-[11px] text-white/35">{EMOJI_LIB.length}+ emoji searchable — try typing a keyword above.</p>
                </div>
              )
            )}
            {stickerTab === "icons" && (
              <div>
                {!stickerQuery.trim() && (
                  <p className="mb-2 px-1 text-[12px] text-white/45">Search 200k+ open-source icons via Iconify (Material, Lucide, Tabler, Phosphor…).</p>
                )}
                {iconLoading && <p className="px-1 text-xs text-white/40">Searching…</p>}
                <div className="flex flex-wrap gap-1.5">
                  {iconResults.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      title={ic.id}
                      onClick={() => addIconSticker(ic.svgUrl, "icon")}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 p-1.5 transition hover:scale-105 hover:bg-white/15"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ic.svgUrl} alt={ic.id} className="h-full w-full object-contain invert" />
                    </button>
                  ))}
                </div>
                {stickerQuery.trim() && !iconLoading && iconResults.length === 0 && (
                  <p className="px-1 text-xs text-white/40">No icons found.</p>
                )}
              </div>
            )}
            {stickerTab === "gif" && (
              <div className="space-y-3 px-1">
                <p className="text-[12px] leading-relaxed text-white/50">
                  Animated stickers: upload a <strong className="text-white/80">GIF</strong> via <strong className="text-white/80">Image / Video</strong> in the + menu — loops on the board and exports as the first frame.
                </p>
                <p className="text-[12px] text-white/40">
                  Public animated libraries (Tenor / Giphy) need an API key for production search — we can wire that next if you want live GIF search in-panel.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    fileRef.current?.click();
                  }}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
                >
                  Upload GIF / image
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {drawMode && (
        <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/15 bg-neutral-900/95 px-4 py-2.5 shadow-2xl backdrop-blur">
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Draw</span>
          <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
          <label className="flex items-center gap-1 text-[11px] text-white/50">
            <span>Size</span>
            <input type="range" min={1} max={24} step={1} value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className="w-20" />
          </label>
          <button type="button" onClick={() => setDrawMode(false)} className="ml-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-200">Done</button>
        </div>
      )}

      {aiOpen && (
        <div className="fixed bottom-8 left-1/2 z-50 w-[min(420px,94vw)] -translate-x-1/2 rounded-2xl border border-white/15 bg-neutral-900/98 p-4 shadow-2xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">AI assist</p>
            <button type="button" onClick={() => setAiOpen(false)} className="text-xs text-white/40 hover:text-white">Close</button>
          </div>
          <p className="mb-2 text-[12px] text-white/50">Describe a headline — placed as bold text on the face. Image gen next.</p>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. YOUR FACE. ONE BRAND." rows={2} className="mb-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30" />
          <button type="button" disabled={!aiPrompt.trim() || aiBusy} onClick={runAi} className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40">{aiBusy ? "Generating…" : "Add to board"}</button>
        </div>
      )}

      {!showCenterPlus && !drawMode && (
        <button type="button" onClick={() => setPlusOpen((v) => !v)} className="fixed bottom-8 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-neutral-900 shadow-lg transition hover:scale-105" aria-label="Add">+</button>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const replaceId = replaceImageRef.current;
          replaceImageRef.current = null;
          onUpload(f, replaceId || undefined);
          e.target.value = "";
        }} />
    </div>
  );
}
