import type { Persona, WallFormData } from "./types";

const BASE: Omit<WallFormData, "length" | "height"> = {
  label: "",
  brand: "bg",
  frame_material: "metal",
  stud_size: "70S",
  stud_spacing_mm: 600,
  sides: 2,
  layers: 1,
  board_type: "standard",
  finish: "paint",
  insulated: false,
  resilient_bars: false,
  pattress: false,
  openings: [],
  board_waste_pct: 10,
  stud_waste_pct: 5,
  track_waste_pct: 5,
  insulation_waste_pct: 5,
  screw_waste_pct: 10,
  framing_screw_waste_pct: 10,
  joint_tape_waste_pct: 10,
  easifill_waste_pct: 10,
};

export const PERSONA_DEFAULTS: Record<Persona, Omit<WallFormData, "length" | "height">> = {
  // DIY: domestic, timber stud, insulation for sound
  diy: {
    ...BASE,
    frame_material: "timber",
    stud_size: "T38x89",
    stud_spacing_mm: 600,
    insulated: true,
    board_waste_pct: 15,
    stud_waste_pct: 10,
    track_waste_pct: 10,
    screw_waste_pct: 15,
  },
  // Trade: metal GypWall, 70 S 50, paint finish — standard commercial
  trade: {
    ...BASE,
  },
  // Estimator: heavier commercial — 92 S 50 metal, FireLine for rated walls
  estimator: {
    ...BASE,
    stud_size: "92S",
    board_type: "fireline",
    board_waste_pct: 10,
    stud_waste_pct: 5,
  },
};

export const PERSONA_LABELS: Record<Persona, string> = {
  diy: "DIY",
  trade: "Trade",
  estimator: "Estimator",
};
