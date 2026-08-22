export type LayerType = "text" | "image" | "sticker" | "shape" | "button" | "draw";

export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees */
  rotation?: number;
  /** 0–1 */
  opacity?: number;
  z: number;
  locked?: boolean;
  visible?: boolean;
  flipX?: boolean;
  flipY?: boolean;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  align: "left" | "center" | "right";
  /** Optional post-it / card background */
  background?: string;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  /** cover | contain | fill — default cover */
  objectFit?: "cover" | "contain" | "fill";
  /** true when src is a video data URL / blob */
  isVideo?: boolean;
}

export interface StickerLayer extends BaseLayer {
  type: "sticker";
  /** Unicode emoji glyph (flat). */
  emoji?: string;
  /** Image / SVG / GIF URL (icons + animated). */
  src?: string;
  /** Hint for UI / export */
  stickerKind?: "emoji" | "icon" | "gif";
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rect" | "circle";
  fill: string;
}

export interface ButtonLayer extends BaseLayer {
  type: "button";
  label: string;
  url: string;
  bg: string;
  color: string;
}

export interface DrawLayer extends BaseLayer {
  type: "draw";
  paths: { d: string; color: string; width: number }[];
}

export type Layer =
  | TextLayer
  | ImageLayer
  | StickerLayer
  | ShapeLayer
  | ButtonLayer
  | DrawLayer;

export interface Creative {
  layers: Layer[];
  updatedAt: string;
}

export type EntryKind = "pioneer" | "claim" | "bump";

export interface BoardEntry {
  id: string;
  number: number;
  kind: EntryKind;
  brand: string;
  url?: string;
  amountPaid: number;
  originalPaid: number;
  creative: Creative | null;
  status: "draft" | "locked" | "approved" | "live" | "hall";
  createdAt: string;
  liveAt?: string;
}

export interface LadderState {
  currentPrice: number;
  liveEntryId: string | null;
  entries: BoardEntry[];
  totalRaised: number;
}

export interface Scene {
  id: string;
  name: string;
  src: string;
  location: string;
}
