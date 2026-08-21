import type { Scene } from "./types";

/**
 * World plates behind the fixed CSS board.
 * Using /splash/*.jpg (files you already have).
 * Note: these photos include a board in-frame; the CSS board covers the centre.
 * Later swap to true board-free plates under /splash/env/.
 */
export const SCENES: Scene[] = [
  {
    id: "arctic",
    name: "The ice",
    src: "/splash/arctic.jpg",
    location: "Antarctica",
  },
  {
    id: "city",
    name: "Downtown",
    src: "/splash/city.jpg",
    location: "New York, USA",
  },
  {
    id: "desert",
    name: "Open desert",
    src: "/splash/desert.jpg",
    location: "Sahara",
  },
];

export function sceneById(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
