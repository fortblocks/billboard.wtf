/**
 * Shared board geometry — measured from public/splash/board-frame.png (994×571).
 * FACE is inset slightly inside the measured near-white so widgets never spill
 * into the silver frame or the page background.
 *
 * Measured near-white: L≈0.8% T≈1.6% R≈98.3% B≈60.2%
 * Inset FACE used for editing + live creative.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";
export const BOARD_ASPECT = "994 / 571";

/** Homepage: tucks pillar under the transparent footer bar */
export const BOARD_OFFSET_Y = 120;

/** White advertising face — percentages of board-frame.png box (inset) */
export const FACE = {
  left: "3%",
  top: "4.5%",
  width: "94%",
  height: "54%",
} as const;
