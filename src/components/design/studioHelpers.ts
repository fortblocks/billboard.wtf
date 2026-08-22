import type { Layer } from "@/lib/types";

/** Curated billboard font library — system + Google (loaded in layout). */
export const FONTS: { label: string; value: string; sample?: string }[] = [
  { label: "Impact", value: "Impact, Haettenschweiler, 'Arial Black', sans-serif" },
  { label: "Anton", value: "var(--font-anton), Impact, sans-serif" },
  { label: "Bebas", value: "var(--font-bebas), 'Arial Narrow', sans-serif" },
  { label: "Oswald", value: "var(--font-oswald), 'Arial Narrow', sans-serif" },
  { label: "Archivo Black", value: "var(--font-archivo), 'Arial Black', sans-serif" },
  { label: "Black Ops", value: "var(--font-blackops), Impact, sans-serif" },
  { label: "Russo One", value: "var(--font-russo), sans-serif" },
  { label: "Bangers", value: "var(--font-bangers), Impact, sans-serif" },
  { label: "Permanent Marker", value: "var(--font-marker), cursive" },
  { label: "Playfair", value: "var(--font-playfair), Georgia, serif" },
  { label: "Space Grotesk", value: "var(--font-space), system-ui, sans-serif" },
  { label: "Inter", value: "var(--font-inter), system-ui, sans-serif" },
  { label: "Geist Sans", value: "var(--font-geist-sans), system-ui, sans-serif" },
  { label: "Geist Mono", value: "var(--font-geist-mono), ui-monospace, monospace" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "System Sans", value: "system-ui, -apple-system, sans-serif" },
  { label: "Arial Black", value: "'Arial Black', 'Helvetica Bold', sans-serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
];

export type StickerPack = { id: string; label: string; items: string[] };

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "hot",
    label: "Hot",
    items: ["🔥", "✨", "🚀", "💎", "🎯", "👑", "⚡", "⭐", "❤️", "🎉", "💯", "💥", "🌟", "🏆", "💪"],
  },
  {
    id: "faces",
    label: "Faces",
    items: ["😀", "😂", "🤣", "😍", "🤩", "😎", "🤔", "😱", "🥺", "😤", "🤯", "😈", "👻", "💀", "🤖"],
  },
  {
    id: "hands",
    label: "Hands",
    items: ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "🤟", "🤘", "👋", "🫡", "💪", "🫶", "✋", "🤙"],
  },
  {
    id: "objects",
    label: "Objects",
    items: ["💰", "💵", "📱", "💻", "📷", "🎬", "🎵", "🎤", "🎧", "🎮", "🕹️", "🕶️", "🧢", "🍔", "🍕"],
  },
  {
    id: "nature",
    label: "Nature",
    items: ["🌈", "☀️", "🌙", "🌊", "🌴", "🌸", "🍀", "🦋", "🐱", "🐶", "🦄", "🐸", "🐝", "🌍", "❄️"],
  },
  {
    id: "symbols",
    label: "Symbols",
    items: ["✅", "❌", "⚠️", "🚫", "➡️", "⬆️", "⬇️", "⬅️", "♻️", "✳️", "❇️", "🔴", "🟢", "🔵", "⬛"],
  },
];

/** Flat list for quick toolbar swaps */
export const STICKERS = STICKER_PACKS.flatMap((p) => p.items);

export function uid() {
  return crypto.randomUUID();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function resolveFontFamily(family: string): string {
  if (!family.includes("var(")) return family;
  return family
    .replace(/var\(--font-anton\)/g, "Anton")
    .replace(/var\(--font-bebas\)/g, "Bebas Neue")
    .replace(/var\(--font-oswald\)/g, "Oswald")
    .replace(/var\(--font-archivo\)/g, "Archivo Black")
    .replace(/var\(--font-blackops\)/g, "Black Ops One")
    .replace(/var\(--font-russo\)/g, "Russo One")
    .replace(/var\(--font-bangers\)/g, "Bangers")
    .replace(/var\(--font-marker\)/g, "Permanent Marker")
    .replace(/var\(--font-playfair\)/g, "Playfair Display")
    .replace(/var\(--font-space\)/g, "Space Grotesk")
    .replace(/var\(--font-inter\)/g, "Inter")
    .replace(/var\(--font-geist-sans\)/g, "system-ui")
    .replace(/var\(--font-geist-mono\)/g, "ui-monospace");
}

/** Apply shared transform (rotation, flip, opacity) around layer centre. */
function withLayerTransform(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  lw: number,
  lh: number,
  layer: Layer,
  draw: () => void
) {
  if (layer.visible === false) return;
  const cx = lx + lw / 2;
  const cy = ly + lh / 2;
  const rot = ((layer.rotation ?? 0) * Math.PI) / 180;
  const sx = layer.flipX ? -1 : 1;
  const sy = layer.flipY ? -1 : 1;
  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -cy);
  draw();
  ctx.restore();
}

