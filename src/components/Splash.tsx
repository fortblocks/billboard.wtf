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

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 text-center sm:py-14">
        <div className="text-sm font-medium tracking-widest text-white/80 drop-shadow">
          billboard<span className="text-white/50">.wtf</span>
        </div>

        <div className="flex max-w-4xl flex-1 items-center justify-center px-4">
          <p
            className={`text-2xl font-light leading-snug tracking-tight text-neutral-900 transition-opacity duration-500 sm:text-3xl md:text-4xl lg:text-5xl ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            style={{ textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}
          >
            {scene.line}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onEnter}
            className="group rounded-full border border-white/40 bg-black/40 px-8 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition hover:border-white/70 hover:bg-black/60"
          >
            Enter the board
            <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <p className="text-xs text-white/50">
            A permanent visual record of the builders of 2026
          </p>
        </div>
      </div>
    </div>
  );
}
