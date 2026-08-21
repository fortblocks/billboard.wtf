/**
 * Shared board geometry — measured from public/splash/board-frame.png (994×571).
 * Homepage LiveBoard and DesignStudio MUST use the same FACE + BOARD_WIDTH.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** Homepage: tucks pillar under the transparent footer bar */
export const BOARD_OFFSET_Y = 120;

/**
 * Studio: bottom-aligned like homepage. Listing bar uses pb on the stage
 * instead of a large translate, so the board sits just above the bar.
 */
export const STUDIO_OFFSET_Y = 0;

/** White advertising face — percentages of board-frame.png box */
export const FACE = {
  left: "2%",
  top: "3.2%",
  width: "96%",
  height: "56.4%",
} as const;
