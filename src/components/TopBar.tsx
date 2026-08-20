"use client";

interface TopBarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export function TopBar({ panelOpen, onTogglePanel }: TopBarProps) {
  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/10">
        <span className="text-sm font-medium tracking-tight text-white">
          billboard<span className="text-white/50">.wtf</span>
        </span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
          2026
        </span>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={onTogglePanel}
          className="rounded-full bg-black/50 px-3 py-1.5 text-sm text-white/80 backdrop-blur-md border border-white/10 transition hover:bg-black/70 hover:text-white"
        >
          {panelOpen ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
