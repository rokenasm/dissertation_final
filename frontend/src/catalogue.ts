// Catalogue of partition-wall products — British Gypsum + Knauf alternatives,
// plus CLS timber studwork for domestic partitions.
//
// Prices are UK trade ex VAT, researched April 2026 from UK merchants
// (Building Materials, Condell, Insulation Wholesale, Trade Insulations,
// Materials Market, Insulation Superstore). Editable inline in the takeoff —
// users should confirm with their own merchant before ordering.

export type MetalStudSize = "48S" | "60S" | "70S" | "92S" | "146S";
export type TimberStudSize = "T38x63" | "T38x89";
export type StudSize = MetalStudSize | TimberStudSize;

export type FrameMaterial = "metal" | "timber";
export type BoardType = "standard" | "mr" | "fireline" | "soundbloc" | "duraline";
export type Finish = "paint" | "skim" | "tile" | "none";
export type Brand = "bg" | "knauf";
export type TapeType = "paper" | "scrim";
export type JointingProduct =
  | "easifill"
  | "joint_filler"
  | "promix"
  | "uniflott"
  | "fillfinish";
export type ScrewLength = "25mm" | "38mm" | "45mm" | "38mm_coarse";

// ── Studs ───────────────────────────────────────────────────────────────────

export interface StudSpec {
  frame_material: FrameMaterial;
  partition_label: string;
  bg_name: string;
  knauf_name: string | null;
  stud_price: number;
  // For metal: track = floor/ceiling channel (3.6 m length).
  // For timber: "track" = head/sole plate — same timber as the stud (3.0 m length).
  track_bg_name: string;
  track_knauf_name: string | null;
  track_price: number;
  track_length_m: number;
  has_noggins: boolean;
}

export const STUDS: Record<StudSize, StudSpec> = {
  "48S": {
    frame_material: "metal",
    partition_label: "up to 3.6 m — metal, light domestic",
    bg_name: "Gypframe 48 S 50 'C' Stud 3 m",
    knauf_name: "Knauf 50 C-Stud 3 m",
    stud_price: 4.30,
    track_bg_name: "Gypframe 50 FEC 50 Channel 3.6 m",
    track_knauf_name: "Knauf 50 U-Track 3.6 m",
    track_price: 6.00,
    track_length_m: 3.6,
    has_noggins: false,
  },
  "60S": {
    frame_material: "metal",
    partition_label: "up to 4.0 m — metal",
    bg_name: "Gypframe 60 S 50 'C' Stud 3 m",
    knauf_name: "Knauf 70 C-Stud 3 m",
    stud_price: 6.15,
    track_bg_name: "Gypframe 62 FEC 50 Channel 3.6 m",
    track_knauf_name: "Knauf 70 U-Track 3.6 m",
    track_price: 6.50,
    track_length_m: 3.6,
    has_noggins: false,
  },
  "70S": {
    frame_material: "metal",
    partition_label: "up to 4.5 m — metal, standard trade",
    bg_name: "Gypframe 70 S 50 'C' Stud 3 m",
    knauf_name: "Knauf 70 C-Stud 3 m",
    stud_price: 6.14,
    track_bg_name: "Gypframe 72 FEC 50 Channel 3.6 m",
    track_knauf_name: "Knauf 70 U-Track 3.6 m",
    track_price: 7.34,
    track_length_m: 3.6,
    has_noggins: false,
  },
  "92S": {
    frame_material: "metal",
    partition_label: "up to 5.4 m — metal, commercial",
    bg_name: "Gypframe 92 S 50 'C' Stud 3 m",
    knauf_name: "Knauf 92 C-Stud 3 m",
    stud_price: 10.06,
    track_bg_name: "Gypframe 94 FEC 50 Channel 3.6 m",
    track_knauf_name: "Knauf 92 U-Track 3.6 m",
    track_price: 9.50,
    track_length_m: 3.6,
    has_noggins: false,
  },
  "146S": {
    frame_material: "metal",
    partition_label: "up to 8.0 m — metal, high-bay commercial",
    bg_name: "Gypframe 146 S 50 'C' Stud 3 m",
    knauf_name: "Knauf 146 C-Stud 3 m",
    stud_price: 16.20,
    track_bg_name: "Gypframe 148 FEC 50 Channel 3.6 m",
    track_knauf_name: "Knauf 146 U-Track 3.6 m",
    track_price: 13.00,
    track_length_m: 3.6,
    has_noggins: false,
  },
  "T38x63": {
    frame_material: "timber",
    partition_label: "domestic — CLS 3×2, light partitions",
    bg_name: "CLS C16 38 × 63 mm stud 3 m",
    knauf_name: null,
    stud_price: 4.00,
    track_bg_name: "CLS C16 38 × 63 mm plate 3 m",
    track_knauf_name: null,
    track_price: 4.00,
    track_length_m: 3.0,
    has_noggins: true,
  },
  "T38x89": {
    frame_material: "timber",
    partition_label: "domestic — CLS 4×2, takes insulation (default)",
    bg_name: "CLS C16 38 × 89 mm stud 3 m",
    knauf_name: null,
    stud_price: 6.50,
    track_bg_name: "CLS C16 38 × 89 mm plate 3 m",
    track_knauf_name: null,
    track_price: 6.50,
    track_length_m: 3.0,
    has_noggins: true,
  },
};

