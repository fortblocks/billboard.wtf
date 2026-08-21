import type { Scene } from "./types";

/**
 * Board-free world plates.
 * The fixed transparent board-frame.png sits on top and never fades.
 *
 * Files:
 *   public/splash/env-arctic.jpg
 *   public/splash/env-desert.jpg
 *   public/splash/env-newyork.jpg
 *   public/splash/board-frame.png
 */
export const SCENES: Scene[] = [
  {
    id: "arctic",
    name: "The ice",
    src: "/splash/env-arctic.jpg",
    location: "Antarctica",
  },
  {
    id: "newyork",
    name: "Downtown",
    src: "/splash/env-newyork.jpg",
    location: "New York, USA",
  },
  {
    id: "desert",
    name: "Open desert",
    src: "/splash/env-desert.jpg",
    location: "Sahara",
  },
];

export function sceneById(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
