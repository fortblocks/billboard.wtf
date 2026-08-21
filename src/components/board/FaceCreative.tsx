"use client";

import type { Creative, Layer } from "@/lib/types";

function LayerView({ layer }: { layer: Layer }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.w}%`,
    height: `${layer.h}%`,
    opacity: layer.opacity ?? 1,
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
    zIndex: layer.z,
    overflow: "hidden",
  };

  if (layer.type === "text") {
    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
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
          lineHeight: 1.15,
          padding: "0 2%",
          wordBreak: "break-word",
        }}
      >
        {layer.text}
      </div>
    );
  }

  if (layer.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={layer.src}
        alt=""
        style={{ ...style, objectFit: "cover" }}
        draggable={false}
      />
    );
  }

  if (layer.type === "sticker") {
    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "min(8vw, 12vh)",
        }}
      >
        {layer.emoji}
      </div>
    );
  }

  if (layer.type === "shape") {
    return (
      <div
        style={{
          ...style,
          background: layer.fill,
          borderRadius: layer.shape === "circle" ? "50%" : 4,
        }}
      />
    );
  }

  if (layer.type === "button") {
    return (
      <a
        href={layer.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: layer.bg,
          color: layer.color,
          borderRadius: 999,
          fontSize: "min(2vw, 2.2vh)",
          fontWeight: 600,
          textDecoration: "none",
          padding: "0 4%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {layer.label}
      </a>
    );
  }

  return null;
}

export function FaceCreative({
  creative,
  emptyLabel = "Your brand here",
}: {
  creative: Creative | null;
  emptyLabel?: string;
}) {
  if (!creative || creative.layers.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <p className="text-lg font-light tracking-tight text-neutral-400 sm:text-2xl">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-white">
      {creative.layers
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((layer) => (
          <LayerView key={layer.id} layer={layer} />
        ))}
    </div>
  );
}
