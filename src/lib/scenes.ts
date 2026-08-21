import type { Scene } from "./types";

/** Worlds behind the fixed transparent board. */
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
