export function CrownView() {
  // Placeholder history data
  const history = [
    { handle: "@alice", bid: 420, held: "14h", when: "2 days ago" },
    { handle: "@bob", bid: 310, held: "6h", when: "3 days ago" },
    { handle: "@carol", bid: 200, held: "1d 4h", when: "5 days ago" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h2 className="text-lg font-semibold text-white">The Crown</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Temporary glory. Permanent record.
        </p>
      </div>

      {/* Current holder */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
          Current holder
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-800 text-2xl">
            🖼️
          </div>
          <div>
            <div className="font-medium text-white">@currentholder</div>
            <div className="text-sm text-neutral-400">Held for 3h 12m</div>
            <div className="text-sm text-amber-400">$180</div>
          </div>
        </div>
      </div>

      <button className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300">
        Take the Crown — $181
      </button>

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-neutral-300">
          Previous reigns
        </h3>
        <div className="space-y-2">
          {history.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-850/50 px-3 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">{i + 1}</span>
                <span className="text-white">{entry.handle}</span>
              </div>
              <div className="text-right text-neutral-400">
                <div>${entry.bid}</div>
                <div className="text-xs">{entry.held} · {entry.when}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Swipeable story view and full timeline coming soon.
        </p>
      </div>
    </div>
  );
}
