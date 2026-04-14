export type Persona = "diy" | "trade" | "estimator";

export interface Opening {
  width: number;
  height: number;
}

export interface WallFormData {
  length: string;
  height: string;
  stud_spacing_mm: 300 | 600;
  sides: 1 | 2;
  layers: number;
  insulated: boolean;
  openings: Opening[];
  board_waste_pct: number;
  stud_waste_pct: number;
  track_waste_pct: number;
  insulation_waste_pct: number;
  screw_waste_pct: number;
  framing_screw_waste_pct: number;
  joint_tape_waste_pct: number;
  easifill_waste_pct: number;
}

export interface WallEstimate {
  wall_index: number;
  length_m: number;
  height_m: number;
  boarded_area_m2: number;
  boards: number;
  studs_pieces: number;
  studs_linear_m: number;
  track_pieces: number;
  track_linear_m: number;
  insulation_packs: number;
  screws: number;
  framing_screws: number;
  joint_tape_rolls: number;
  easifill_bags: number;
}

export interface ProjectTotals {
  boards: number;
  studs_pieces: number;
  studs_linear_m: number;
  track_pieces: number;
  track_linear_m: number;
  insulation_packs: number;
  screws: number;
  framing_screws: number;
  joint_tape_rolls: number;
  easifill_bags: number;
}

export interface EstimateResponse {
  walls: WallEstimate[];
  totals: ProjectTotals;
}
