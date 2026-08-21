"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 9000;

/** White face of board-frame.png (994x571) — locked. */
const FACE = {
  left: "2.0%",
  top: "3.2%",
  width: "86.7%",
  height: "56.6%",
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
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
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

      <div className="relative z-10 flex h-full w-full items-end justify-center px-3 pb-1 pt-2 sm:px-5 sm:pb-2 sm:pt-3">
        <div className="relative inline-block max-h-full max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash/board-frame.png"
            alt=""
            className="block max-h-[calc(100vh-6.5rem-1rem)] max-w-[min(94vw,1600px)] w-auto h-auto select-none"
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
        <p className="pointer-events-none absolute bottom-1 left-0 right-0 z-10 text-center text-[10px] tracking-wide text-white/50 sm:text-[11px]">
          {scene.location}
          {brand ? <span className="text-white/75"> · {brand}</span> : null}
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
