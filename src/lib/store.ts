"use client";

import type { BoardEntry, Creative, LadderState } from "./types";
import { emptyLadder, nextHallNumber } from "./ladder";

const KEY = "billboard_wtf_ladder_v1";

/** In-memory fallback when localStorage is blocked (Brave shields, private mode, etc.) */
let memoryState: LadderState | null = null;

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__bb_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function read(): LadderState {
  if (typeof window === "undefined") return emptyLadder();

  if (!canUseStorage()) {
    if (!memoryState) memoryState = emptyLadder();
    return memoryState;
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyLadder();
    return JSON.parse(raw) as LadderState;
  } catch {
    if (!memoryState) memoryState = emptyLadder();
    return memoryState;
  }
}

function write(state: LadderState) {
  if (typeof window === "undefined") return;
  memoryState = state;

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // quota or blocked — memory still holds it for this session
    }
  }

  try {
    window.dispatchEvent(new Event("billboard-store"));
  } catch {
    // ignore
  }
}

export function getState(): LadderState {
  return read();
}

export function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("billboard-store", handler);
  try {
    window.addEventListener("storage", handler);
  } catch {
    // ignore
  }
  return () => {
    window.removeEventListener("billboard-store", handler);
    try {
      window.removeEventListener("storage", handler);
    } catch {
      // ignore
    }
  };
}

export function getLiveEntry(): BoardEntry | null {
  const s = read();
  if (!s.liveEntryId) return null;
  return s.entries.find((e) => e.id === s.liveEntryId) ?? null;
}

export function claimSlot(input: {
  brand: string;
  url?: string;
}): BoardEntry {
  const s = read();
  const price = s.currentPrice;
  const entry: BoardEntry = {
    id: crypto.randomUUID(),
    number: nextHallNumber(s.entries),
    kind: "claim",
    brand: input.brand.trim() || "Untitled",
    url: input.url?.trim() || undefined,
    amountPaid: price,
    originalPaid: price,
    creative: null,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  s.entries.push(entry);
  s.totalRaised += price;
  s.currentPrice = price + 1;
  write(s);
  return entry;
}

export function bumpEntry(entryId: string): BoardEntry | null {
  const s = read();
  const entry = s.entries.find((e) => e.id === entryId);
  if (!entry || !entry.creative) return null;
  const cost = Math.max(1, s.currentPrice - entry.originalPaid);
  const bump: BoardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    number: nextHallNumber(s.entries),
    kind: "bump",
    amountPaid: cost,
    status: "live",
    createdAt: new Date().toISOString(),
    liveAt: new Date().toISOString(),
  };
  if (s.liveEntryId) {
    const prev = s.entries.find((e) => e.id === s.liveEntryId);
    if (prev) prev.status = "hall";
  }
  s.entries.push(bump);
  s.liveEntryId = bump.id;
  s.totalRaised += cost;
  s.currentPrice += 1;
  write(s);
  return bump;
}

export function saveCreative(entryId: string, creative: Creative) {
  const s = read();
  const entry = s.entries.find((e) => e.id === entryId);
  if (!entry) return;
  entry.creative = creative;
  write(s);
}

export function lockAndPublish(entryId: string) {
  const s = read();
  const entry = s.entries.find((e) => e.id === entryId);
  if (!entry || !entry.creative) return;
  if (s.liveEntryId && s.liveEntryId !== entryId) {
    const prev = s.entries.find((e) => e.id === s.liveEntryId);
    if (prev) prev.status = "hall";
  }
  entry.status = "live";
  entry.liveAt = new Date().toISOString();
  s.liveEntryId = entry.id;
  write(s);
}

export function addPioneer(brand: string, url?: string): BoardEntry {
  const s = read();
  const entry: BoardEntry = {
    id: crypto.randomUUID(),
    number: nextHallNumber(s.entries),
    kind: "pioneer",
    brand,
    url,
    amountPaid: 0,
    originalPaid: 0,
    creative: {
      layers: [
        {
          id: "t1",
          type: "text",
          text: brand,
          x: 10,
          y: 38,
          w: 80,
          h: 24,
          z: 1,
          fontFamily: "system-ui",
          fontSize: 8,
          color: "#111111",
          fontWeight: 600,
          fontStyle: "normal",
          align: "center",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    status: "hall",
    createdAt: new Date().toISOString(),
  };
  s.entries.push(entry);
  write(s);
  return entry;
}

export function resetDemo() {
  write(emptyLadder());
}
