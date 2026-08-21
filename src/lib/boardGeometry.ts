/**
 * Shared board geometry.
 * BOARD_WIDTH + BOARD_OFFSET_Y are LOCKED — do not change.
 * FACE = full white advertising surface of board-frame.png (994×571).
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** LOCKED — pillar tucked under footer */
export const BOARD_OFFSET_Y = 120;

/**
 * White face only. Measured continuous near-white band:
 * T≈3.2% B≈59.7% L≈1.9% R≈98.3%
 * Height set so bottom of FACE meets bottom of white (fixes bottom clip).
 */
export const FACE = {
  left: "2%",
  top: "3.2%",
  width: "96%",
  height: "56.8%",
} as const;
