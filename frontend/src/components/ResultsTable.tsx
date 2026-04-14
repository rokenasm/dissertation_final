import type { WallEstimate, ProjectTotals, MaterialPrices } from "../types";

interface Props {
  walls: WallEstimate[];
  totals: ProjectTotals;
  prices: MaterialPrices;
  onPriceChange: (key: keyof MaterialPrices, value: number) => void;
}

interface Row {
  label: string;
  product: string;
  qty: (t: ProjectTotals) => number;
  unit: string;
  priceKey: keyof MaterialPrices;
  priceUnit: string;
  perWall?: (w: WallEstimate) => string;
  totalCost: (t: ProjectTotals, p: MaterialPrices) => number;
}

const ROWS: Row[] = [
  {
    label: "Plasterboard",
    product: "Gyproc WallBoard 12.5mm",
    qty: (t) => t.boards,
    unit: "sheets",
    priceKey: "board_per_sheet",
    priceUnit: "/ sheet",
    perWall: (w) => `${w.boards}`,
    totalCost: (t, p) => t.boards * p.board_per_sheet,
  },
  {
    label: "Studs",
    product: "Gypframe 48 S 50 'C' Stud",
    qty: (t) => t.studs_pieces,
    unit: "pieces",
    priceKey: "stud_per_piece",
    priceUnit: "/ piece",
    perWall: (w) => `${w.studs_pieces}`,
    totalCost: (t, p) => t.studs_pieces * p.stud_per_piece,
  },
  {
    label: "Track",
    product: "Gypframe 50 FEC 50 Channel",
    qty: (t) => t.track_pieces,
    unit: "lengths",
    priceKey: "track_per_length",
    priceUnit: "/ length",
    perWall: (w) => `${w.track_pieces}`,
    totalCost: (t, p) => t.track_pieces * p.track_per_length,
  },
  {
    label: "Insulation",
    product: "Isover APR 1200 50mm",
    qty: (t) => t.insulation_packs,
    unit: "packs",
    priceKey: "insulation_per_pack",
    priceUnit: "/ pack",
    perWall: (w) => (w.insulation_packs > 0 ? `${w.insulation_packs}` : "—"),
    totalCost: (t, p) => t.insulation_packs * p.insulation_per_pack,
  },
  {
    label: "Board screws",
    product: "BG Drywall Screws 25mm",
    qty: (t) => t.screws,
    unit: "screws",
    priceKey: "screws_per_100",
    priceUnit: "/ 100",
    perWall: (w) => `${w.screws}`,
    totalCost: (t, p) => (t.screws / 100) * p.screws_per_100,
  },
  {
    label: "Framing screws",
    product: "BG Wafer Head Screws 13mm",
    qty: (t) => t.framing_screws,
    unit: "screws",
    priceKey: "framing_screws_per_100",
    priceUnit: "/ 100",
    perWall: (w) => `${w.framing_screws}`,
    totalCost: (t, p) => (t.framing_screws / 100) * p.framing_screws_per_100,
  },
  {
    label: "Joint tape",
    product: "Gyproc Joint Tape 150m",
    qty: (t) => t.joint_tape_rolls,
    unit: "rolls",
    priceKey: "joint_tape_per_roll",
    priceUnit: "/ roll",
    perWall: (w) => `${w.joint_tape_rolls}`,
    totalCost: (t, p) => t.joint_tape_rolls * p.joint_tape_per_roll,
  },
  {
    label: "Jointing compound",
    product: "Gyproc EasiFill 60 (10 kg)",
    qty: (t) => t.easifill_bags,
    unit: "bags",
    priceKey: "easifill_per_bag",
    priceUnit: "/ bag",
    perWall: (w) => `${w.easifill_bags}`,
    totalCost: (t, p) => t.easifill_bags * p.easifill_per_bag,
  },
];

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

export default function ResultsTable({ walls, totals, prices, onPriceChange }: Props) {
  const multiWall = walls.length > 1;
  const grandTotal = ROWS.reduce((sum, row) => sum + row.totalCost(totals, prices), 0);

  return (
    <div className="results">
      <h2>Material Estimate</h2>
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
          {ROWS.map((row) => {
            const qty = row.qty(totals);
            const cost = row.totalCost(totals, prices);
            const hidden = row.label === "Insulation" && qty === 0;
            if (hidden) return null;

            return (
              <tr key={row.label}>
                <td className="material-label">{row.label}</td>
                <td className="product-name">{row.product}</td>
                {multiWall && walls.map((w, i) => (
                  <td key={i} className="qty">{row.perWall ? row.perWall(w) : "—"}</td>
                ))}
                <td className="qty">{qty} {row.unit}</td>
                <td className="price-cell">
                  <div className="price-input-wrap">
                    <span className="currency">£</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices[row.priceKey]}
                      onChange={(e) =>
                        onPriceChange(row.priceKey, parseFloat(e.target.value) || 0)
                      }
                      className="price-input"
                    />
                    <span className="price-unit">{row.priceUnit}</span>
                  </div>
                </td>
                <td className="total-col">{fmt(cost)}</td>
              </tr>
            );
          })}
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
        Quantities include waste allowance and are rounded up to whole purchasable units.
        Prices are indicative UK trade rates — edit to match your merchant's prices.
      </p>
    </div>
  );
}
