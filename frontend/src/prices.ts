import type { MaterialPrices } from "./types";
import type { StudSize, BoardType } from "./catalogue";
import { STUDS, BOARDS, STUD_ORDER, BOARD_ORDER } from "./catalogue";

// Default UK trade prices — synthesized from catalogue.ts.
// Everything is editable inline in the takeoff table.
const studDefaults = STUD_ORDER.reduce((acc, size) => {
  acc[size] = { piece: STUDS[size].stud_price, track: STUDS[size].track_price };
  return acc;
}, {} as Record<StudSize, { piece: number; track: number }>);

const boardDefaults = BOARD_ORDER.reduce((acc, type) => {
  acc[type] = BOARDS[type].price;
  return acc;
}, {} as Record<BoardType, number>);

export const DEFAULT_PRICES: MaterialPrices = {
  studs: studDefaults,
  boards: boardDefaults,
  insulation_per_pack: 38.00,   // Isover APR 1200 50mm
  screws_per_100: 1.80,         // BG Drywall Screws 25mm — per 100
  framing_screws_per_100: 1.50, // BG Wafer Head 13mm — per 100
  joint_tape_per_roll: 11.50,   // Gyproc Joint Tape 150m
  easifill_per_bag: 13.50,      // Gyproc EasiFill 60 10kg
};
