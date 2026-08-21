"use client";

interface TopBarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export function TopBar({ panelOpen, onTogglePanel }: TopBarProps) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-5 sm:top-5">
      <button
        onClick={onTogglePanel}
        className="pointer-events-auto rounded-full border border-neutral-400/40 bg-white/70 px-4 py-2 text-xs font-medium tracking-wide text-neutral-700 shadow-sm backdrop-blur-md transition hover:bg-white/90"
      >
        {panelOpen ? "Close" : "Menu"}
      </button>
    </div>
  );
}
