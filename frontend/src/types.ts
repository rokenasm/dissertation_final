import type {
  StudSize,
  MetalStudSize,
  TimberStudSize,
  BoardType,
  Finish,
  FrameMaterial,
  Brand,
  TapeType,
  JointingProduct,
  ScrewLength,
} from "./catalogue";

export type Persona = "diy" | "trade" | "estimator";

export interface Opening {
  width: number;
  height: number;
}

export interface WallFormData {
  label: string;
  length: string;
  height: string;
  frame_material: FrameMaterial;
  stud_size: StudSize;
  stud_spacing_mm: 300 | 400 | 600;
  sides: 1 | 2;
  layers: number;
  board_type: BoardType;
  finish: Finish;
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

export interface ProjectSpec {
  brand: Brand;
  tape_type: TapeType;
  jointing_product: JointingProduct;
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

export interface DetectedWallType {
  id: string;
  spec_code?: string;
  frame_material?: "metal" | "timber";
  stud_size?: string;
  stud_spacing_mm?: number;
  board_type?: string;
  layers?: number;
  sides?: number;
  insulated?: boolean;
  fire_rating_min?: number;
  acoustic_rw_db?: number;
}

export interface DetectedWall {
  label: string;
  length: number;
  height: number;
  type_id?: string | null;
  openings: DetectedOpening[];
}

export interface AgentAnalysisResult {
  wall_types?: DetectedWallType[];
  walls: DetectedWall[];
  scale_detected: string;
  notes: string;
}

// Editable price overrides. Defaults come from catalogue.ts (DEFAULT_PRICES).
// User can override any cell inline in the takeoff.
export interface MaterialPrices {
  metal_studs: Record<MetalStudSize, { piece: number; track: number }>;
  timber_studs: Record<TimberStudSize, number>; // stud = plate, same timber
  boards: Record<BoardType, { bg: number; knauf: number }>;
  screws: Record<ScrewLength, number>;
  framing_screws_per_100: number;
  tape: Record<TapeType, number>;
  jointing: Record<JointingProduct, number>;
  insulation_per_pack: number;
  corner_bead_per_length: number;
  acoustic_sealant_per_cartridge: number;
  perimeter_fixings_per_100: number;
  skim_plaster_per_bag: number;
  drywall_sealer_per_can: number;
}
