"use client";

import { useState, useEffect } from "react";
import { GridCanvas } from "@/components/Grid/GridCanvas";
import { SlidingPanel } from "@/components/Panel/SlidingPanel";
import { TopBar } from "@/components/TopBar";
import { Splash } from "@/components/Splash";
import { BillboardStage } from "@/components/BillboardStage";

const COOKIE_KEY = "billboard_wtf_seen";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState<
    "explore" | "about" | "claim" | "crown" | "card"
  >("about");

  useEffect(() => {
    try {
      const seen = localStorage.getItem(COOKIE_KEY);
      setShowSplash(!seen);
    } catch {
      setShowSplash(true);
    }
  }, []);

  const handleEnter = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "1");
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  if (showSplash === null) {
    return <div className="h-screen w-screen bg-black" />;
  }

  if (showSplash) {
    return <Splash onEnter={handleEnter} />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <main className="absolute inset-0">
        <BillboardStage>
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
        </BillboardStage>
      </main>

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
