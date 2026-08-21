"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 10000;

interface LiveBoardProps {
  creative: Creative | null;
  brand?: string;
  emptyLabel?: string;
  showSceneCaption?: boolean;
}

/**
 * RETHINK — two layers only:
 *
 * 1. Atmosphere: full-bleed world photo, blurred + darkened so any
 *    baked-in billboard disappears. Crossfades.
 * 2. The Board: one sharp CSS billboard, fixed, never fades.
 *    White face is the only editable surface.
 *
 * No transparent PNGs. No face-percentage math. No double boards.
 */
export function LiveBoard({
  creative,
  brand,
  emptyLabel,
  showSceneCaption = true,
}: LiveBoardProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSceneIndex((i) => (i + 1) % SCENES.length);
        setVisible(true);
      }, 500);
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
            opacity: i === sceneIndex && visible ? 1 : 0,
          }}
        >
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${s.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(14px) saturate(1.1) brightness(0.55)",
            }}
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 25%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-6.5rem)] items-center justify-center px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-[1100px]">
          <div
            className="rounded-sm"
            style={{
              background:
                "linear-gradient(145deg, #e8e8e8 0%, #a0a0a0 40%, #c8c8c8 70%, #909090 100%)",
              padding: "6px",
              boxShadow:
                "0 30px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #7a7a7a, #555)",
                padding: "4px",
              }}
            >
              <div
                className="relative w-full overflow-hidden bg-white"
                style={{ aspectRatio: "2.35 / 1" }}
              >
                <FaceCreative
                  creative={creative}
                  emptyLabel={emptyLabel ?? "The board is open"}
                />
              </div>
            </div>
          </div>

          <div
            className="mx-auto h-1.5 w-[97%]"
            style={{
              background: "linear-gradient(180deg, #666, #333)",
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className="h-3 w-12"
              style={{
                background: "linear-gradient(180deg, #777, #555)",
              }}
            />
            <div
              className="h-14 w-7 sm:h-16 sm:w-8"
              style={{
                background:
                  "linear-gradient(90deg, #4a4a4a 0%, #6e6e6e 35%, #5a5a5a 65%, #3a3a3a 100%)",
                boxShadow:
                  "inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(0,0,0,0.3)",
              }}
            />
            <div
              className="h-2.5 w-16 rounded-sm"
              style={{
                background: "linear-gradient(180deg, #444, #222)",
              }}
            />
          </div>
        </div>
      </div>

      {showSceneCaption && (
        <p className="absolute bottom-4 left-0 right-0 z-10 text-center text-[11px] tracking-wider text-white/45">
          {scene.location}
          {brand ? (
            <span className="text-white/70">
              {" "}· {brand}
            </span>
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
