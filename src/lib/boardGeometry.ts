/**
 * Shared board geometry — measured from public/splash/board-frame.png (994×571).
 * Homepage LiveBoard and DesignStudio MUST use the same values.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";
export const BOARD_OFFSET_Y = 120; // homepage only (tucks pillar under footer)

/** White advertising face — percentages of board-frame.png box */
export const FACE = {
  left: "2%",
  top: "3.2%",
  width: "96%",
  height: "56.4%",
} as const;
