"use client";

interface TopBarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export function TopBar({ panelOpen, onTogglePanel }: TopBarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex h-12 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">
          billboard<span className="text-neutral-500">.wtf</span>
        </span>
        <span className="hidden rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400 sm:inline">
          2026
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePanel}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 transition hover:bg-neutral-800"
        >
          {panelOpen ? "Hide panel" : "Show panel"}
        </button>
      </div>
    </header>
  );
}
