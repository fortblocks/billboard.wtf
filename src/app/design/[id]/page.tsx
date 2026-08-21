"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/board/SiteNav";
import { FaceCreative } from "@/components/board/FaceCreative";
import { SCENES } from "@/lib/scenes";
import { getState, saveCreative, lockAndPublish } from "@/lib/store";
import type { BoardEntry, Creative, Layer, TextLayer, ImageLayer, StickerLayer } from "@/lib/types";

const FONTS = ["system-ui", "Georgia, serif", "ui-monospace, monospace", "Impact, sans-serif"];
const STICKERS = ["\uD83D\uDD25", "\u2728", "\uD83D\uDE80", "\uD83D\uDC8E", "\uD83C\uDFAF", "\uD83D\uDC51"];

export default function DesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<BoardEntry | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewScene, setPreviewScene] = useState(0);
  const [tab, setTab] = useState<"text" | "image" | "sticker">("text");

  useEffect(() => {
    const e = getState().entries.find((x) => x.id === id) ?? null;
    setEntry(e);
    if (e?.creative?.layers?.length) setLayers(e.creative.layers);
    else if (e) {
      setLayers([
        {
          id: crypto.randomUUID(),
          type: "text",
          text: e.brand.toUpperCase(),
          x: 8, y: 32, w: 84, h: 36, z: 1,
          fontFamily: "system-ui", fontSize: 7, color: "#111",
          fontWeight: 700, fontStyle: "normal", align: "center",
        },
      ]);
    }
  }, [id]);

  const creative: Creative = useMemo(
    () => ({ layers, updatedAt: new Date().toISOString() }),
    [layers]
  );
  const selected = layers.find((l) => l.id === selectedId) ?? null;

  const updateLayer = (lid: string, patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === lid ? ({ ...l, ...patch } as Layer) : l)));
  };

  const addText = () => {
    const layer: TextLayer = {
      id: crypto.randomUUID(), type: "text", text: "New text",
      x: 20, y: 40, w: 60, h: 20, z: layers.length + 1,
      fontFamily: "system-ui", fontSize: 4, color: "#111",
      fontWeight: 600, fontStyle: "normal", align: "center",
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
  };

  const addSticker = (emoji: string) => {
    const layer: StickerLayer = {
      id: crypto.randomUUID(), type: "sticker", emoji,
      x: 40, y: 35, w: 20, h: 30, z: layers.length + 1,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(layer.id);
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const layer: ImageLayer = {
        id: crypto.randomUUID(), type: "image", src: String(reader.result),
        x: 25, y: 15, w: 50, h: 70, z: layers.length + 1,
      };
      setLayers((p) => [...p, layer]);
      setSelectedId(layer.id);
    };
    reader.readAsDataURL(file);
  };

  const lock = () => {
    if (!entry) return;
    saveCreative(entry.id, creative);
    lockAndPublish(entry.id);
    router.push("/");
  };

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white/50">
        Entry not found. <Link href="/claim" className="ml-2 underline">Claim a slot</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 pt-20 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-white/40">Design your board</p>
              <p className="text-sm text-white/70">{entry.brand}</p>
            </div>
            <div className="flex gap-1">
              {SCENES.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setPreviewScene(i)}
                  className={`rounded-full px-2.5 py-1 text-[10px] ${
                    previewScene === i ? "bg-white/20 text-white" : "text-white/40"
                  }`}>{s.name}</button>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg" style={{
            backgroundImage: `url(${SCENES[previewScene].src})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}>
            <div className="flex items-center justify-center px-6 py-10">
              <div className="w-full max-w-xl">
                <div className="bg-[#b8b8b8] p-[5px]">
                  <div className="relative overflow-hidden bg-white" style={{ aspectRatio: "2.4 / 1" }}
                    onClick={() => setSelectedId(null)}>
                    <FaceCreative creative={creative} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/35">
            Face only. Worlds rotate on the live board.
          </p>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex gap-1">
              {(["text", "image", "sticker"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`rounded-full px-2.5 py-1 text-[11px] capitalize ${
                    tab === t ? "bg-white/15 text-white" : "text-white/45"
                  }`}>{t}</button>
              ))}
            </div>
            {tab === "text" && (
              <button type="button" onClick={addText}
                className="w-full rounded-lg border border-dashed border-white/20 py-2 text-xs text-white/70">+ Add text</button>
            )}
            {tab === "image" && (
              <label className="flex w-full cursor-pointer justify-center rounded-lg border border-dashed border-white/20 py-2 text-xs text-white/70">
                + Upload image
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
              </label>
            )}
            {tab === "sticker" && (
              <div className="flex flex-wrap gap-1">
                {STICKERS.map((e) => (
                  <button key={e} type="button" onClick={() => addSticker(e)}
                    className="rounded-lg bg-white/5 px-2 py-1 text-lg">{e}</button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Layers</p>
            <ul className="max-h-36 space-y-1 overflow-y-auto">
              {layers.slice().sort((a, b) => b.z - a.z).map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => setSelectedId(l.id)}
                    className={`flex w-full justify-between rounded-md px-2 py-1.5 text-left text-[11px] ${
                      selectedId === l.id ? "bg-white/15 text-white" : "text-white/55"
                    }`}>
                    <span className="truncate">
                      {l.type === "text" ? l.text : l.type === "sticker" ? l.emoji : l.type}
                    </span>
                    <span role="button" tabIndex={0} className="text-white/30"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setLayers((p) => p.filter((x) => x.id !== l.id));
                        if (selectedId === l.id) setSelectedId(null);
                      }}>\u00d7</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selected && selected.type === "text" && (
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <textarea value={selected.text} rows={2}
                onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                className="w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs" />
              <input type="range" min={2} max={12} step={0.5} value={selected.fontSize}
                onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) })}
                className="w-full" />
              <input type="color" value={selected.color}
                onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                className="h-7 w-full" />
              <select value={selected.fontFamily}
                onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
                className="w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs">
                {FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
              </select>
            </div>
          )}

          <button type="button" onClick={() => entry && saveCreative(entry.id, creative)}
            className="w-full rounded-full border border-white/20 py-2.5 text-sm text-white/80">
            Save draft
          </button>
          <button type="button" onClick={lock}
            className="w-full rounded-full bg-white py-2.5 text-sm font-medium text-neutral-900">
            Lock board & go live
          </button>
        </aside>
      </div>
    </div>
  );
}