export const METAL_STUD_ORDER: MetalStudSize[] = ["48S", "60S", "70S", "92S", "146S"];
export const TIMBER_STUD_ORDER: TimberStudSize[] = ["T38x63", "T38x89"];
export const STUD_ORDER: StudSize[] = [...METAL_STUD_ORDER, ...TIMBER_STUD_ORDER];

export function isTimber(size: StudSize): size is TimberStudSize {
  return STUDS[size].frame_material === "timber";
}

// ── Boards ──────────────────────────────────────────────────────────────────

export interface BoardSpec {
  bg_name: string;
  knauf_name: string;
  thickness_mm: 12.5 | 15;
  tagline: string;
  bg_price: number;
  knauf_price: number;
}

export const BOARDS: Record<BoardType, BoardSpec> = {
  standard: {
    bg_name: "Gyproc WallBoard 12.5 mm",
    knauf_name: "Knauf Wallboard 12.5 mm",
    thickness_mm: 12.5,
    tagline: "Bedrooms, living rooms, offices",
    bg_price: 12.50,
    knauf_price: 10.00,
  },
  mr: {
    bg_name: "Gyproc Moisture Resistant 12.5 mm",
    knauf_name: "Knauf Moisture Panel 12.5 mm",
    thickness_mm: 12.5,
    tagline: "Bathrooms, kitchens, utility rooms",
    bg_price: 16.50,
    knauf_price: 22.00,
  },
  fireline: {
    bg_name: "Gyproc FireLine 12.5 mm",
    knauf_name: "Knauf Fire Panel 12.5 mm",
    thickness_mm: 12.5,
    tagline: "Fire-rated partitions & riser ducts",
    bg_price: 17.50,
    knauf_price: 20.00,
  },
  soundbloc: {
    bg_name: "Gyproc SoundBloc 12.5 mm",
    knauf_name: "Knauf Soundshield Plus 12.5 mm",
    thickness_mm: 12.5,
    tagline: "Acoustic — party walls, hotels, schools",
    bg_price: 20.50,
    knauf_price: 15.70,
  },
  duraline: {
    bg_name: "Gyproc DuraLine 15 mm",
    knauf_name: "Knauf Safeboard 15 mm",
    thickness_mm: 15,
    tagline: "High-impact — corridors, hospitals",
    bg_price: 25.00,
    knauf_price: 22.00,
  },
};

export const BOARD_ORDER: BoardType[] = ["standard", "mr", "fireline", "soundbloc", "duraline"];

// ── Finishes ────────────────────────────────────────────────────────────────

export interface FinishSpec {
  label: string;
  tagline: string;
  uses_tape: boolean;
  uses_jointing: boolean;
}

export const FINISHES: Record<Finish, FinishSpec> = {
  paint: {
    label: "Paint",
    tagline: "Tape + jointing, then paint",
    uses_tape: true,
    uses_jointing: true,
  },
  skim: {
    label: "Skim",
    tagline: "Taped joints under a full plaster skim",
    uses_tape: true,
    uses_jointing: false,
  },
  tile: {
    label: "Tile",
    tagline: "Boards tiled directly — no jointing",
    uses_tape: false,
    uses_jointing: false,
  },
  none: {
    label: "Bare",
    tagline: "Riser / service wall — no finish applied",
    uses_tape: false,
    uses_jointing: false,
  },
};

export const FINISH_ORDER: Finish[] = ["paint", "skim", "tile", "none"];

// ── Screws ──────────────────────────────────────────────────────────────────

export interface ScrewSpec {
  bg_name: string;
  knauf_name: string;
  price_per_100: number;
  tagline: string;
}

export const SCREWS: Record<ScrewLength, ScrewSpec> = {
  "25mm": {
    bg_name: "BG Drywall Screws 25 mm",
    knauf_name: "Knauf Drywall Screw 25 mm",
    price_per_100: 0.78,
    tagline: "Single-skin 12.5 mm → metal stud",
  },
  "38mm": {
    bg_name: "BG Drywall Screws 38 mm",
    knauf_name: "Knauf Drywall Screw 38 mm",
    price_per_100: 1.00,
    tagline: "Single-skin 15 mm → metal stud",
  },
  "45mm": {
    bg_name: "BG Drywall Screws 45 mm",
    knauf_name: "Knauf Drywall Screw 45 mm",
    price_per_100: 1.28,
    tagline: "Double-skin → metal stud",
  },
  "38mm_coarse": {
    bg_name: "Drywall Screws Coarse 38 mm",
    knauf_name: "Drywall Screws Coarse 38 mm",
    price_per_100: 0.75,
    tagline: "Plasterboard → timber stud",
  },
};

export const FRAMING_SCREWS = {
  bg_name: "BG Wafer Head Drywall Screws 13 mm",
  knauf_name: "Knauf Wafer Head Screw 13 mm",
  price_per_100: 0.94,
  tagline: "Stud → metal track (metal frame only)",
};

