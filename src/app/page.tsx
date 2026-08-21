"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveBoard } from "@/components/board/LiveBoard";
import { SiteNav } from "@/components/board/SiteNav";
import {
  getState,
  getLiveEntry,
  subscribe,
  bumpEntry,
} from "@/lib/store";
import { bumpCost } from "@/lib/ladder";
import type { BoardEntry, LadderState } from "@/lib/types";

export default function HomePage() {
  const [state, setState] = useState<LadderState | null>(null);
  const [live, setLive] = useState<BoardEntry | null>(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const refresh = () => {
    const s = getState();
    setState(s);
    setLive(getLiveEntry());
  };

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, []);

  if (!state) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  const past = state.entries
    .filter((e) => e.creative && e.status !== "draft")
    .slice()
    .reverse();

  const viewing =
    showHistory && past[historyIndex] ? past[historyIndex] : live;
  const price = state.currentPrice;

  const bumpable = past.find(
    (e) => e.kind !== "pioneer" && e.id !== live?.id && e.originalPaid > 0
  );

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-950 text-white">
      <SiteNav />

      <main className="absolute inset-x-0 bottom-0 top-14 sm:top-16">
        <LiveBoard
          creative={viewing?.creative ?? null}
          brand={viewing?.brand}
          emptyLabel="The board is open"
        />

        {past.length > 0 && (
          <div className="pointer-events-none absolute bottom-24 left-0 right-0 z-20 flex items-center justify-center gap-3 sm:bottom-28">
            <button
              type="button"
              onClick={() => {
                setShowHistory(true);
                setHistoryIndex((i) => Math.min(i + 1, past.length - 1));
              }}
              disabled={showHistory && historyIndex >= past.length - 1}
              className="pointer-events-auto rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] text-white/70 backdrop-blur transition hover:border-white/30 hover:text-white disabled:opacity-30"
            >
              ← Earlier
            </button>
            <button
              type="button"
              onClick={() => {
                if (!showHistory) return;
                if (historyIndex <= 0) setShowHistory(false);
                else setHistoryIndex((i) => i - 1);
              }}
              className="pointer-events-auto rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] text-white/70 backdrop-blur transition hover:border-white/30 hover:text-white"
            >
              {showHistory ? "Later →" : "Live"}
            </button>
            <Link
              href="/hall"
              className="pointer-events-auto text-[11px] text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              Full history
            </Link>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Board is at
              </p>
              <p className="text-2xl font-semibold tracking-tight text-white">
                ${price}
              </p>
            </div>
            <div className="hidden text-right text-[11px] text-white/40 sm:block sm:text-left">
              <p>{state.entries.length} in the Hall</p>
              <p>${state.totalRaised.toLocaleString()} raised</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {bumpable && (
              <button
                type="button"
                onClick={() => {
                  const cost = bumpCost(bumpable, price);
                  if (
                    confirm(
                      `Bump ${bumpable.brand} back to the top for $${cost}?`
                    )
                  ) {
                    bumpEntry(bumpable.id);
                    setShowHistory(false);
                  }
                }}
                className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
              >
                Bump back · ${bumpCost(bumpable, price)}
              </button>
            )}
            <Link
              href="/claim"
              className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
            >
              Put your brand on the board — ${price}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
