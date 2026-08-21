"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 8000;

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
      <div className="relative overflow-hidden rounded-sm">
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

        <div className="bg-[#1a1a1a]" style={{ aspectRatio: "16 / 10" }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
          <div className="w-full max-w-[920px]">
            <div
              className="bg-[#b8b8b8] p-[5px] sm:p-[7px]"
              style={{
                borderRadius: 2,
                boxShadow:
                  "0 20px 40px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <div className="bg-[#9a9a9a] p-[2px] sm:p-[3px]">
                <div
                  className="relative w-full overflow-hidden bg-white"
                  style={{ aspectRatio: "2.4 / 1" }}
                >
                  <FaceCreative
                    creative={creative}
                    emptyLabel={emptyLabel ?? "The board is open"}
                  />
                </div>
              </div>
            </div>
            <div
              className="mx-auto h-[6px] w-[98%] bg-gradient-to-b from-[#888] to-[#666]"
              style={{ borderRadius: "0 0 2px 2px" }}
            />
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-11 bg-[#777] sm:w-12" />
              <div
                className="h-10 w-6 bg-gradient-to-b from-[#6a6a6a] to-[#4a4a4a] sm:h-12 sm:w-7"
                style={{
                  boxShadow:
                    "inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(0,0,0,0.2)",
                }}
              />
              <div className="h-2 w-14 rounded-sm bg-[#3f3f3f]" />
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
              {" "}· Now showing <span className="text-neutral-300">{brand}</span>
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
      <div className="bg-[#b8b8b8] p-[3px]" style={{ borderRadius: 2 }}>
        <div
          className="relative overflow-hidden bg-white"
          style={{ aspectRatio: "2.4 / 1" }}
        >
          <FaceCreative creative={entry.creative} emptyLabel={entry.brand} />
        </div>
      </div>
      <p className="mt-1.5 truncate text-center text-[11px] text-neutral-400">
        #{entry.number} · {entry.brand}
        {entry.amountPaid > 0 ? ` · $${entry.amountPaid}` : " · pioneer"}
      </p>
    </div>
  );
}
