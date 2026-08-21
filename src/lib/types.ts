export type LayerType = "text" | "image" | "sticker" | "shape" | "button";

export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  opacity?: number;
  z: number;
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
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
}

export interface StickerLayer extends BaseLayer {
  type: "sticker";
  emoji: string;
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

export type Layer =
  | TextLayer
  | ImageLayer
  | StickerLayer
  | ShapeLayer
  | ButtonLayer;

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
