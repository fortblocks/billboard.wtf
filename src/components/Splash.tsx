"use client";

import { useState, useEffect, useCallback } from "react";

const SCENES = [
  {
    src: "/splash/highway.jpg",
    line: "The internet needed a permanent surface.",
  },
  {
    src: "/splash/city-night.jpg",
    line: "Some things should outlast the feed.",
  },
  {
    src: "/splash/desert.jpg",
    line: "Buy a piece of 2026 before it becomes history.",
  },
  {
    src: "/splash/tokyo-rain.jpg",
    line: "This space will still be here when the tools are gone.",
  },
  {
    src: "/splash/mountains.jpg",
    line: "Reserve your pixels. The board is finite.",
  },
];

const ROTATE_MS = 5500;

interface SplashProps {
  onEnter: () => void;
}

export function Splash({ onEnter }: SplashProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const next = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % SCENES.length);
      setFade(true);
    }, 600);
  }, []);

  useEffect(() => {
    const id = setInterval(next, ROTATE_MS);
    return () => clearInterval(id);
  }, [next]);

  const scene = SCENES[index];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* Background scenes */}
      {SCENES.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === index && fade ? 1 : 0,
            backgroundImage: `url(${s.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-12 text-center sm:py-16">
        {/* Top wordmark */}
        <div className="text-sm font-medium tracking-widest text-white/70">
          billboard<span className="text-white/40">.wtf</span>
        </div>

        {/* Main line */}
        <div className="max-w-3xl">
          <p
            className={`text-3xl font-light leading-tight tracking-tight text-white transition-opacity duration-500 sm:text-4xl md:text-5xl ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {scene.line}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onEnter}
            className="group rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/20"
          >
            Enter the board
            <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <p className="text-xs text-white/40">
            A permanent visual record of the builders of 2026
          </p>
        </div>
      </div>
    </div>
  );
}
