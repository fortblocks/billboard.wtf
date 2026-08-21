"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";
import { FaceCreative } from "./FaceCreative";
import type { BoardEntry, Creative } from "@/lib/types";

const ROTATE_MS = 9000;

interface LiveBoardProps {
  creative: Creative | null;
  brand?: string;
  emptyLabel?: string;
  showSceneCaption?: boolean;
}

/**
 * 1. Full-bleed environments (fade only)
 * 2. One fixed CSS billboard (never fades)
 * 3. White face = only editable region
 */
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
    <div className="relative w-full min-h-[calc(100vh-6.5rem)]">
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-6.5rem)] items-center justify-center px-3 sm:px-6 lg:px-12">
        <div className="w-full max-w-[min(100%,1200px)]">
          <div
            className="rounded-[2px]"
            style={{
              background:
                "linear-gradient(160deg, #d4d4d4 0%, #9a9a9a 45%, #b8b8b8 100%)",
              padding: "5px",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #8a8a8a, #6e6e6e)",
                padding: "3px",
              }}
            >
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
            className="mx-auto h-[5px] w-[98%]"
            style={{
              background: "linear-gradient(180deg, #7a7a7a, #555)",
              borderRadius: "0 0 2px 2px",
            }}
          />

          <div className="flex flex-col items-center">
            <div className="h-2.5 w-11 bg-[#6a6a6a] sm:w-12" />
            <div
              className="h-12 w-6 sm:h-14 sm:w-7"
              style={{
                background:
                  "linear-gradient(90deg, #5a5a5a, #7a7a7a 40%, #4a4a4a)",
                boxShadow:
                  "inset 1px 0 0 rgba(255,255,255,0.12), inset -1px 0 0 rgba(0,0,0,0.25)",
              }}
            />
            <div className="h-2 w-14 rounded-sm bg-[#3a3a3a]" />
          </div>
        </div>
      </div>

      {showSceneCaption && (
        <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-[10px] tracking-wide text-white/50 sm:text-[11px]">
          Board location:{" "}
          <span className="text-white/70">{scene.location}</span>
          {brand ? (
            <>
              {" "}· Now showing{" "}
              <span className="text-white/90">{brand}</span>
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
