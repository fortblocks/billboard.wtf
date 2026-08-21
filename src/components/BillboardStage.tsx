"use client";

import { ReactNode } from "react";

interface BillboardStageProps {
  children: ReactNode;
}

/**
 * Physical billboard chrome matching the splash design language.
 * The interactive grid sits in the face.
 */
export function BillboardStage({ children }: BillboardStageProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#dedede]">
      {/* Studio ground */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#eaeaea] via-[#ddd] to-[#cfcfcf]" />

      {/* Billboard unit — constrained so frame + pillar always fit */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[min(88vw,920px)] flex-col items-center px-3">
        {/* Logo */}
        <div className="mb-3 shrink-0 text-center text-[11px] font-medium tracking-[0.28em] text-neutral-500 sm:mb-4 sm:text-xs">
          billboard<span className="text-neutral-400">.wtf</span>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="text-neutral-400">2026</span>
        </div>

        {/* Frame stack */}
        <div className="relative w-full shrink min-h-0">
          {/* Outer metal */}
          <div
            className="relative bg-[#b8b8b8] p-[7px] sm:p-[9px]"
            style={{
              borderRadius: 3,
              boxShadow:
                "0 28px 50px -18px rgba(0,0,0,0.4), 0 10px 24px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.12)",
            }}
          >
            {/* Mid metal */}
            <div
              className="bg-[#9e9e9e] p-[3px] sm:p-[4px]"
              style={{ borderRadius: 2 }}
            >
              {/* Face */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-[#0c0c0c]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                }}
              >
                {children}
              </div>
            </div>
          </div>

          {/* Lip under frame */}
          <div
            className="mx-auto h-[8px] w-[97%] bg-gradient-to-b from-[#8f8f8f] to-[#6f6f6f]"
            style={{
              borderRadius: "0 0 3px 3px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* Pillar */}
        <div className="flex shrink-0 flex-col items-center">
          <div className="h-3 w-11 bg-gradient-to-b from-[#8a8a8a] to-[#6a6a6a] sm:h-4 sm:w-12" />
          <div
            className="h-14 w-8 bg-gradient-to-b from-[#757575] via-[#656565] to-[#555] sm:h-16 sm:w-9"
            style={{
              boxShadow:
                "inset 2px 0 0 rgba(255,255,255,0.18), inset -2px 0 0 rgba(0,0,0,0.25)",
            }}
          />
          <div
            className="h-2.5 w-16 rounded-sm bg-gradient-to-b from-[#5a5a5a] to-[#3f3f3f] sm:w-[72px]"
            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}
          />
        </div>
      </div>

      {/* Hint */}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] tracking-wide text-neutral-500 sm:bottom-4 sm:text-[11px]">
        Drag to select · Scroll to zoom · Space + drag to pan
      </p>
    </div>
  );
}
