"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/board/SiteNav";
import { DesignStudio } from "@/components/design/DesignStudio";
import { getState } from "@/lib/store";
import type { BoardEntry } from "@/lib/types";

export default function DesignPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<BoardEntry | null | undefined>(undefined);

  useEffect(() => {
    const s = getState();
    setEntry(s.entries.find((x) => x.id === id) ?? null);
  }, [id]);

  if (entry === undefined) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 text-white">
        <p className="text-white/50">Entry not found.</p>
        <Link
          href="/claim"
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-900"
        >
          Claim a slot
        </Link>
      </div>
    );
  }

  if (entry.status === "live" || entry.status === "hall" || entry.status === "locked") {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 pb-16 pt-24 text-center">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Already published
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{entry.brand}</h1>
          <p className="mt-2 text-sm text-white/50">
            This board is locked in the Hall of Fame.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900"
          >
            Back to the board
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <main className="pt-16 sm:pt-20">
        <DesignStudio entry={entry} />
      </main>
    </div>
  );
}
