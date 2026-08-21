"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 9000;

/** Face region inside board-frame.png (measured). */
const FACE = {
  left: "2.4%",
  top: "3.6%",
  width: "95.2%",
  height: "54.4%",
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
      }, 600);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className="relative w-full max-w-[min(96vw,1100px)]">
      <div className="relative overflow-hidden rounded-sm bg-neutral-900">
        <div className="absolute inset-0">
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
        </div>

        <div className="relative z-10 mx-auto w-[min(100%,920px)] px-3 py-6 sm:py-8">
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/splash/board-frame.png"
              alt=""
              className="relative z-10 block h-auto w-full select-none"
              draggable={false}
            />

            <div
              className="absolute z-20 overflow-hidden"
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
      </div>

      {showSceneCaption && (
        <p className="mt-3 text-center text-[10px] tracking-wide text-neutral-500 sm:text-[11px]">
          Board location:{" "}
          <span className="text-neutral-400">{scene.location}</span>
          {brand ? (
            <>
              {" "}· Now showing{" "}
              <span className="text-neutral-300">{brand}</span>
            </>
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
        style={{ aspectRatio: "2.4 / 1" }}
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
