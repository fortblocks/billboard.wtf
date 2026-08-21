import type { Scene } from "./types";

/** Platform-owned worlds — environments only (no billboard in the plate). */
export const SCENES: Scene[] = [
  {
    id: "arctic",
    name: "The ice",
    src: "/splash/env/arctic.jpg",
    location: "Antarctica",
  },
  {
    id: "city",
    name: "Downtown",
    src: "/splash/env/city.jpg",
    location: "New York, USA",
  },
  {
    id: "desert",
    name: "Open desert",
    src: "/splash/env/desert.jpg",
    location: "Sahara",
  },
];

export function sceneById(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
