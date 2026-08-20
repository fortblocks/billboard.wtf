export function AboutView() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-neutral-300">
      <div>
        <h1 className="mb-2 text-xl font-semibold text-white">
          The builders of 2026
        </h1>
        <p className="text-neutral-400">
          billboard.wtf is the permanent visual record of the people who were
          shipping, vibing, and building when the tools changed forever.
        </p>
      </div>

      <div className="space-y-3">
        <p>
          Claim a plot on the grid. Put your mark on it. Write a short story.
          Get a real backlink that lives on a collective artifact instead of
          disappearing into another directory.
        </p>
        <p>
          Most of the board is yours forever once you claim it. One special
          zone in the centre — <strong className="text-amber-400">The Crown</strong> —
          can be taken by anyone willing to outbid the current holder.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-700 bg-neutral-850/50 p-4">
        <h2 className="mb-2 font-medium text-white">Why claim a plot?</h2>
        <ul className="space-y-1.5 text-neutral-400">
          <li>• Permanent backlink on a living board</li>
          <li>• Public Builder Card with your story</li>
          <li>• Status — you were here for 2026</li>
          <li>• Discoverability among other builders</li>
          <li>• A shareable piece of internet history</li>
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-medium text-white">How it works</h2>
        <ol className="list-decimal space-y-1.5 pl-4 text-neutral-400">
          <li>Zoom and pan the grid</li>
          <li>Click empty space to claim a plot</li>
          <li>Add your image, story, and link</li>
          <li>Pay (or claim a free Pioneer slot)</li>
          <li>You are on the board permanently</li>
        </ol>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-1 font-medium text-amber-400">The Crown</h2>
        <p className="text-neutral-400">
          The centre zone is special. It is never permanently owned. Anyone can
          take it by outbidding the current holder. Full history of previous
          reigns is public and swipeable. Glory is temporary. The record is
          forever.
        </p>
      </div>

      <div className="pt-2 text-xs text-neutral-500">
        100 Pioneer slots available at launch — free with a public tweet.
        After that, early-bird pricing, then $1 per pixel.
      </div>
    </div>
  );
}
