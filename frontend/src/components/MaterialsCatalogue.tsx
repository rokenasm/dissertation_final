import type { MaterialPrices } from "../types";
import {
  STUDS, BOARDS, SCREWS, TAPES, JOINTING, FRAMING_SCREWS, INSULATION,
  METAL_STUD_ORDER, TIMBER_STUD_ORDER, BOARD_ORDER, TAPE_ORDER, JOINTING_ORDER,
} from "../catalogue";

interface Props {
  prices: MaterialPrices;
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

export default function MaterialsCatalogue({ prices }: Props) {
  return (
    <details className="catalogue-panel">
      <summary className="catalogue-head">
        <span className="assist-num">04</span>
        <div className="assist-head-text">
          <h3>Product catalogue <span className="assist-optional">— reference</span></h3>
          <p>
            Every product the tool can recommend, British Gypsum and Knauf side-by-side,
            with current indicative UK trade prices. Read-only — edit prices inside the
            takeoff above.
          </p>
        </div>
        <span className="assist-chevron" aria-hidden>▾</span>
      </summary>

      <div className="catalogue-body">
        {/* Metal studs */}
        <section className="catalogue-section">
          <h4>Metal studwork · Gypframe / Knauf C-Stud + matched channel</h4>
          <table className="catalogue-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>British Gypsum</th>
                <th>Knauf</th>
                <th>Max height</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {METAL_STUD_ORDER.map((size) => {
                const s = STUDS[size];
                return (
                  <>
                    <tr key={`${size}-stud`}>
                      <td className="cat-size">{size} stud</td>
                      <td>{s.bg_name}</td>
                      <td>{s.knauf_name ?? "—"}</td>
                      <td className="cat-label">{s.partition_label}</td>
                      <td className="cat-price">{fmt(prices.metal_studs[size].piece)} / length</td>
                    </tr>
                    <tr key={`${size}-track`}>
                      <td className="cat-size">{size} track</td>
                      <td>{s.track_bg_name}</td>
                      <td>{s.track_knauf_name ?? "—"}</td>
                      <td className="cat-label">Floor &amp; ceiling channel</td>
                      <td className="cat-price">{fmt(prices.metal_studs[size].track)} / length</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Timber studs */}
        <section className="catalogue-section">
          <h4>Timber studwork · CLS C16 (domestic partitions)</h4>
          <table className="catalogue-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Product</th>
                <th>Use</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {TIMBER_STUD_ORDER.map((size) => {
                const s = STUDS[size];
                return (
                  <tr key={size}>
                    <td className="cat-size">{size.replace("T", "")}</td>
                    <td>{s.bg_name}</td>
                    <td className="cat-label">{s.partition_label}</td>
                    <td className="cat-price">{fmt(prices.timber_studs[size])} / length</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="cat-note">
            Timber studs double as head / sole plates and noggins — the takeoff breaks
            them out on separate lines but the product is the same CLS.
          </p>
        </section>

        {/* Boards */}
        <section className="catalogue-section">
          <h4>Plasterboard · 2400 × 1200 mm sheets</h4>
          <table className="catalogue-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>British Gypsum</th>
                <th>BG £</th>
                <th>Knauf</th>
                <th>Knauf £</th>
              </tr>
            </thead>
            <tbody>
              {BOARD_ORDER.map((type) => {
                const b = BOARDS[type];
                return (
                  <tr key={type}>
                    <td className="cat-size">
                      {b.thickness_mm} mm
                      <span className="cat-label">{b.tagline}</span>
                    </td>
                    <td>{b.bg_name}</td>
                    <td className="cat-price">{fmt(prices.boards[type].bg)}</td>
                    <td>{b.knauf_name}</td>
                    <td className="cat-price">{fmt(prices.boards[type].knauf)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Fixings */}
        <section className="catalogue-section">
          <h4>Fixings · drywall &amp; framing screws</h4>
          <table className="catalogue-table">
            <thead>
              <tr>
                <th>Screw</th>
                <th>Use</th>
                <th>Price / 100</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(SCREWS) as (keyof typeof SCREWS)[]).map((len) => {
                const s = SCREWS[len];
                return (
                  <tr key={len}>
                    <td className="cat-size">{len.replace("_coarse", " coarse").replace("mm", " mm")}</td>
                    <td>
                      <strong>{s.bg_name}</strong>
                      <span className="cat-label">{s.tagline}</span>
                    </td>
                    <td className="cat-price">{fmt(prices.screws[len])}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="cat-size">13 mm wafer</td>
                <td>
                  <strong>{FRAMING_SCREWS.bg_name}</strong>
                  <span className="cat-label">{FRAMING_SCREWS.tagline}</span>
                </td>
                <td className="cat-price">{fmt(prices.framing_screws_per_100)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Tape + jointing */}
        <section className="catalogue-section">
          <h4>Tape &amp; jointing compounds</h4>
          <table className="catalogue-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Unit / coverage</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {TAPE_ORDER.map((t) => {
                const sp = TAPES[t];
                return (
                  <tr key={t}>
                    <td className="cat-size">
                      Tape — {t}
                      <span className="cat-label">{sp.tagline}</span>
                    </td>
                    <td>{sp.bg_name} / {sp.knauf_name}</td>
                    <td>{sp.roll_length_m} m roll</td>
                    <td className="cat-price">{fmt(prices.tape[t])}</td>
                  </tr>
                );
              })}
              {JOINTING_ORDER.map((j) => {
                const sp = JOINTING[j];
                return (
                  <tr key={j}>
                    <td className="cat-size">
                      {sp.name}
                      <span className="cat-label">{sp.tagline}</span>
                    </td>
                    <td>{sp.brand === "bg" ? "British Gypsum" : "Knauf"}</td>
                    <td>{sp.unit_label} · {sp.coverage_m2_per_unit} m²</td>
                    <td className="cat-price">{fmt(prices.jointing[j])}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="cat-size">
                  Insulation
                  <span className="cat-label">{INSULATION.tagline}</span>
                </td>
                <td>{INSULATION.name}</td>
                <td>{INSULATION.coverage_m2_per_pack} m² / pack</td>
                <td className="cat-price">{fmt(prices.insulation_per_pack)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p className="cat-footnote">
          Prices sourced April 2026 from UK merchants (Building Materials, Condell,
          Insulation Wholesale, Trade Insulations, Materials Market, Insulation
          Superstore) and are indicative ex VAT. Confirm with your own merchant
          before ordering.
        </p>
      </div>
    </details>
  );
}
