"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 9000;

/** White face inside cropped board-frame.png (998x575). */
const FACE = {
  left: "2.4%",
  top: "3.8%",
  width: "85.8%",
  height: "55.0%",
};

interface LiveBoardProps {
  creative: Creative | null;
  brand?: string;
  emptyLabel?: string;
  showSceneCaption?: boolean;
}

export function LiveBoard({
  creative,
  brand,
  emptyLabel,
  showSceneCaption = true,
}: LiveBoardProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSceneIndex((i) => (i + 1) % SCENES.length);
        setFade(true);
      }, 550);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className="relative w-full min-h-[calc(100vh-6.5rem)] overflow-hidden bg-neutral-950">
      {SCENES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === sceneIndex && fade ? 1 : 0,
            backgroundImage: `url(${s.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-[calc(100vh-6.5rem)] items-center justify-center px-2 sm:px-4 lg:px-8">
        <div
          className="relative w-full"
          style={{
            aspectRatio: "998 / 575",
            maxHeight: "min(72vh, calc(100vh - 7rem))",
            maxWidth: "min(96vw, 1400px, calc(min(72vh, 100vh - 7rem) * 998 / 575))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash/board-frame.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            style={{ objectFit: "fill" }}
            draggable={false}
          />

          <div
            className="absolute overflow-hidden"
            style={{
              left: FACE.left,
              top: FACE.top,
              width: FACE.width,
              height: FACE.height,
            }}
          >
            <FaceCreative
              creative={creative}
              emptyLabel={emptyLabel ?? "The board is open"}
            />
          </div>
        </div>
      </div>

      {showSceneCaption && (
        <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-[10px] tracking-wide text-white/55 sm:text-[11px]">
          {scene.location}
          {brand ? (
            <span className="text-white/80"> · {brand}</span>
          ) : null}
        </p>
      )}
    </div>
  );
}

export function BoardThumb({ entry }: { entry: BoardEntry }) {
  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-sm border border-white/10 bg-white"
        style={{ aspectRatio: "2.35 / 1" }}
      >
        <FaceCreative creative={entry.creative} emptyLabel={entry.brand} />
      </div>
      <p className="mt-1.5 truncate text-center text-[11px] text-neutral-400">
        #{entry.number} · {entry.brand}
        {entry.amountPaid > 0 ? ` · $${entry.amountPaid}` : " · pioneer"}
      </p>
    </div>
  );
}
