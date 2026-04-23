import type { WallEstimate, MaterialPrices, WallFormData, SharedPriceKey } from "../types";
import type { StudSize, BoardType } from "../catalogue";
import {
  STUDS,
  BOARDS,
  FINISHES,
  STUD_ORDER,
  BOARD_ORDER,
} from "../catalogue";

interface Props {
  walls: WallEstimate[];
  formWalls: WallFormData[];
  prices: MaterialPrices;
  onStudPriceChange: (size: StudSize, kind: "piece" | "track", value: number) => void;
  onBoardPriceChange: (type: BoardType, value: number) => void;
  onOtherPriceChange: (key: SharedPriceKey, value: number) => void;
}

type RowKind = "heading" | "board" | "stud" | "track" | "shared";

interface TableRow {
  kind: RowKind;
  id: string;
  label: string;
  product: string;
  qtyTotal: number;
  unit: string;
  perWall: (i: number) => number | null; // null = wall doesn't use this variant
  unitPrice: number;
  priceUnit: string;
  totalCost: number;
  onPriceChange?: (value: number) => void;
  isHeading?: boolean;
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

export default function ResultsTable({
  walls,
  formWalls,
  prices,
  onStudPriceChange,
  onBoardPriceChange,
  onOtherPriceChange,
}: Props) {
  const multiWall = walls.length > 1;

  // ── Group data by stud size + board type; aggregate the rest.
  const boardsByType = new Map<BoardType, number>();
  const studsBySize = new Map<StudSize, { pieces: number; track: number }>();
  let insulation = 0;
  let screws = 0;
  let framing = 0;
  let tape = 0;
  let easifill = 0;

  walls.forEach((w, i) => {
    const form = formWalls[i];
    if (!form) return;
    const finish = FINISHES[form.finish];

    boardsByType.set(form.board_type, (boardsByType.get(form.board_type) ?? 0) + w.boards);
    const cur = studsBySize.get(form.stud_size) ?? { pieces: 0, track: 0 };
    cur.pieces += w.studs_pieces;
    cur.track += w.track_pieces;
    studsBySize.set(form.stud_size, cur);

    insulation += w.insulation_packs;
    screws += w.screws;
    framing += w.framing_screws;
    if (finish.uses_tape) tape += w.joint_tape_rolls;
    if (finish.uses_easifill) easifill += w.easifill_bags;
  });

  // ── Build rows in display order.
  const rows: TableRow[] = [];

  // Boards — one per type in use, ordered
  BOARD_ORDER.filter((t) => boardsByType.has(t)).forEach((type) => {
    const qty = boardsByType.get(type) ?? 0;
    const unitPrice = prices.boards[type];
    rows.push({
      kind: "board",
      id: `board-${type}`,
      label: "Plasterboard",
      product: BOARDS[type].name,
      qtyTotal: qty,
      unit: "sheets",
      perWall: (i) => (formWalls[i]?.board_type === type ? walls[i].boards : null),
      unitPrice,
      priceUnit: "/ sheet",
      totalCost: qty * unitPrice,
      onPriceChange: (v) => onBoardPriceChange(type, v),
    });
  });

  // Studs + matched track — grouped per size in use
  STUD_ORDER.filter((s) => studsBySize.has(s)).forEach((size) => {
    const agg = studsBySize.get(size)!;
    const spec = STUDS[size];
    const studPrice = prices.studs[size].piece;
    const trackPrice = prices.studs[size].track;

    rows.push({
      kind: "stud",
      id: `stud-${size}`,
      label: `Studs (${size})`,
      product: spec.name,
      qtyTotal: agg.pieces,
      unit: "pieces",
      perWall: (i) => (formWalls[i]?.stud_size === size ? walls[i].studs_pieces : null),
      unitPrice: studPrice,
      priceUnit: "/ piece",
      totalCost: agg.pieces * studPrice,
      onPriceChange: (v) => onStudPriceChange(size, "piece", v),
    });

    rows.push({
      kind: "track",
      id: `track-${size}`,
      label: `Track (${size})`,
      product: spec.track_name,
      qtyTotal: agg.track,
      unit: "lengths",
      perWall: (i) => (formWalls[i]?.stud_size === size ? walls[i].track_pieces : null),
      unitPrice: trackPrice,
      priceUnit: "/ length",
      totalCost: agg.track * trackPrice,
      onPriceChange: (v) => onStudPriceChange(size, "track", v),
    });
  });

  if (insulation > 0) {
    rows.push({
      kind: "shared",
      id: "insulation",
      label: "Insulation",
      product: "Isover APR 1200 50 mm",
      qtyTotal: insulation,
      unit: "packs",
      perWall: (i) => (formWalls[i]?.insulated ? walls[i].insulation_packs : null),
      unitPrice: prices.insulation_per_pack,
      priceUnit: "/ pack",
      totalCost: insulation * prices.insulation_per_pack,
      onPriceChange: (v) => onOtherPriceChange("insulation_per_pack", v),
    });
  }

  if (screws > 0) {
    rows.push({
      kind: "shared",
      id: "screws",
      label: "Board screws",
      product: "BG Drywall Screws 25 mm",
      qtyTotal: screws,
      unit: "screws",
      perWall: (i) => walls[i].screws,
      unitPrice: prices.screws_per_100,
      priceUnit: "/ 100",
      totalCost: (screws / 100) * prices.screws_per_100,
      onPriceChange: (v) => onOtherPriceChange("screws_per_100", v),
    });
  }

  if (framing > 0) {
    rows.push({
      kind: "shared",
      id: "framing",
      label: "Framing screws",
      product: "BG Wafer Head Screws 13 mm",
      qtyTotal: framing,
      unit: "screws",
      perWall: (i) => walls[i].framing_screws,
      unitPrice: prices.framing_screws_per_100,
      priceUnit: "/ 100",
      totalCost: (framing / 100) * prices.framing_screws_per_100,
      onPriceChange: (v) => onOtherPriceChange("framing_screws_per_100", v),
    });
  }

  if (tape > 0) {
    rows.push({
      kind: "shared",
      id: "tape",
      label: "Joint tape",
      product: "Gyproc Joint Tape 150 m",
      qtyTotal: tape,
      unit: "rolls",
      perWall: (i) =>
        FINISHES[formWalls[i]?.finish ?? "paint"].uses_tape ? walls[i].joint_tape_rolls : null,
      unitPrice: prices.joint_tape_per_roll,
      priceUnit: "/ roll",
      totalCost: tape * prices.joint_tape_per_roll,
      onPriceChange: (v) => onOtherPriceChange("joint_tape_per_roll", v),
    });
  }

  if (easifill > 0) {
    rows.push({
      kind: "shared",
      id: "easifill",
      label: "Jointing compound",
      product: "Gyproc EasiFill 60 (10 kg)",
      qtyTotal: easifill,
      unit: "bags",
      perWall: (i) =>
        FINISHES[formWalls[i]?.finish ?? "paint"].uses_easifill ? walls[i].easifill_bags : null,
      unitPrice: prices.easifill_per_bag,
      priceUnit: "/ bag",
      totalCost: easifill * prices.easifill_per_bag,
      onPriceChange: (v) => onOtherPriceChange("easifill_per_bag", v),
    });
  }

  const grandTotal = rows.reduce((sum, r) => sum + r.totalCost, 0);

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
        <button type="button" className="export-btn" onClick={downloadCSV}>
          Export CSV
        </button>
      </div>
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
            <tr key={r.id}>
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
              Total estimated cost
            </td>
            <td className="grand-total-value">{fmt(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="results-note">
        Quantities include waste and are rounded up to whole purchasable units.
        Prices are indicative UK trade rates — edit any to match your merchant's quote.
      </p>
    </div>
  );
}
