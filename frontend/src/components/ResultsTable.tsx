import type {
  WallEstimate, MaterialPrices, WallFormData,
} from "../types";
import type {
  StudSize, BoardType, ScrewLength, MetalStudSize, TimberStudSize,
  Brand, JointingProduct,
} from "../catalogue";
import {
  STUDS, BOARDS, FINISHES, SCREWS, TAPES, JOINTING, FRAMING_SCREWS,
  CORNER_BEAD, STOP_BEAD, ACOUSTIC_SEALANT, PERIMETER_FIXINGS,
  RESILIENT_BAR, PATTRESS, FLAT_PLATE,
  SKIM_PLASTER, DRYWALL_SEALER, VAT_RATE,
  METAL_STUD_ORDER, TIMBER_STUD_ORDER, BOARD_ORDER,
  PAINT_JOINTING_PACK,
  pickBoardScrewLength, isTimber,
} from "../catalogue";

interface Props {
  walls: WallEstimate[];
  formWalls: WallFormData[];
  prices: MaterialPrices;
  onMetalStudPriceChange: (size: MetalStudSize, kind: "piece" | "track", value: number) => void;
  onTimberStudPriceChange: (size: TimberStudSize, value: number) => void;
  onBoardPriceChange: (type: BoardType, brand: "bg" | "knauf", value: number) => void;
  onScrewPriceChange: (len: ScrewLength, value: number) => void;
  onTapePriceChange: (value: number) => void;
  onJointingPriceChange: (product: JointingProduct, value: number) => void;
  onInsulationPriceChange: (value: number) => void;
  onFramingScrewPriceChange: (value: number) => void;
  onCornerBeadPriceChange: (value: number) => void;
  onStopBeadPriceChange: (value: number) => void;
  onAcousticSealantPriceChange: (value: number) => void;
  onPerimeterFixingsPriceChange: (value: number) => void;
  onSkimPlasterPriceChange: (value: number) => void;
  onDrywallSealerPriceChange: (value: number) => void;
  onResilientBarPriceChange: (value: number) => void;
  onPattressPriceChange: (value: number) => void;
  onFlatPlatePriceChange: (value: number) => void;
  onResetPrices: () => void;
}

type RowKind = "board" | "stud" | "fixing" | "finish";

