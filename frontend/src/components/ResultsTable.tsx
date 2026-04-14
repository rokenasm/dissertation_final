import type { WallEstimate, ProjectTotals } from "../types";

interface Props {
  walls: WallEstimate[];
  totals: ProjectTotals;
}

interface Row {
  label: string;
  product: string;
  unit: string;
  perWall: (w: WallEstimate) => string;
  total: (t: ProjectTotals) => string;
}

const ROWS: Row[] = [
  {
    label: "Plasterboard",
    product: "Gyproc WallBoard 12.5mm",
    unit: "sheets",
    perWall: (w) => `${w.boards}`,
    total: (t) => `${t.boards}`,
  },
  {
    label: "Studs",
    product: "Gypframe 48 S 50 'C' Stud",
    unit: "pieces",
    perWall: (w) => `${w.studs_pieces} (${w.studs_linear_m} m)`,
    total: (t) => `${t.studs_pieces} (${t.studs_linear_m} m)`,
  },
  {
    label: "Track",
    product: "Gypframe 50 FEC 50 Channel",
    unit: "lengths",
    perWall: (w) => `${w.track_pieces} (${w.track_linear_m} m)`,
    total: (t) => `${t.track_pieces} (${t.track_linear_m} m)`,
  },
  {
    label: "Insulation",
    product: "Isover APR 1200 50mm",
    unit: "packs",
    perWall: (w) => (w.insulation_packs > 0 ? `${w.insulation_packs}` : "—"),
    total: (t) => (t.insulation_packs > 0 ? `${t.insulation_packs}` : "—"),
  },
  {
    label: "Board screws",
    product: "BG Drywall Screws 25mm",
    unit: "screws",
    perWall: (w) => `${w.screws}`,
    total: (t) => `${t.screws}`,
  },
  {
    label: "Framing screws",
    product: "BG Wafer Head Screws 13mm",
    unit: "screws",
    perWall: (w) => `${w.framing_screws}`,
    total: (t) => `${t.framing_screws}`,
  },
  {
    label: "Joint tape",
    product: "Gyproc Joint Tape 150m",
    unit: "rolls",
    perWall: (w) => `${w.joint_tape_rolls}`,
    total: (t) => `${t.joint_tape_rolls}`,
  },
  {
    label: "Jointing compound",
    product: "Gyproc EasiFill 60 (10 kg)",
    unit: "bags",
    perWall: (w) => `${w.easifill_bags}`,
    total: (t) => `${t.easifill_bags}`,
  },
];

export default function ResultsTable({ walls, totals }: Props) {
  const multiWall = walls.length > 1;

  return (
    <div className="results">
      <h2>Material Estimate</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Product</th>
            {multiWall && walls.map((_, i) => <th key={i}>Wall {i + 1}</th>)}
            <th>{multiWall ? "Total" : "Quantity"}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="product-name">{row.product}</td>
              {multiWall && walls.map((w, i) => (
                <td key={i} className="qty">{row.perWall(w)}</td>
              ))}
              <td className="qty total-col">
                <strong>{row.total(totals)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="results-note">
        All quantities include waste allowance and are rounded up to whole purchasable units.
      </p>
    </div>
  );
}
