"use client";

import { SiteNav } from "@/components/board/SiteNav";
import { SCENES } from "@/lib/scenes";

const DEMO_CITIES = [
  { name: "London", x: 48, y: 32, n: 420 },
  { name: "New York", x: 28, y: 38, n: 380 },
  { name: "Berlin", x: 51, y: 30, n: 210 },
  { name: "Tokyo", x: 82, y: 40, n: 190 },
  { name: "Sydney", x: 88, y: 72, n: 110 },
];

export default function MapPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-20">
        <p className="text-xs uppercase tracking-wider text-white/40">Map</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Where the board is seen
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/50">
          Visitors and board locations. Analytics are mocked in this build.
        </p>

        <div className="relative mt-10 aspect-[2/1] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950">
          {DEMO_CITIES.map((c) => (
            <div key={c.name} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}>
              <span className="rounded-full bg-sky-400/80"
                style={{ width: 6 + Math.min(c.n / 40, 14), height: 6 + Math.min(c.n / 40, 14) }} />
              <span className="mt-1 text-[9px] text-white/50">{c.name}</span>
            </div>
          ))}
          <p className="absolute bottom-3 left-3 text-[10px] text-white/30">Demo visitor map</p>
        </div>

        <h2 className="mt-12 text-sm font-medium text-white/70">Board locations</h2>
        <p className="mt-1 text-xs text-white/40">
          Worlds we place the billboard in. Advertisers never choose these.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {SCENES.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-xl border border-white/10">
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${s.src})` }} />
              <div className="px-3 py-2">
                <p className="text-sm">{s.name}</p>
                <p className="text-[11px] text-white/40">{s.location}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
