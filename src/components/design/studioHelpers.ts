import type { Layer } from "@/lib/types";

export const FONTS = [
  { label: "Sans", value: "system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Display", value: "'Arial Black', sans-serif" },
];

export const STICKERS = [
  "\uD83D\uDD25", "\u2728", "\uD83D\uDE80", "\uD83D\uDC8E", "\uD83C\uDFAF", "\uD83D\uDC51", "\u26A1", "\uD83C\uDF1F", "\u2764\uFE0F", "\uD83C\uDF89",
  "\uD83E\uDD84", "\uD83C\uDF08", "\uD83D\uDC80", "\uD83E\uDDE0", "\uD83D\uDC40", "\uD83D\uDDA4", "\uD83D\uDCAF", "\uD83E\uDEE1", "\uD83E\uDEE0", "\uD83D\uDC7B",
];

export const NOTES = [
  { rot: -7, x: "3%", y: "6%", bg: "#FEF08A", text: "Tap + to add text — change size, colour & font." },
  { rot: 5, x: "68%", y: "8%", bg: "#FBCFE8", text: "Drop a PNG or JPEG. Drag, resize, rotate." },
  { rot: -4, x: "8%", y: "72%", bg: "#BBF7D0", text: "Stickers & emoji — park them anywhere." },
  { rot: 3, x: "62%", y: "70%", bg: "#BFDBFE", text: "Lock & go live when the poster feels iconic." },
];

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
  const sorted = layers.slice().sort((a, b) => a.z - b.z);
  for (const layer of sorted) {
    const lx = (layer.x / 100) * rect.width;
    const ly = (layer.y / 100) * rect.height;
    const lw = (layer.w / 100) * rect.width;
    const lh = (layer.h / 100) * rect.height;
    if (layer.type === "text") {
      ctx.save();
      ctx.fillStyle = layer.color;
      ctx.font = `${layer.fontStyle === "italic" ? "italic " : ""}${layer.fontWeight} ${Math.max(12, (layer.fontSize / 100) * rect.height * 4)}px ${layer.fontFamily}`;
      ctx.textAlign = layer.align;
      ctx.textBaseline = "middle";
      const tx =
        layer.align === "center"
          ? lx + lw / 2
          : layer.align === "right"
            ? lx + lw
            : lx;
      ctx.fillText(layer.text, tx, ly + lh / 2, lw);
      ctx.restore();
    } else if (layer.type === "sticker") {
      ctx.font = `${lh * 0.8}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.emoji, lx + lw / 2, ly + lh / 2);
    } else if (layer.type === "image") {
      try {
        const img = await loadImage(layer.src);
        ctx.drawImage(img, lx, ly, lw, lh);
      } catch {
        // skip
      }
    } else if (layer.type === "button") {
      ctx.fillStyle = layer.bg;
      const r = Math.min(lh / 2, 20);
      roundRect(ctx, lx, ly, lw, lh, r);
      ctx.fill();
      ctx.fillStyle = layer.color;
      ctx.font = `600 ${Math.max(10, lh * 0.35)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.label, lx + lw / 2, ly + lh / 2, lw);
    }
  }
  return canvas.toDataURL("image/png");
}
