"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/board/SiteNav";
import { claimSlot, getState } from "@/lib/store";

export default function ClaimPage() {
  const router = useRouter();
  const [price, setPrice] = useState(1);
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPrice(getState().currentPrice);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;
    setBusy(true);
    const entry = claimSlot({ brand, url });
    router.push(`/design/${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-16 pt-20">
        <p className="text-xs uppercase tracking-wider text-white/40">
          Claim the board
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Pay ${price}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          You go live after you design and lock your board. Every claim raises
          the next price by $1. Bumps climb the ladder too.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs text-white/50">Brand / name</span>
            <input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/40"
              placeholder="Acme"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/50">Link (optional)</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/40"
              placeholder="https://"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !brand.trim()}
            className="w-full rounded-full bg-white py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40"
          >
            {busy ? "Continuing\u2026" : `Continue to design \u2014 $${price}`}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/35">
          Payment is mocked in this build. Ladder and design are real.
        </p>
        <p className="mt-2 text-center text-[11px]">
          <Link href="/" className="text-white/50 hover:text-white/80">
            \u2190 Back to board
          </Link>
        </p>
      </main>
    </div>
  );
}
