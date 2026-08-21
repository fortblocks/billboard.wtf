"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Board" },
  { href: "/hall", label: "Hall of Fame" },
  { href: "/map", label: "Map" },
  { href: "/how", label: "How it works" },
];

export function SiteNav() {
  const path = usePathname();

  return (
    <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      <Link
        href="/"
        className="pointer-events-auto text-xs font-medium tracking-[0.22em] text-white/90 drop-shadow sm:text-sm"
      >
        billboard<span className="text-white/50">.wtf</span>
      </Link>

      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-1.5 py-1 backdrop-blur-md sm:gap-0.5">
        {LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-2.5 py-1.5 text-[11px] tracking-wide transition sm:px-3 sm:text-xs ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