// Pick board-fixing screw length from frame / board thickness / layers.
// 1 × 12.5 → 25 mm; 1 × 15 → 38 mm; 2 × anything → 45 mm; timber → 38 mm coarse.
export function pickBoardScrewLength(
  frameMaterial: FrameMaterial,
  boardType: BoardType,
  layers: number,
): ScrewLength {
  if (frameMaterial === "timber") return "38mm_coarse";
  const thickness = BOARDS[boardType].thickness_mm;
  if (layers === 1) return thickness === 15 ? "38mm" : "25mm";
  return "45mm";
}

// ── Tape ────────────────────────────────────────────────────────────────────

export interface TapeSpec {
  bg_name: string;
  knauf_name: string;
  price_per_roll: number;
  roll_length_m: number;
  tagline: string;
}

export const TAPES: Record<TapeType, TapeSpec> = {
  paper: {
    bg_name: "Gyproc Paper Joint Tape 150 m",
    knauf_name: "Knauf Paper Joint Tape 150 m",
    price_per_roll: 7.49,
    roll_length_m: 150,
    tagline: "Paper — traditional, under filler",
  },
  scrim: {
    bg_name: "Self-Adhesive Scrim Tape 50 mm × 90 m",
    knauf_name: "Knauf Fibre Tape 50 mm × 90 m",
    price_per_roll: 8.00,
    roll_length_m: 90,
    tagline: "Scrim — self-adhesive fibreglass, faster",
  },
};

export const TAPE_ORDER: TapeType[] = ["paper", "scrim"];

// ── Jointing compounds ─────────────────────────────────────────────────────

export interface JointingSpec {
  name: string;
  brand: Brand;
  tagline: string;
  coverage_m2_per_unit: number;
  unit_label: string;
  price_per_unit: number;
}

export const JOINTING: Record<JointingProduct, JointingSpec> = {
  easifill: {
    name: "Gyproc EasiFill 60",
    brand: "bg",
    tagline: "Setting filler — one-step (default)",
    coverage_m2_per_unit: 40,
    unit_label: "10 kg bag",
    price_per_unit: 22.00,
  },
  joint_filler: {
    name: "Gyproc Joint Filler",
    brand: "bg",
    tagline: "Setting first coat + finish coat",
    coverage_m2_per_unit: 35,
    unit_label: "12.5 kg bag",
    price_per_unit: 22.50,
  },
  promix: {
    name: "Gyproc ProMix Lite",
    brand: "bg",
    tagline: "Ready-mixed air-drying topcoat",
    coverage_m2_per_unit: 55,
    unit_label: "20 kg tub",
    price_per_unit: 57.00,
  },
  uniflott: {
    name: "Knauf Uniflott / Premium Joint Filler",
    brand: "knauf",
    tagline: "Setting filler — strong, tapered-edge joints",
    coverage_m2_per_unit: 22,
    unit_label: "5 kg bag",
    price_per_unit: 16.50,
  },
  fillfinish: {
    name: "Knauf Fill & Finish Light",
    brand: "knauf",
    tagline: "Ready-mixed lightweight topcoat",
    coverage_m2_per_unit: 60,
    unit_label: "20 kg tub",
    price_per_unit: 30.00,
  },
};

export const JOINTING_ORDER: JointingProduct[] = [
  "easifill", "joint_filler", "promix", "uniflott", "fillfinish",
];

// ── Insulation ─────────────────────────────────────────────────────────────

export const INSULATION = {
  name: "Isover APR 1200 50 mm Acoustic Partition Roll",
  tagline: "Non-combustible glass wool — 50 mm × 15.6 m² per pack",
  price_per_pack: 47.00,
  coverage_m2_per_pack: 15.6,
};

// ── Accessories (commonly forgotten on a takeoff) ──────────────────────────

export const SKIM_PLASTER = {
  name: "Thistle Multi-Finish 25 kg",
  tagline: "Finish plaster for skim coat — approx 10 m² per bag at 2 mm",
  coverage_m2_per_bag: 10,
  price_per_bag: 11.00,
};

export const DRYWALL_SEALER = {
  name: "Gyproc Drywall Sealer 5 L",
  tagline: "High-suction primer for plasterboard before skim",
  coverage_m2_per_can: 40,
  price_per_can: 28.00,
};

export const CORNER_BEAD = {
  name: "Corner bead / angle bead 2.4 m",
  tagline: "Metal or PVC — each external corner & opening reveal",
  length_m: 2.4,
  price_per_length: 2.50,
};

export const ACOUSTIC_SEALANT = {
  name: "Gyproc / Knauf Acoustic Sealant C3",
  tagline: "Run along head, sole and abutments per BG spec",
  coverage_m_per_cartridge: 10,
  price_per_cartridge: 8.00,
};

export const PERIMETER_FIXINGS = {
  name: "Hammer-in nail anchors",
  tagline: "Fix floor / ceiling track to concrete substrate",
  price_per_100: 7.50,
};

export const VAT_RATE = 0.20;
