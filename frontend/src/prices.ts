import type { MaterialPrices } from "./types";

// Default UK trade prices — sourced from Jewson / Travis Perkins typical trade rates.
// Users can override these in the results table.
export const DEFAULT_PRICES: MaterialPrices = {
  board_per_sheet: 9.50,       // Gyproc WallBoard 12.5mm 1200×2400mm
  stud_per_piece: 3.20,        // Gypframe 48 S 50 'C' Stud 3000mm
  track_per_length: 4.80,      // Gypframe 50 FEC 50 Channel 3600mm
  insulation_per_pack: 38.00,  // Isover APR 1200 50mm
  screws_per_100: 1.80,        // BG Drywall Screws 25mm — per 100
  framing_screws_per_100: 1.50, // BG Wafer Head 13mm — per 100
  joint_tape_per_roll: 11.50,  // Gyproc Joint Tape 150m
  easifill_per_bag: 13.50,     // Gyproc EasiFill 60 10kg
};
