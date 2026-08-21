/**
 * Shared board geometry — measured from public/splash/board-frame.png (994×571).
 * FACE is the editable white advertising surface only (not frame / pillar).
 *
 * Measured near-white band: top≈3.0% bottom≈59.9% left≈2% right≈98%.
 * Height set so drag targets reach the visual bottom of the white.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** Homepage: tucks pillar under the transparent footer bar */
export const BOARD_OFFSET_Y = 120;

/** Studio uses the same offset as homepage for identical placement */
export const STUDIO_OFFSET_Y = 120;

/** White advertising face — percentages of board-frame.png box */
export const FACE = {
  left: "2.0%",
  top: "3.0%",
  width: "96.0%",
  height: "57.2%",
} as const;
