"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 8000;

/** Face region on photoreal boards — consistent frontal placement. */
const FACE = {
  left: "11.5%",
  top: "20.5%",
  width: "77%",
  height: "39%",
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
      }, 500);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className="relative w-full max-w-[min(96vw,1280px)]">
      <div
        className="relative overflow-hidden rounded-sm"
        style={{ aspectRatio: "16 / 10" }}
      >
        {SCENES.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === sceneIndex && fade ? 1 : 0,
              backgroundImage: `url(${s.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}

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
