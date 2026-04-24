import type { MaterialPrices } from "./types";
import type {
  MetalStudSize, TimberStudSize, BoardType, ScrewLength, TapeType, JointingProduct,
} from "./catalogue";
import {
  STUDS, BOARDS, SCREWS, TAPES, JOINTING, FRAMING_SCREWS, INSULATION,
  CORNER_BEAD, STOP_BEAD, ACOUSTIC_SEALANT, PERIMETER_FIXINGS,
  RESILIENT_BAR, PATTRESS, FLAT_PLATE,
  SKIM_PLASTER, DRYWALL_SEALER,
  METAL_STUD_ORDER, TIMBER_STUD_ORDER, BOARD_ORDER, TAPE_ORDER, JOINTING_ORDER,
} from "./catalogue";

// Build default editable prices from the catalogue. All numbers are overridable
// inline in the takeoff; users should confirm with their own merchant.
const metalStuds = METAL_STUD_ORDER.reduce((acc, size) => {
  acc[size] = { piece: STUDS[size].stud_price, track: STUDS[size].track_price };
  return acc;
}, {} as Record<MetalStudSize, { piece: number; track: number }>);

const timberStuds = TIMBER_STUD_ORDER.reduce((acc, size) => {
  acc[size] = STUDS[size].stud_price;
  return acc;
}, {} as Record<TimberStudSize, number>);

const boards = BOARD_ORDER.reduce((acc, type) => {
  acc[type] = { bg: BOARDS[type].bg_price, knauf: BOARDS[type].knauf_price };
  return acc;
}, {} as Record<BoardType, { bg: number; knauf: number }>);

const screws = (Object.keys(SCREWS) as ScrewLength[]).reduce((acc, len) => {
  acc[len] = SCREWS[len].price_per_100;
  return acc;
}, {} as Record<ScrewLength, number>);

const tape = TAPE_ORDER.reduce((acc, t) => {
  acc[t] = TAPES[t].price_per_roll;
  return acc;
}, {} as Record<TapeType, number>);

const jointing = JOINTING_ORDER.reduce((acc, j) => {
  acc[j] = JOINTING[j].price_per_unit;
  return acc;
}, {} as Record<JointingProduct, number>);

export const DEFAULT_PRICES: MaterialPrices = {
  metal_studs: metalStuds,
  timber_studs: timberStuds,
  boards,
  screws,
  framing_screws_per_100: FRAMING_SCREWS.price_per_100,
  tape,
  jointing,
  insulation_per_pack: INSULATION.price_per_pack,
  corner_bead_per_length: CORNER_BEAD.price_per_length,
  stop_bead_per_length: STOP_BEAD.price_per_length,
  acoustic_sealant_per_cartridge: ACOUSTIC_SEALANT.price_per_cartridge,
  perimeter_fixings_per_100: PERIMETER_FIXINGS.price_per_100,
  skim_plaster_per_bag: SKIM_PLASTER.price_per_bag,
  drywall_sealer_per_can: DRYWALL_SEALER.price_per_can,
  resilient_bar_per_length: RESILIENT_BAR.price_per_length,
  pattress_per_sheet: PATTRESS.price_per_sheet,
  flat_plate_per_length: FLAT_PLATE.price_per_length,
};
