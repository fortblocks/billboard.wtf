/**
 * Shared board geometry.
 * BOARD_WIDTH + BOARD_OFFSET_Y are LOCKED — do not change.
 *
 * FACE uses top/bottom/left/right (not height) so it stays locked to the
 * white canvas under any viewport scale. Values from board-frame.png probe
 * plus slight expand into the inner silver lip so drag reaches the edge.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** LOCKED */
export const BOARD_OFFSET_Y = 120;

/** White canvas only — percentages of board-frame.png box */
export const FACE = {
  left: "1.8%",
  top: "2.8%",
  right: "1.8%",
  bottom: "38.5%",
} as const;
