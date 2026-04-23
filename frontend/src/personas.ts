import type { Persona, WallFormData } from "./types";

const BASE: Omit<WallFormData, "length" | "height"> = {
  label: "",
  stud_size: "70S",
  stud_spacing_mm: 600,
  sides: 2,
  layers: 1,
  board_type: "standard",
  finish: "paint",
  insulated: false,
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
  diy: {
    ...BASE,
    stud_size: "48S",
    board_waste_pct: 15,
    stud_waste_pct: 10,
    track_waste_pct: 10,
    screw_waste_pct: 15,
  },
  trade: {
    ...BASE,
  },
  estimator: {
    ...BASE,
    stud_size: "92S",
    board_waste_pct: 10,
    stud_waste_pct: 5,
  },
};

export const PERSONA_LABELS: Record<Persona, string> = {
  diy: "DIY",
  trade: "Trade",
  estimator: "Estimator",
};
