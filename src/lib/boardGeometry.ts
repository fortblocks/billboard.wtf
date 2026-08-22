/**
 * Shared board geometry.
 * BOARD_WIDTH + BOARD_OFFSET_Y are LOCKED — do not change.
 *
 * FACE = white canvas only, as % of the board-frame.png element box.
 *
 * HOW TO MEASURE (pixel-perfect):
 * 1. Open public/splash/board-frame.png in any image editor
 * 2. Note image width W and height H in pixels
 * 3. Select the white panel INSIDE the silver lip (not the chrome)
 * 4. Note whiteLeft, whiteTop, whiteRight, whiteBottom in pixels
 * 5. Set:
 *    left   = (whiteLeft / W) * 100
 *    top    = (whiteTop / H) * 100
 *    right  = ((W - whiteRight) / W) * 100
 *    bottom = ((H - whiteBottom) / H) * 100
 *
 * Or in DevTools: inspect the board-frame img, note its getBoundingClientRect(),
 * then click the four corners of the visible white panel and convert.
 */
export const BOARD_WIDTH = "min(96vw, 1700px)";

/** LOCKED */
export const BOARD_OFFSET_Y = 120;

/**
 * Interim FACE — still approximate until measured from board-frame.png.
 * If white still bleeds outside the silver frame, increase left/right/top.
 */
export const FACE = {
  left: "7.5%",
  top: "19%",
  right: "7.5%",
  bottom: "43%",
} as const;
