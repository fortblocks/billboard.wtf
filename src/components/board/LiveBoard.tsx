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
    <div className="relative h-full w-full overflow-hidden">
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

      <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex items-end justify-center">
        <div
          className="relative"
          style={{ width: "min(96vw, 1700px)", transform: "translateY(100px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash/board-frame.png"
            alt=""
            className="block h-auto w-full select-none"
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
        <p className="pointer-events-none absolute bottom-14 left-0 right-0 z-10 text-center text-[10px] tracking-wide text-white/55 sm:bottom-16 sm:text-[11px]">
          {scene.location}
          {brand ? <span className="text-white/80"> · {brand}</span> : null}
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
