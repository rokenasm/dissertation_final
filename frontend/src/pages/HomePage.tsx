import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export default function HomePage() {
  usePageTitle("From drawing to quote in minutes");
  return (
    <>
      {/* Hero — takeoff sheet, not a landing page */}
      <section className="hero-sheet">
        <div className="sheet-header">
          <div className="sheet-header-left">
            <span className="sheet-label">Takeoff sheet</span>
            <span className="sheet-meta">Metal &amp; timber partitions · Gyproc / Knauf / CLS · Worked example</span>
          </div>
          <div className="sheet-header-right">
            <span className="sheet-label">RMBuild</span>
            <span className="sheet-meta">From drawing to quote in minutes</span>
          </div>
        </div>

        <div className="sheet-body">
          <div className="sheet-text">
            <h1 className="sheet-h1">
              A material takeoff tool <br />
              for drylining partitions, <br />
              <em>written by a labourer.</em>
            </h1>
            <p className="sheet-lead">
              Upload a drawing. Read the walls. Price the job. Covers metal
              studwork (Gyproc / Knauf) and timber partitions (CLS), with
              every number tied to a published spec and every price editable.
            </p>
            <div className="sheet-ctas">
              <Link to="/estimator" className="btn btn-primary">Open the estimator →</Link>
              <Link to="/about" className="btn btn-text">Read the story</Link>
            </div>
          </div>

          <aside className="takeoff-preview">
            <div className="takeoff-preview-head">
              <span className="tp-wall">Wall 01 · office partition</span>
              <span className="tp-dim">5.40 m × 2.70 m · 1 door · insulated</span>
            </div>
            <table className="takeoff-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th className="ta-r">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gypwall standard board</td>
                  <td>10</td>
                  <td>£8.40</td>
                  <td className="ta-r">£84.00</td>
                </tr>
                <tr className="annotated">
                  <td>C-stud 70 × 2700</td>
                  <td>11</td>
                  <td>£6.10</td>
                  <td className="ta-r">£67.10</td>
                </tr>
                <tr>
                  <td>U-track 70 × 3000</td>
                  <td>4</td>
                  <td>£5.80</td>
                  <td className="ta-r">£23.20</td>
                </tr>
                <tr className="annotated">
                  <td>Isover acoustic roll</td>
                  <td>2</td>
                  <td>£24.00</td>
                  <td className="ta-r">£48.00</td>
                </tr>
                <tr>
                  <td>Drywall screws 25 mm</td>
                  <td>1</td>
                  <td>£9.50</td>
                  <td className="ta-r">£9.50</td>
                </tr>
                <tr>
                  <td>Joint tape 90 m</td>
                  <td>1</td>
                  <td>£4.20</td>
                  <td className="ta-r">£4.20</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Materials total</td>
                  <td className="ta-r">£235.90</td>
                </tr>
              </tfoot>
            </table>
            <div className="tp-annotations">
              <p><span className="annot-dot" /> 600 mm stud spacing because the wall carries no heavy fixing</p>
              <p><span className="annot-dot" /> Acoustic insulation included because the wall is flagged as insulated</p>
              <p><span className="annot-dot" /> Door opening deducted from the boarded area before board count</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span className="divider-label">How the tool works</span>
      </div>

      {/* Process */}
      <section className="process">
        <h2 className="big-h2">
          Three steps from a <em>drawing</em> to a <em>number</em>.
        </h2>
        <ol className="process-list">
          <li className="process-item">
            <div className="process-marker">01</div>
            <div className="process-body">
              <h3>Upload the plan.</h3>
              <p>Drop in a PDF, a JPEG, or a photo of a drawing. Architect output, hand sketches, site photos — all fair game.</p>
            </div>
          </li>
          <li className="process-item">
            <div className="process-marker">02</div>
            <div className="process-body">
              <h3>Let the machine read it.</h3>
              <p>Partition walls get detected and dimensioned automatically. You review — and correct — before anything gets calculated.</p>
            </div>
          </li>
          <li className="process-item">
            <div className="process-marker">03</div>
            <div className="process-body">
              <h3>Price the takeoff.</h3>
              <p>Boards, studs or timber, tape, jointing, fixings and accessories — all calculated to spec and priced against UK merchants. Skim plaster and primer get added when a wall's skimmed; corner beads appear only where they're actually needed.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span className="divider-label">Specification</span>
      </div>

      {/* Spec table — replaces bento grid */}
      <section className="spec-section">
        <div className="spec-head">
          <h2 className="big-h2 no-em">What the tool actually does.</h2>
          <p className="spec-lead">
            Metal-frame calculations follow British Gypsum GypWall Single
            Frame (A206001); timber-frame follows UK domestic convention
            (38 × 89 mm CLS at 400 mm centres). Every price is editable and
            tied to a UK merchant source.
          </p>
        </div>

        <table className="spec-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>How it's calculated</th>
              <th>Waste</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Plasterboard</td>
              <td>Boarded area ÷ 2.88 m² × sides × layers</td>
              <td>10%</td>
              <td>5 board types, Gyproc or Knauf</td>
            </tr>
            <tr>
              <td>Metal C-studs</td>
              <td>Wall length ÷ spacing (300 or 600 mm) + end studs</td>
              <td>5%</td>
              <td>48 S to 146 S, with matched FEC channel</td>
            </tr>
            <tr>
              <td>Timber studs</td>
              <td>Wall length ÷ 400 mm + end studs + mid-height noggins</td>
              <td>10%</td>
              <td>38 × 63 or 38 × 89 CLS C16, 3 m lengths</td>
            </tr>
            <tr>
              <td>Track / plates</td>
              <td>2 × wall length ÷ stock length (3.6 m metal / 3.0 m timber)</td>
              <td>5%</td>
              <td>Head + sole run</td>
            </tr>
            <tr>
              <td>Acoustic insulation</td>
              <td>Boarded area ÷ 15.6 m² per pack</td>
              <td>5%</td>
              <td>Only when the wall is flagged insulated</td>
            </tr>
            <tr>
              <td>Drywall screws</td>
              <td>Studs × vertical fixings × sides × layers</td>
              <td>10%</td>
              <td>Length auto-picked: 25 / 38 / 45 mm or 38 mm coarse for timber</td>
            </tr>
            <tr>
              <td>Joint tape</td>
              <td>Linear metres of joints ÷ roll length</td>
              <td>10%</td>
              <td>Paper (150 m) or self-adhesive scrim (90 m)</td>
            </tr>
            <tr>
              <td>Jointing compound</td>
              <td>Boarding area ÷ product coverage</td>
              <td>10%</td>
              <td>EasiFill, Joint Filler, ProMix, Uniflott or Fill &amp; Finish</td>
            </tr>
            <tr>
              <td>Skim plaster + primer</td>
              <td>Boarding area ÷ 10 m² &middot; primer ÷ 40 m²</td>
              <td>—</td>
              <td>Only when the finish is skim, not paint</td>
            </tr>
            <tr>
              <td>Accessories</td>
              <td>Corner beads around openings, sealant around perimeter, anchors to substrate</td>
              <td>—</td>
              <td>Often forgotten on manual takeoffs</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span className="divider-label">Why this exists</span>
      </div>

      {/* Story teaser — pulls reader toward /about and /stories */}
      <section className="story-teaser">
        <div className="story-teaser-grid">
          <div className="story-teaser-text">
            <p className="story-teaser-kicker">Before this was a dissertation, I was a labourer.</p>
            <p className="story-teaser-body">
              I carried boards. I watched estimators work off Excel sheets
              that nobody owned, pricing jobs that went over budget because
              of one wrong cell. RMBuild is the tool I wish they'd had.
            </p>
            <div className="story-teaser-ctas">
              <Link to="/about" className="btn btn-text">Read the full story →</Link>
              <Link to="/stories" className="btn btn-text">Five site stories →</Link>
            </div>
          </div>
          <blockquote className="story-teaser-quote">
            <p>
              &ldquo;Pricing a partition job <br />
              shouldn't take a morning. <br />
              <span className="redline">It should take a coffee.</span>&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <div>
            <h2 className="big-h2 no-em">Have a drawing? Try it now.</h2>
            <p className="cta-sub">Free to use. No sign-up needed.</p>
          </div>
          <Link to="/estimator" className="btn btn-primary btn-xl">Launch the estimator →</Link>
        </div>
      </section>
    </>
  );
}
