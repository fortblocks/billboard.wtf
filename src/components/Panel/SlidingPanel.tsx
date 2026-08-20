"use client";

import { AboutView } from "./views/AboutView";
import { ClaimView } from "./views/ClaimView";
import { CrownView } from "./views/CrownView";

type PanelView = "explore" | "about" | "claim" | "crown" | "card";

interface SlidingPanelProps {
  open: boolean;
  view: PanelView;
  onClose: () => void;
  onChangeView: (view: PanelView) => void;
}

export function SlidingPanel({
  open,
  view,
  onClose,
  onChangeView,
}: SlidingPanelProps) {
  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed z-50 flex flex-col
          bg-neutral-900 border-neutral-700
          transition-transform duration-300 ease-out
          md:top-12 md:right-0 md:h-[calc(100vh-3rem)] md:w-[400px] md:border-l
          bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl border-t
          ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
        `}
      >
        {/* Handle / header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => onChangeView("about")}
              className={`rounded-md px-2.5 py-1 text-sm ${
                view === "about"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              About
            </button>
            <button
              onClick={() => onChangeView("explore")}
              className={`rounded-md px-2.5 py-1 text-sm ${
                view === "explore"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Explore
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === "about" && <AboutView />}
          {view === "claim" && <ClaimView />}
          {view === "crown" && <CrownView />}
          {view === "explore" && (
            <div className="space-y-4 text-sm text-neutral-400">
              <p>Search & filters coming next.</p>
              <p>This will list Pioneers, recent claims, tags, and trending zones.</p>
            </div>
          )}
          {view === "card" && (
            <div className="text-sm text-neutral-400">
              Builder Card view will appear here when a plot is selected.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
