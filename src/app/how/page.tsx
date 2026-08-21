import Link from "next/link";
import { SiteNav } from "@/components/board/SiteNav";

export default function HowPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-20">
        <p className="text-xs uppercase tracking-wider text-white/40">
          How it works
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          The ladder
        </h1>

        <ol className="mt-10 space-y-8">
          <Step n="1" title="The board is at $N">
            One brand on the face at a time. The public price is always visible.
          </Step>
          <Step n="2" title="Claim for $N">
            Pay the current price, design your face (templates, type, images,
            stickers). You control only what is on the board — not the world
            behind it.
          </Step>
          <Step n="3" title="Lock and go live">
            Lock your design. You take the top spot. Next price becomes $N+1.
          </Step>
          <Step n="4" title="Bump">
            If someone takes the board, you can bump back by paying the
            difference between the current price and what you originally paid.
            Bumps also raise the ladder by $1.
          </Step>
          <Step n="5" title="Hall of Fame">
            Every claim, bump, and pioneer is numbered forever — with metrics,
            links, and history.
          </Step>
          <Step n="6" title="Worlds">
            We rotate the billboard through locations around the planet. You
            design the ad; we move the board.
          </Step>
        </ol>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/70">
            Pioneers get free early slots (separate from the paid ladder). Paid
            sequence always starts at $1.
          </p>
        </div>

        <Link
          href="/claim"
          className="mt-8 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900"
        >
          Put your brand on the board
        </Link>
      </main>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-white/60">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-white/50">{children}</p>
      </div>
    </li>
  );
}
