/**
 * Shared board geometry.
 * BOARD_WIDTH + BOARD_OFFSET_Y are LOCKED — do not change.
 *
 * FACE measured from public/splash/board-frame.png (1168×784):
 *   white panel (lum > 240): x 106–1064, y 175–498
 *   → left 9.08%, top 22.32%, right 8.82%, bottom 36.35%
 * Slight expand (~0.3%) into the inner silver lip so drag reaches the edge.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** LOCKED */
export const BOARD_OFFSET_Y = 120;

/** White canvas only — percentages of board-frame.png box */
export const FACE = {
  left: "8.8%",
  top: "22.0%",
  right: "8.5%",
  bottom: "36.1%",
} as const;
