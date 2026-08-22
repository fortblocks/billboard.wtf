/**
 * Shared board geometry.
 * BOARD_WIDTH + BOARD_OFFSET_Y are LOCKED — do not change.
 *
 * FACE = white canvas only, as % of board-frame.png box.
 * Calibrated so the editable face sits inside the silver lip
 * (not the transparent padding around the board graphic).
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** LOCKED */
export const BOARD_OFFSET_Y = 120;

/**
 * White canvas — percentages of board-frame.png element box.
 * Tightened so face does not spill into transparent PNG margins
 * above / beside the silver frame (those margins made studio bg-white
 * look like a giant rectangle outside the board).
 */
export const FACE = {
  left: "3.6%",
  top: "11.5%",
  right: "3.6%",
  bottom: "41%",
} as const;
