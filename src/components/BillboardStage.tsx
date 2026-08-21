"use client";

import { ReactNode } from "react";

interface BillboardStageProps {
  children: ReactNode;
}

/**
 * Wide landscape billboard chrome matching the splash boards.
 * Square grid is centered on the face.
 */
export function BillboardStage({ children }: BillboardStageProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#dedede]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#eaeaea] via-[#ddd] to-[#cfcfcf]" />

      <div className="relative z-10 flex w-full max-w-[min(94vw,1280px)] flex-col items-center px-3">
        {/* Logo — sits in the top band like splash */}
        <div className="mb-3 shrink-0 text-center text-[11px] font-medium tracking-[0.28em] text-neutral-500 sm:mb-4 sm:text-xs">
          billboard<span className="text-neutral-400">.wtf</span>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="text-neutral-400">2026</span>
        </div>

        {/* Wide frame */}
        <div className="relative w-full">
          <div
            className="relative bg-[#b8b8b8] p-[6px] sm:p-[8px]"
            style={{
              borderRadius: 2,
              boxShadow:
                "0 28px 50px -18px rgba(0,0,0,0.4), 0 10px 24px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="bg-[#9e9e9e] p-[2px] sm:p-[3px]"
              style={{ borderRadius: 1 }}
            >
              {/* Wide face — landscape, grid centered inside */}
              <div
                className="relative flex w-full items-center justify-center overflow-hidden bg-[#0c0c0c]"
                style={{
                  aspectRatio: "2.4 / 1",
                  maxHeight: "min(62vh, 520px)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                }}
              >
                {/* Square grid area — height fills the face, width matches height */}
                <div className="relative h-full aspect-square max-w-full">
                  {children}
                </div>
              </div>
            </div>
          </div>

          <div
            className="mx-auto h-[7px] w-[98%] bg-gradient-to-b from-[#8f8f8f] to-[#6f6f6f]"
            style={{
              borderRadius: "0 0 2px 2px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* Pillar */}
        <div className="flex flex-col items-center">
          <div className="h-3 w-12 bg-gradient-to-b from-[#8a8a8a] to-[#6a6a6a] sm:h-3.5 sm:w-14" />
          <div
            className="h-12 w-7 bg-gradient-to-b from-[#757575] via-[#656565] to-[#555] sm:h-14 sm:w-8"
            style={{
              boxShadow:
                "inset 2px 0 0 rgba(255,255,255,0.18), inset -2px 0 0 rgba(0,0,0,0.25)",
            }}
          />
          <div
            className="h-2 w-14 rounded-sm bg-gradient-to-b from-[#5a5a5a] to-[#3f3f3f] sm:h-2.5 sm:w-16"
            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}
          />
        </div>
      </div>

      <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] tracking-wide text-neutral-500 sm:bottom-4 sm:text-[11px]">
        Drag to select · Scroll to zoom · Space + drag to pan
      </p>
    </div>
  );
}
