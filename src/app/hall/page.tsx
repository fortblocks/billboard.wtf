"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/board/SiteNav";
import { BoardThumb } from "@/components/board/LiveBoard";
import { getState, subscribe, addPioneer, resetDemo } from "@/lib/store";
import type { LadderState } from "@/lib/types";

export default function HallPage() {
  const [state, setState] = useState<LadderState | null>(null);

  useEffect(() => {
    const refresh = () => setState(getState());
    refresh();
    return subscribe(refresh);
  }, []);

  if (!state) return <div className="min-h-screen bg-neutral-950" />;

  const list = state.entries.slice().sort((a, b) => b.number - a.number);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-20">
        <p className="text-xs uppercase tracking-wider text-white/40">
          Hall of Fame
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Everyone who has been on the board
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Raised" value={`$${state.totalRaised.toLocaleString()}`} />
          <Stat label="Board at" value={`$${state.currentPrice}`} />
          <Stat label="Entries" value={String(state.entries.length)} />
          <Stat
            label="Claims + bumps"
            value={String(
              state.entries.filter((e) => e.kind !== "pioneer").length
            )}
          />
        </div>

        {list.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-white/40">Empty hall — be the first.</p>
            <Link
              href="/claim"
              className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900"
            >
              Put your brand on the board
            </Link>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  addPioneer("Pioneer One", "https://billboard.wtf");
                  addPioneer("Early Signal");
                  addPioneer("Class of 26");
                }}
                className="text-xs text-white/30 underline hover:text-white/60"
              >
                Seed 3 demo pioneers
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-white/10">
            {list.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="w-12 shrink-0 text-sm text-white/30">
                    #{e.number}
                  </span>
                  <div>
                    <p className="font-medium">
                      {e.url ? (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {e.brand}
                        </a>
                      ) : (
                        e.brand
                      )}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {e.kind}
                      {e.amountPaid > 0 ? ` · $${e.amountPaid}` : ""}
                      {e.liveAt
                        ? ` · live ${new Date(e.liveAt).toLocaleString()}`
                        : ` · ${new Date(e.createdAt).toLocaleString()}`}
                      {e.status === "live" ? " · LIVE" : ""}
                    </p>
                  </div>
                </div>
                {e.creative && (
                  <div className="w-full max-w-[200px] sm:w-40">
                    <BoardThumb entry={e} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 flex gap-4 text-[11px] text-white/25">
          <button
            type="button"
            onClick={() => resetDemo()}
            className="hover:text-white/50"
          >
            Reset demo data
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}