function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: "cover" | "contain" | "fill"
) {
  if (fit === "fill") {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  const iw =
    (img as HTMLVideoElement).videoWidth ||
    (img as HTMLImageElement).naturalWidth ||
    (img as HTMLImageElement).width ||
    w;
  const ih =
    (img as HTMLVideoElement).videoHeight ||
    (img as HTMLImageElement).naturalHeight ||
    (img as HTMLImageElement).height ||
    h;
  const scale = fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function videoFirstFrame(src: string): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    const done = () => {
      try {
        const c = document.createElement("canvas");
        c.width = v.videoWidth || 1;
        c.height = v.videoHeight || 1;
        const cctx = c.getContext("2d");
        if (!cctx || !c.width) {
          resolve(null);
          return;
        }
        cctx.drawImage(v, 0, 0);
        resolve(c);
      } catch {
        resolve(null);
      }
    };
    v.onloadeddata = () => {
      v.currentTime = Math.min(0.1, (v.duration || 1) * 0.05);
    };
    v.onseeked = done;
    v.onerror = () => resolve(null);
    v.src = src;
  });
}

export async function rasterizeFace(
  faceEl: HTMLDivElement,
  layers: Layer[]
): Promise<string | null> {
  const rect = faceEl.getBoundingClientRect();
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width * scale));
  canvas.height = Math.max(1, Math.round(rect.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, rect.height);
  const sorted = layers
    .slice()
    .filter((l) => l.visible !== false)
    .sort((a, b) => a.z - b.z);

  for (const layer of sorted) {
    const lx = (layer.x / 100) * rect.width;
    const ly = (layer.y / 100) * rect.height;
    const lw = (layer.w / 100) * rect.width;
    const lh = (layer.h / 100) * rect.height;

    if (layer.type === "text") {
      withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
        if (layer.background) {
          ctx.fillStyle = layer.background;
          const r = Math.min(lh * 0.08, 8);
          roundRect(ctx, lx, ly, lw, lh, r);
          ctx.fill();
        }
        ctx.fillStyle = layer.color;
        const px = Math.max(12, (layer.fontSize / 100) * rect.height * 4);
        const family = resolveFontFamily(layer.fontFamily);
        ctx.font = `${layer.fontStyle === "italic" ? "italic " : ""}${layer.fontWeight} ${px}px ${family}`;
        ctx.textAlign = layer.align;
        ctx.textBaseline = "middle";
        const tx =
          layer.align === "center"
            ? lx + lw / 2
            : layer.align === "right"
              ? lx + lw
              : lx;
        const lines = String(layer.text).split("\n");
        const lineH = px * 1.15;
        const startY = ly + lh / 2 - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, tx, startY + i * lineH, lw);
        });
      });
    } else if (layer.type === "sticker") {
      withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
        ctx.font = `${lh * 0.8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(layer.emoji, lx + lw / 2, ly + lh / 2);
      });
    } else if (layer.type === "image") {
      try {
        let bitmap: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
        if (layer.isVideo) {
          const frame = await videoFirstFrame(layer.src);
          if (!frame) continue;
          bitmap = frame;
        } else {
          bitmap = await loadImage(layer.src);
        }
        const fit = layer.objectFit || "cover";
        withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
          drawFitted(ctx, bitmap, lx, ly, lw, lh, fit);
        });
      } catch {
        /* skip */
      }
    } else if (layer.type === "button") {
      withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
        ctx.fillStyle = layer.bg;
        const r = Math.min(lh / 2, 20);
        roundRect(ctx, lx, ly, lw, lh, r);
        ctx.fill();
        ctx.fillStyle = layer.color;
        ctx.font = `600 ${Math.max(10, lh * 0.35)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(layer.label, lx + lw / 2, ly + lh / 2, lw);
      });
    } else if (layer.type === "shape") {
      withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
        ctx.fillStyle = layer.fill;
        if (layer.shape === "circle") {
          ctx.beginPath();
          ctx.ellipse(lx + lw / 2, ly + lh / 2, lw / 2, lh / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(lx, ly, lw, lh);
        }
      });
    } else if (layer.type === "draw") {
      withLayerTransform(ctx, lx, ly, lw, lh, layer, () => {
        ctx.save();
        // paths stored in 0–100 face % space
        ctx.translate(lx, ly);
        ctx.scale(lw / 100, lh / 100);
        for (const p of layer.paths) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = (p.width / Math.max(lw, lh)) * 100 * 1.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const path = new Path2D(p.d);
          ctx.stroke(path);
        }
        ctx.restore();
      });
    }
  }
  return canvas.toDataURL("image/png");
}
