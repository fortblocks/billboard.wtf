/**
 * Shared board geometry — LOCKED board size/placement.
 * Do not change BOARD_WIDTH or BOARD_OFFSET_Y — user-approved.
 *
 * FACE = editable white only (measured from board-frame.png 994×571).
 * Near-white band ≈ L0.8% T1.6% R98.3% B60.2%. Inset so widgets stay in white.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** Homepage + studio: tucks pillar under footer; LOCKED */
export const BOARD_OFFSET_Y = 120;

/** White advertising face only — not frame, not pillar */
export const FACE = {
  left: "2.5%",
  top: "3.5%",
  width: "95%",
  height: "55.5%",
} as const;
