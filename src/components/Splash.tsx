"use client";

import { useState, useEffect, useCallback } from "react";

const SCENES = [
  {
    src: "/splash/arctic.jpg",
    line: "The internet needed a permanent surface.",
  },
  {
    src: "/splash/city.jpg",
    line: "Some things should outlast the feed.",
  },
  {
    src: "/splash/desert.jpg",
    line: "Buy a piece of 2026 before it becomes history.",
  },
];

const ROTATE_MS = 6000;

interface SplashProps {
  onEnter: () => void;
}

export function Splash({ onEnter }: SplashProps) {
  const [index, setIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  const next = useCallback(() => {
    setTextVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % SCENES.length);
      setTextVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    const id = setInterval(next, ROTATE_MS);
    return () => clearInterval(id);
  }, [next]);

  const scene = SCENES[index];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900">
      {SCENES.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            backgroundImage: `url(${s.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 text-center sm:py-12">
        <div className="text-sm font-medium tracking-[0.2em] text-white/90 drop-shadow-md">
          billboard<span className="text-white/50">.wtf</span>
        </div>

        <div className="flex max-w-3xl flex-1 items-center justify-center px-6">
          <p
            className={`text-2xl font-light leading-snug tracking-tight text-neutral-900 transition-opacity duration-400 sm:text-3xl md:text-4xl ${
              textVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {scene.line}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 pb-2">
          <button
            onClick={onEnter}
            className="group rounded-full border border-white/35 bg-black/35 px-8 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition hover:border-white/60 hover:bg-black/55"
          >
            Enter the board
            <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <p className="text-[11px] tracking-wide text-white/45">
            A permanent visual record of the builders of 2026
          </p>
        </div>
      </div>
    </div>
  );
}
