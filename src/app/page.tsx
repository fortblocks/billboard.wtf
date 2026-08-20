"use client";

import { useState } from "react";
import { GridCanvas } from "@/components/Grid/GridCanvas";
import { SlidingPanel } from "@/components/Panel/SlidingPanel";
import { TopBar } from "@/components/TopBar";

export default function HomePage() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelView, setPanelView] = useState<
    "explore" | "about" | "claim" | "crown" | "card"
  >("about");

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950">
      <TopBar
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />

      <main className="absolute inset-0 pt-12">
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

      <SlidingPanel
        open={panelOpen}
        view={panelView}
        onClose={() => setPanelOpen(false)}
        onChangeView={setPanelView}
      />
    </div>
  );
}
