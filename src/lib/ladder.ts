import type { BoardEntry, LadderState } from "./types";

export const FACE_W = 1200;
export const FACE_H = 500;

export function emptyLadder(): LadderState {
  return {
    currentPrice: 1,
    liveEntryId: null,
    entries: [],
    totalRaised: 0,
  };
}

export function bumpCost(entry: BoardEntry, currentPrice: number): number {
  return Math.max(1, currentPrice - entry.originalPaid);
}

export function nextHallNumber(entries: BoardEntry[]): number {
  if (entries.length === 0) return 1;
  return Math.max(...entries.map((e) => e.number)) + 1;
}
