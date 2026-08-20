export function ClaimView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Claim this plot</h2>
        <p className="mt-1 text-sm text-neutral-400">
          You’re about to write yourself into the 2026 record.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-400">Selected area</span>
          <span className="text-white">10 × 10 (100 px)</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-neutral-400">Current price</span>
          <span className="text-white">$50.00</span>
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Early-bird tier • Permanent ownership
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm">
          <span className="text-neutral-400">Display name / handle</span>
          <input
            type="text"
            placeholder="@yourhandle"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-400">Primary link (backlink)</span>
          <input
            type="url"
            placeholder="https://yourproject.com"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-400">Short story</span>
          <textarea
            rows={3}
            placeholder="What are you building? Why does it matter?"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
          />
        </label>

        <div className="text-sm text-neutral-400">
          Image upload coming in the next iteration.
        </div>
      </div>

      <button className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200">
        Continue to payment
      </button>

      <p className="text-center text-xs text-neutral-500">
        This plot will be permanent. It will outlive most of the tools we use today.
      </p>
    </div>
  );
}
