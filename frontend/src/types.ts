export type Persona = "diy" | "trade" | "estimator";

export interface Opening {
  width: number;
  height: number;
}

export interface WallFormData {
  label: string;
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

export interface DetectedOpening {
  width: number;
  height: number;
  label: string;
}

export interface DetectedWall {
  label: string;
  length: number;
  height: number;
  openings: DetectedOpening[];
}

export interface AgentAnalysisResult {
  walls: DetectedWall[];
  scale_detected: string;
  notes: string;
}

export interface MaterialPrices {
  board_per_sheet: number;
  stud_per_piece: number;
  track_per_length: number;
  insulation_per_pack: number;
  screws_per_100: number;
  framing_screws_per_100: number;
  joint_tape_per_roll: number;
  easifill_per_bag: number;
}
