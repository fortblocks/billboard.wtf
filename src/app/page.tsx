"use client";

import { useState } from "react";
import { GridCanvas } from "@/components/Grid/GridCanvas";
import { SlidingPanel } from "@/components/Panel/SlidingPanel";
import { TopBar } from "@/components/TopBar";

export default function HomePage() {
  const [panelOpen, setPanelOpen] = useState(false); // start closed for pure billboard feel
  const [panelView, setPanelView] = useState<
    "explore" | "about" | "claim" | "crown" | "card"
  >("about");

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* Grid fills the entire screen */}
      <main className="absolute inset-0">
        <GridCanvas
          onSelectEmpty={() => {
            setPanelView("claim");
            setPanelOpen(true);
          }}
          onSelectCrown={() => {
            setPanelView("crown");
            setPanelOpen(true);
          }}
          onSelectPlot={() => {
            setPanelView("card");
            setPanelOpen(true);
          }}
        />
      </main>

      {/* Minimal floating top bar */}
      <TopBar
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />

      <SlidingPanel
        open={panelOpen}
        view={panelView}
        onClose={() => setPanelOpen(false)}
        onChangeView={setPanelView}
      />
    </div>
  );
}
