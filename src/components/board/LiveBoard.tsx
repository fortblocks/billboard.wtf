"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 9000;

/** White face inside board-frame.png — measured, slightly inset into bezel. */
const FACE = {
  left: "3.2%",
  top: "4.8%",
  width: "93.6%",
  height: "51.5%",
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
    <div className="w-full">
      <div className="relative w-full min-h-[calc(100vh-7rem)]">
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

        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 sm:px-6 lg:px-10">
          <div
            className="relative w-full"
            style={{
              aspectRatio: "905 / 594",
              maxHeight: "calc(100vh - 8rem)",
              maxWidth: "min(100%, calc((100vh - 8rem) * 905 / 594))",
              backgroundImage: "url(/splash/board-frame.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
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
      </div>

      {showSceneCaption && (
        <p className="relative z-10 -mt-2 text-center text-[10px] tracking-wide text-white/40 sm:text-[11px]">
          Board location:{" "}
          <span className="text-white/55">{scene.location}</span>
          {brand ? (
            <>
              {" "}· Now showing{" "}
              <span className="text-white/70">{brand}</span>
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