interface TableRow {
  id: string;
  kind: RowKind;
  label: string;
  product: string;
  qtyTotal: number;
  unit: string;
  perWall: (i: number) => number | null;
  unitPrice: number;
  priceUnit: string;
  totalCost: number;
  onPriceChange?: (value: number) => void;
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

function ceil(n: number) {
  return Math.ceil(n - 1e-9);
}

export default function ResultsTable({
  walls,
  formWalls,
  prices,
  onMetalStudPriceChange,
  onTimberStudPriceChange,
  onBoardPriceChange,
  onScrewPriceChange,
  onTapePriceChange,
  onJointingPriceChange,
  onInsulationPriceChange,
  onFramingScrewPriceChange,
  onCornerBeadPriceChange,
  onStopBeadPriceChange,
  onAcousticSealantPriceChange,
  onPerimeterFixingsPriceChange,
  onSkimPlasterPriceChange,
  onDrywallSealerPriceChange,
  onResilientBarPriceChange,
  onPattressPriceChange,
  onFlatPlatePriceChange,
  onResetPrices,
}: Props) {
  const multiWall = walls.length > 1;

  // ── Aggregators keyed per brand+variant so mixed-brand projects split out
  //    cleanly into one row per product variant.
  const boardsByKey = new Map<string, { brand: Brand; type: BoardType; qty: number }>();
  const studsByKey = new Map<string, {
    brand: Brand; size: StudSize; pieces: number; trackPieces: number; nogginPieces: number;
  }>();
  const screwsByLength = new Map<ScrewLength, number>();
  // Jointing products per product id (across brands). A painted wall contributes
  // boarding area to BOTH its brand's first-coat and top-coat products.
  const jointingAreaByProduct = new Map<JointingProduct, number>();
  let framingScrews = 0;
  let insulation = 0;
  let tapeMeters = 0;        // recomputed client-side from raw geometry
  let cornerBeadMeters = 0;  // 2 verticals + 1 head per opening (paint/skim only)
  let stopBeadMeters = 0;    // perimeter run where skim meets other surfaces
  let sealantMeters = 0;     // head + sole + 2 abutments per wall
  let perimeterFixings = 0;  // anchors at 600 mm centres along head + sole
  let skimArea = 0;          // total m² of board that wants a skim coat
  let resilientBarMeters = 0; // horizontal bars at 600 mm centres × length × sides
  let pattressSheets = 0;     // 1 sheet per wall flagged for pattress
  let flatPlateMeters = 0;    // 1 horizontal plate at mid-height per wall > 3 m

  // Per-wall screw length lookup (for perWall column)
  const screwLenForWall: ScrewLength[] = [];

  walls.forEach((w, i) => {
    const f = formWalls[i];
    if (!f) { screwLenForWall.push("25mm"); return; }

    const finish = FINISHES[f.finish];
    const studSpec = STUDS[f.stud_size];

    // Boards — keyed by (brand, type)
    const bKey = `${f.brand}|${f.board_type}`;
    const existingB = boardsByKey.get(bKey) ?? { brand: f.brand, type: f.board_type, qty: 0 };
    existingB.qty += w.boards;
    boardsByKey.set(bKey, existingB);

    // Studs & track/plate — keyed by (brand, size). Timber stud entries have no
    // brand distinction in the catalogue but we still key on brand for consistency
    // (both Gyproc and Knauf sell the same CLS timber at the same rate).
    const trackPiecesCorrect = ceil(w.track_linear_m / studSpec.track_length_m);
    const nogginPieces = studSpec.has_noggins
      ? ceil((w.length_m * (1 + f.stud_waste_pct / 100)) / 3.0)
      : 0;

    const sKey = `${f.brand}|${f.stud_size}`;
    const existingS = studsByKey.get(sKey) ?? {
      brand: f.brand, size: f.stud_size, pieces: 0, trackPieces: 0, nogginPieces: 0,
    };
    existingS.pieces += w.studs_pieces;
    existingS.trackPieces += trackPiecesCorrect;
    existingS.nogginPieces += nogginPieces;
    studsByKey.set(sKey, existingS);

    // Screws — pick length, bucket this wall's count
    const screwLen = pickBoardScrewLength(f.frame_material, f.board_type, f.layers);
    screwLenForWall.push(screwLen);
    screwsByLength.set(screwLen, (screwsByLength.get(screwLen) ?? 0) + w.screws);

    // Framing screws — metal only
    if (f.frame_material === "metal") framingScrews += w.framing_screws;

    // Insulation
    insulation += w.insulation_packs;

    // Tape — recompute raw metres so we can divide by the chosen roll length.
    if (finish.uses_tape) {
      const length = w.length_m;
      const height = w.height_m;
      const verticalJoints = Math.max(0, ceil(length / 1.2) - 1);
      const horizontalRows = Math.max(0, ceil(height / 2.4) - 1);
      const raw = (verticalJoints * height + horizontalRows * length) * f.sides * f.layers;
      tapeMeters += raw * (1 + f.joint_tape_waste_pct / 100);
    }

    // Jointing — painted walls need BOTH a first-coat filler and a top-coat
    // finishing compound, brand-matched (Gyproc = Joint Filler + EasiFill,
    // Knauf = Uniflott + Fill & Finish Light). Tiled / bare walls get nothing;
    // skimmed walls go through the separate skim-plaster path below.
    if (finish.uses_jointing) {
      const pack = PAINT_JOINTING_PACK[f.brand];
      const boardingM2 = w.boarded_area_m2 * f.sides * f.layers;
      const boardingWithWaste = boardingM2 * (1 + f.easifill_waste_pct / 100);
      jointingAreaByProduct.set(
        pack.first,
        (jointingAreaByProduct.get(pack.first) ?? 0) + boardingWithWaste,
      );
      jointingAreaByProduct.set(
        pack.top,
        (jointingAreaByProduct.get(pack.top) ?? 0) + boardingWithWaste,
      );
    }

    // Accessories:
    //   Corner bead per opening = 2 × opening height + 1 × opening width
    //   (two reveals + lintel). Only for paint / skim finishes — no bead
    //   needed under tiles or on bare service walls.
    if (f.finish === "paint" || f.finish === "skim") {
      for (const op of f.openings) {
        cornerBeadMeters += 2 * op.height + op.width;
      }
    }
    //   Acoustic sealant = perimeter of partition (head + sole + 2 abutments).
    sealantMeters += 2 * w.length_m + 2 * w.height_m;
    //   Perimeter fixings = anchors at 600 mm centres, floor + ceiling.
    perimeterFixings += 2 * ceil(w.length_m / 0.6);
    //   Skim — full board face gets a 2 mm plaster skim (primed first).
    //   Stop beads run the full perimeter of the wall (head + sole + two
    //   abutments) to finish the skim edge against neighbouring surfaces.
    if (f.finish === "skim") {
      skimArea += w.boarded_area_m2 * f.sides * f.layers;
      stopBeadMeters += 2 * w.length_m + 2 * w.height_m;
    }
    //   Resilient bars — horizontal bars at 600 mm centres up the stud,
    //   each spanning the full wall length. Applied per side.
    if (f.resilient_bars) {
      const barsPerSide = ceil(w.height_m / (RESILIENT_BAR.spacing_mm / 1000)) + 1;
      resilientBarMeters += barsPerSide * w.length_m * f.sides;
    }
    //   Pattress — 1 × 18 mm ply sheet per wall flagged.
    if (f.pattress) pattressSheets += 1;
    //   Fixing strap — GFS1 at the deflection head at 1200 mm centres, one
    //   strap per 1.2 m of wall length. Only triggers on commercial-height
    //   walls (> 3 m) where the deflection-head detail applies.
    if (w.height_m > FLAT_PLATE.trigger_height_m) {
      flatPlateMeters += w.length_m;
    }
  });

  const tape = TAPES.paper; // always paper joint tape — brand-agnostic
  const tapeRolls = tapeMeters > 0 ? ceil(tapeMeters / tape.roll_length_m) : 0;

  // ── Build rows in display order
  const rows: TableRow[] = [];

  // Boards — one row per (brand, type) combination actually used
  const boardOrder = BOARD_ORDER.flatMap<[Brand, BoardType]>(
    (type) => (["bg", "knauf"] as Brand[]).map((brand) => [brand, type] as [Brand, BoardType]),
  );
  boardOrder.forEach(([brand, type]) => {
    const entry = boardsByKey.get(`${brand}|${type}`);
    if (!entry) return;
    const name = brand === "bg" ? BOARDS[type].bg_name : BOARDS[type].knauf_name;
    const price = brand === "bg" ? prices.boards[type].bg : prices.boards[type].knauf;
    rows.push({
      id: `board-${brand}-${type}`,
      kind: "board",
      label: "Plasterboard",
      product: name,
      qtyTotal: entry.qty,
      unit: "sheets",
      perWall: (i) =>
        formWalls[i]?.brand === brand && formWalls[i]?.board_type === type
          ? walls[i].boards
          : null,
      unitPrice: price,
      priceUnit: "/ sheet",
      totalCost: entry.qty * price,
      onPriceChange: (v) => onBoardPriceChange(type, brand, v),
    });
  });

  // Studs + track/plate + noggins — one row per (brand, stud size)
  const studOrder = [...METAL_STUD_ORDER, ...TIMBER_STUD_ORDER].flatMap<[Brand, StudSize]>(
    (size) => (["bg", "knauf"] as Brand[]).map((brand) => [brand, size] as [Brand, StudSize]),
  );
  studOrder.forEach(([brand, size]) => {
    const agg = studsByKey.get(`${brand}|${size}`);
    if (!agg) return;
    const studSpec = STUDS[size];
    const timber = isTimber(size);

    const studPrice = timber
      ? prices.timber_studs[size as TimberStudSize]
      : prices.metal_studs[size as MetalStudSize].piece;
    const trackPrice = timber
      ? prices.timber_studs[size as TimberStudSize]
      : prices.metal_studs[size as MetalStudSize].track;

    const studProductName =
      timber || brand === "bg" || !studSpec.knauf_name
        ? studSpec.bg_name
        : studSpec.knauf_name;
    const trackProductName =
      timber || brand === "bg" || !studSpec.track_knauf_name
        ? studSpec.track_bg_name
        : studSpec.track_knauf_name;

    const studLabel = timber ? `Timber studs (${size.replace("T", "")})` : `Studs (${size})`;
    const trackLabel = timber ? `Plates (${size.replace("T", "")})` : `Track (${size})`;

    rows.push({
      id: `stud-${brand}-${size}`,
      kind: "stud",
      label: studLabel,
      product: studProductName,
      qtyTotal: agg.pieces,
      unit: timber ? "lengths" : "pieces",
      perWall: (i) =>
        formWalls[i]?.brand === brand && formWalls[i]?.stud_size === size
          ? walls[i].studs_pieces
          : null,
      unitPrice: studPrice,
      priceUnit: timber ? "/ length" : "/ piece",
      totalCost: agg.pieces * studPrice,
      onPriceChange: timber
        ? (v) => onTimberStudPriceChange(size as TimberStudSize, v)
        : (v) => onMetalStudPriceChange(size as MetalStudSize, "piece", v),
    });

    rows.push({
      id: `track-${brand}-${size}`,
      kind: "stud",
      label: trackLabel,
      product: trackProductName,
      qtyTotal: agg.trackPieces,
      unit: "lengths",
      perWall: (i) => {
        if (formWalls[i]?.brand !== brand || formWalls[i]?.stud_size !== size) return null;
        return ceil(walls[i].track_linear_m / studSpec.track_length_m);
      },
      unitPrice: trackPrice,
      priceUnit: "/ length",
      totalCost: agg.trackPieces * trackPrice,
      onPriceChange: timber
        ? (v) => onTimberStudPriceChange(size as TimberStudSize, v)
        : (v) => onMetalStudPriceChange(size as MetalStudSize, "track", v),
    });

    if (timber && agg.nogginPieces > 0) {
      rows.push({
        id: `noggin-${brand}-${size}`,
        kind: "stud",
        label: `Noggins (${size.replace("T", "")})`,
        product: `${studSpec.bg_name} — offcut for mid-height noggins`,
        qtyTotal: agg.nogginPieces,
        unit: "lengths",
        perWall: (i) => {
          if (formWalls[i]?.brand !== brand || formWalls[i]?.stud_size !== size) return null;
          const f = formWalls[i];
          return ceil((walls[i].length_m * (1 + f.stud_waste_pct / 100)) / 3.0);
        },
        unitPrice: studPrice,
        priceUnit: "/ length",
        totalCost: agg.nogginPieces * studPrice,
        onPriceChange: (v) => onTimberStudPriceChange(size as TimberStudSize, v),
      });
    }
  });

  if (insulation > 0) {
    rows.push({
      id: "insulation",
      kind: "fixing",
      label: "Insulation",
      product: "Isover APR 1200 50 mm",
      qtyTotal: insulation,
      unit: "packs",
      perWall: (i) => (formWalls[i]?.insulated ? walls[i].insulation_packs : null),
      unitPrice: prices.insulation_per_pack,
      priceUnit: "/ pack",
      totalCost: insulation * prices.insulation_per_pack,
      onPriceChange: onInsulationPriceChange,
    });
  }

  // Board screws — grouped by length. Brand name follows majority brand in the
  // project (cosmetic; the screw itself is functionally identical across brands).
  const majorityBrand: Brand = formWalls.filter((f) => f.brand === "knauf").length
    > formWalls.length / 2 ? "knauf" : "bg";
  (Object.keys(SCREWS) as ScrewLength[])
    .filter((l) => (screwsByLength.get(l) ?? 0) > 0)
    .forEach((len) => {
      const qty = screwsByLength.get(len)!;
      const spec_ = SCREWS[len];
      const productName = majorityBrand === "bg" ? spec_.bg_name : spec_.knauf_name;
      const price = prices.screws[len];
      rows.push({
        id: `screw-${len}`,
        kind: "fixing",
        label: `Board screws ${len.replace("_coarse", " coarse").replace("mm", " mm")}`,
        product: productName,
        qtyTotal: qty,
        unit: "screws",
        perWall: (i) => (screwLenForWall[i] === len ? walls[i].screws : null),
        unitPrice: price,
        priceUnit: "/ 100",
        totalCost: (qty / 100) * price,
        onPriceChange: (v) => onScrewPriceChange(len, v),
      });
    });

  // Framing screws — metal walls only
  if (framingScrews > 0) {
    rows.push({
      id: "framing",
      kind: "fixing",
      label: "Framing screws",
      product: majorityBrand === "bg" ? FRAMING_SCREWS.bg_name : FRAMING_SCREWS.knauf_name,
      qtyTotal: framingScrews,
      unit: "screws",
      perWall: (i) =>
        formWalls[i]?.frame_material === "metal" ? walls[i].framing_screws : null,
      unitPrice: prices.framing_screws_per_100,
      priceUnit: "/ 100",
      totalCost: (framingScrews / 100) * prices.framing_screws_per_100,
      onPriceChange: onFramingScrewPriceChange,
    });
  }

  if (tapeRolls > 0) {
    const tapeName = majorityBrand === "bg" ? tape.bg_name : tape.knauf_name;
    rows.push({
      id: "tape",
      kind: "finish",
      label: "Joint tape",
      product: tapeName,
      qtyTotal: tapeRolls,
      unit: "rolls",
      perWall: () => null,
      unitPrice: prices.tape.paper,
      priceUnit: "/ roll",
      totalCost: tapeRolls * prices.tape.paper,
      onPriceChange: onTapePriceChange,
    });
  }

  // Accessories — always include if there's at least one valid wall
  if (cornerBeadMeters > 0) {
    const pieces = ceil(cornerBeadMeters / CORNER_BEAD.length_m);
    rows.push({
      id: "corner-bead",
      kind: "finish",
      label: "Corner beads",
      product: CORNER_BEAD.name,
      qtyTotal: pieces,
      unit: "lengths",
      perWall: () => null,
      unitPrice: prices.corner_bead_per_length,
      priceUnit: "/ length",
      totalCost: pieces * prices.corner_bead_per_length,
      onPriceChange: onCornerBeadPriceChange,
    });
  }

  if (stopBeadMeters > 0) {
    const pieces = ceil(stopBeadMeters / STOP_BEAD.length_m);
    rows.push({
      id: "stop-bead",
      kind: "finish",
      label: "Stop beads",
      product: STOP_BEAD.name,
      qtyTotal: pieces,
      unit: "lengths",
      perWall: () => null,
      unitPrice: prices.stop_bead_per_length,
      priceUnit: "/ length",
      totalCost: pieces * prices.stop_bead_per_length,
      onPriceChange: onStopBeadPriceChange,
    });
  }

  if (sealantMeters > 0) {
    const cartridges = ceil(sealantMeters / ACOUSTIC_SEALANT.coverage_m_per_cartridge);
    rows.push({
      id: "acoustic-sealant",
      kind: "fixing",
      label: "Acoustic sealant",
      product: ACOUSTIC_SEALANT.name,
      qtyTotal: cartridges,
      unit: "cartridges",
      perWall: () => null,
      unitPrice: prices.acoustic_sealant_per_cartridge,
      priceUnit: "/ cartridge",
      totalCost: cartridges * prices.acoustic_sealant_per_cartridge,
      onPriceChange: onAcousticSealantPriceChange,
    });
  }

  if (resilientBarMeters > 0) {
    const bars = ceil(resilientBarMeters / RESILIENT_BAR.length_m);
    rows.push({
      id: "resilient-bars",
      kind: "fixing",
      label: "Resilient bars",
      product: RESILIENT_BAR.name,
      qtyTotal: bars,
      unit: "lengths",
      perWall: (i) => {
        const fw = formWalls[i];
        if (!fw?.resilient_bars) return null;
        const barsPerSide = ceil(walls[i].height_m / (RESILIENT_BAR.spacing_mm / 1000)) + 1;
        return ceil((barsPerSide * walls[i].length_m * fw.sides) / RESILIENT_BAR.length_m);
      },
      unitPrice: prices.resilient_bar_per_length,
      priceUnit: "/ length",
      totalCost: bars * prices.resilient_bar_per_length,
      onPriceChange: onResilientBarPriceChange,
    });
  }

  if (flatPlateMeters > 0) {
    const pieces = ceil(flatPlateMeters / FLAT_PLATE.centres_m);
    rows.push({
      id: "flat-plate",
      kind: "stud",
      label: "Fixing straps",
      product: FLAT_PLATE.name,
      qtyTotal: pieces,
      unit: "straps",
      perWall: (i) =>
        walls[i].height_m > FLAT_PLATE.trigger_height_m
          ? ceil(walls[i].length_m / FLAT_PLATE.centres_m)
          : null,
      unitPrice: prices.flat_plate_per_length,
      priceUnit: "/ strap",
      totalCost: pieces * prices.flat_plate_per_length,
      onPriceChange: onFlatPlatePriceChange,
    });
  }

  if (pattressSheets > 0) {
    rows.push({
      id: "pattress",
      kind: "fixing",
      label: "Pattress plywood",
      product: PATTRESS.name,
      qtyTotal: pattressSheets,
      unit: "sheets",
      perWall: (i) => (formWalls[i]?.pattress ? 1 : null),
      unitPrice: prices.pattress_per_sheet,
      priceUnit: "/ sheet",
      totalCost: pattressSheets * prices.pattress_per_sheet,
      onPriceChange: onPattressPriceChange,
    });
  }

  if (perimeterFixings > 0) {
    rows.push({
      id: "perimeter-fixings",
      kind: "fixing",
      label: "Perimeter fixings",
      product: PERIMETER_FIXINGS.name,
      qtyTotal: perimeterFixings,
      unit: "fixings",
      perWall: () => null,
      unitPrice: prices.perimeter_fixings_per_100,
      priceUnit: "/ 100",
      totalCost: (perimeterFixings / 100) * prices.perimeter_fixings_per_100,
      onPriceChange: onPerimeterFixingsPriceChange,
    });
  }

  // Skim plaster + primer (only when at least one wall has finish = skim)
  if (skimArea > 0) {
    const sealerCans = ceil(skimArea / DRYWALL_SEALER.coverage_m2_per_can);
    rows.push({
      id: "drywall-sealer",
      kind: "finish",
      label: "Drywall primer",
      product: DRYWALL_SEALER.name,
      qtyTotal: sealerCans,
      unit: "cans",
      perWall: () => null,
      unitPrice: prices.drywall_sealer_per_can,
      priceUnit: "/ can",
      totalCost: sealerCans * prices.drywall_sealer_per_can,
      onPriceChange: onDrywallSealerPriceChange,
    });

    const plasterBags = ceil(skimArea * 1.1 / SKIM_PLASTER.coverage_m2_per_bag);
    rows.push({
      id: "skim-plaster",
      kind: "finish",
      label: "Skim plaster",
      product: SKIM_PLASTER.name,
      qtyTotal: plasterBags,
      unit: "bags",
      perWall: () => null,
      unitPrice: prices.skim_plaster_per_bag,
      priceUnit: "/ bag",
      totalCost: plasterBags * prices.skim_plaster_per_bag,
      onPriceChange: onSkimPlasterPriceChange,
    });
  }

  // Jointing — emit one row per product actually needed (first-coat filler +
  // top-coat finishing compound, brand-matched from the paint pack).
  (Object.keys(JOINTING) as JointingProduct[]).forEach((product) => {
    const area = jointingAreaByProduct.get(product);
    if (!area || area <= 0) return;
    const jSpec = JOINTING[product];
    const units = ceil(area / jSpec.coverage_m2_per_unit);
    rows.push({
      id: `jointing-${product}`,
      kind: "finish",
      label: "Jointing compound",
      product: `${jSpec.name} (${jSpec.unit_label})`,
      qtyTotal: units,
      unit: jSpec.unit_label.includes("tub") ? "tubs" : "bags",
      perWall: () => null,
      unitPrice: prices.jointing[product],
      priceUnit: `/ ${jSpec.unit_label.includes("tub") ? "tub" : "bag"}`,
      totalCost: units * prices.jointing[product],
      onPriceChange: (v) => onJointingPriceChange(product, v),
    });
  });

  const grandTotal = rows.reduce((sum, r) => sum + r.totalCost, 0);
  const vatAmount = grandTotal * VAT_RATE;
  const grandTotalIncVat = grandTotal + vatAmount;

  function downloadCSV() {
    const wallHeaders = multiWall ? walls.map((_, i) => `Wall ${i + 1}`) : [];
    const headers = ["Material", "Product", ...wallHeaders, "Qty", "Unit", "Unit Price (£)", "Total (£)"];
    const dataRows = rows.map((r) => {
      const perWall = multiWall
        ? walls.map((_, i) => {
            const v = r.perWall(i);
            return v === null ? "—" : String(v);
          })
        : [];
      return [
        r.label,
        `"${r.product}"`,
        ...perWall,
        r.qtyTotal,
        r.unit,
        r.unitPrice.toFixed(2),
        r.totalCost.toFixed(2),
      ].join(",");
    });
    const pad = multiWall ? walls.map(() => "").join(",") + "," : "";
    const totalRow = `Total,,${pad},,,,${grandTotal.toFixed(2)}`;
    const csv = [headers.join(","), ...dataRows, totalRow].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drylining-estimate.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="results">
      <div className="results-header">
        <h2>Material Estimate</h2>
        <div className="results-header-actions">
          <button type="button" className="reset-prices-btn" onClick={onResetPrices}>
            Reset prices
          </button>
          <button type="button" className="export-btn" onClick={() => window.print()}>
            Save as PDF
          </button>
          <button type="button" className="export-btn" onClick={downloadCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Hero total — the number the user actually cares about */}
      <div className="total-hero">
        <div className="total-hero-main">
          <span className="total-hero-label">Total incl. VAT (20%)</span>
          <span className="total-hero-value">{fmt(grandTotalIncVat)}</span>
        </div>
        <div className="total-hero-side">
          <div>
            <span className="total-hero-sub-label">Materials ex VAT</span>
            <span className="total-hero-sub-value">{fmt(grandTotal)}</span>
          </div>
          <div>
            <span className="total-hero-sub-label">VAT @ 20%</span>
            <span className="total-hero-sub-value">{fmt(vatAmount)}</span>
          </div>
        </div>
      </div>

      <div className="results-table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Product</th>
            {multiWall && walls.map((_, i) => <th key={i}>Wall {i + 1}</th>)}
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} data-kind={r.kind}>
              <td className="material-label">{r.label}</td>
              <td className="product-name">{r.product}</td>
              {multiWall &&
                walls.map((_, i) => {
                  const v = r.perWall(i);
                  return (
                    <td key={i} className="qty">
                      {v === null ? "—" : v}
                    </td>
                  );
                })}
              <td className="qty">
                {r.qtyTotal} {r.unit}
              </td>
              <td className="price-cell">
                <div className="price-input-wrap">
                  <span className="currency">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.unitPrice}
                    onChange={(e) =>
                      r.onPriceChange?.(parseFloat(e.target.value) || 0)
                    }
                    className="price-input"
                  />
                  <span className="price-unit">{r.priceUnit}</span>
                </div>
              </td>
              <td className="total-col">{fmt(r.totalCost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="grand-total-row">
            <td colSpan={multiWall ? walls.length + 4 : 4} className="grand-total-label">
              Materials ex VAT
            </td>
            <td className="grand-total-value">{fmt(grandTotal)}</td>
          </tr>
          <tr className="vat-row">
            <td colSpan={multiWall ? walls.length + 4 : 4} className="grand-total-label">
              VAT @ 20%
            </td>
            <td className="grand-total-value">{fmt(vatAmount)}</td>
          </tr>
          <tr className="grand-total-row grand-total-row--final">
            <td colSpan={multiWall ? walls.length + 4 : 4} className="grand-total-label">
              Total incl. VAT
            </td>
            <td className="grand-total-value">{fmt(grandTotalIncVat)}</td>
          </tr>
        </tfoot>
      </table>
      </div>
      <p className="results-note">
        Quantities include waste and are rounded up to whole purchasable units.
        Prices are indicative UK trade rates — edit any to match your merchant's quote.
      </p>
    </div>
  );
}
