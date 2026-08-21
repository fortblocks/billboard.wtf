"use client";

import { ReactNode } from "react";

interface BillboardStageProps {
  children: ReactNode;
}

/**
 * Physical billboard chrome matching the splash design language.
 * The interactive grid sits in the white face.
 */
export function BillboardStage({ children }: BillboardStageProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#e8e8e8]">
      {/* Soft studio gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f0f0f0] via-[#e4e4e4] to-[#d8d8d8]" />

      {/* Billboard unit */}
      <div className="relative z-10 flex w-full max-w-[min(92vw,1100px)] flex-col items-center px-4">
        {/* Logo above the board */}
        <div className="mb-4 text-center text-xs font-medium tracking-[0.25em] text-neutral-500 sm:mb-5 sm:text-sm">
          billboard<span className="text-neutral-400">.wtf</span>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="text-neutral-400">2026</span>
        </div>

        {/* Frame + face */}
        <div className="relative w-full">
          {/* Outer metal frame */}
          <div
            className="relative overflow-hidden rounded-[2px] bg-[#c5c5c5] p-[5px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_8px_20px_-8px_rgba(0,0,0,0.2)] sm:p-[6px]"
            style={{
              boxShadow:
                "0 25px 60px -15px rgba(0,0,0,0.35), 0 8px 20px -8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* Inner bevel */}
            <div className="rounded-[1px] bg-[#a8a8a8] p-[2px] sm:p-[3px]">
              {/* The face — square aspect for the 1500×1500 grid */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-[#0c0c0c]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
                }}
              >
                {children}
              </div>
            </div>
          </div>

          {/* Underside lip */}
          <div className="mx-auto h-[6px] w-[98%] rounded-b-sm bg-gradient-to-b from-[#9a9a9a] to-[#7a7a7a] shadow-sm" />
        </div>

        {/* Pillar */}
        <div className="flex flex-col items-center">
          <div className="h-3 w-10 bg-gradient-to-b from-[#8a8a8a] to-[#6e6e6e] sm:h-4 sm:w-12" />
          <div
            className="h-16 w-7 bg-gradient-to-b from-[#7a7a7a] via-[#6a6a6a] to-[#5a5a5a] sm:h-20 sm:w-8"
            style={{
              boxShadow: "inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(0,0,0,0.2)",
            }}
          />
          {/* Base plate */}
          <div className="h-2 w-14 rounded-sm bg-gradient-to-b from-[#6a6a6a] to-[#4a4a4a] sm:h-2.5 sm:w-16" />
        </div>
      </div>

      {/* Hint */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] tracking-wide text-neutral-400 sm:bottom-5 sm:text-[11px]">
        Drag to select · Scroll to zoom · Space + drag to pan
      </p>
    </div>
  );
}
