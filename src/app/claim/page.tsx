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
    if (!brand.trim() || busy) return;
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
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          Design your face, lock it, and go live. Every claim raises the next
          price by $1. Previous owners can bump back to the top by paying the
          difference.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs text-white/50">Brand / name</span>
            <input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Acme Labs"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-sm outline-none transition focus:border-white/40"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/50">
              Website <span className="text-white/30">(optional)</span>
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-sm outline-none transition focus:border-white/40"
            />
          </label>

          <button
            type="submit"
            disabled={busy || !brand.trim()}
            className="mt-2 w-full rounded-full bg-white py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40"
          >
            {busy ? "Claiming\u2026" : `Continue to design studio \u2014 $${price}`}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/30">
          Demo mode \u2014 no real payment yet.{" "}
          <Link href="/" className="underline hover:text-white/50">
            Back to board
          </Link>
        </p>
      </main>
    </div>
  );
}
