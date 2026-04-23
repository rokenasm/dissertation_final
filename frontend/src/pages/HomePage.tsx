import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      {/* Hero — takeoff sheet, not a landing page */}
      <section className="hero-sheet">
        <div className="sheet-header">
          <div className="sheet-header-left">
            <span className="sheet-label">Takeoff sheet</span>
            <span className="sheet-meta">GypWall Single Frame · A206001 · Worked example</span>
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
              Upload a drawing. Read the walls. Price the job. Every number
              tied to the British Gypsum spec, every price editable, nothing
              invented.
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
              <p>Boards, studs, track, insulation, fixings, and tape — all calculated to spec. Jointing compound added when the wall's painted. Prices are editable so it matches your merchant.</p>
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
            Everything below is tied to the published British Gypsum GypWall
            Single Frame spec (A206001). Click any row on the estimator to
            see how the number was worked out.
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
              <td>Boarded area ÷ board coverage × sides × layers</td>
              <td>10%</td>
              <td>Openings deducted first</td>
            </tr>
            <tr>
              <td>C-studs</td>
              <td>Wall length ÷ spacing (600 or 300 mm) + end studs</td>
              <td>5%</td>
              <td>300 mm centres for heavy fixing walls</td>
            </tr>
            <tr>
              <td>U-track</td>
              <td>2 × wall length ÷ 3 m track length</td>
              <td>5%</td>
              <td>Top and bottom track</td>
            </tr>
            <tr>
              <td>Acoustic insulation</td>
              <td>Wall area × number of layers</td>
              <td>10%</td>
              <td>Only if wall is flagged insulated</td>
            </tr>
            <tr>
              <td>Drywall screws</td>
              <td>Boarded area × screws per m²</td>
              <td>15%</td>
              <td>Board-to-stud fixings</td>
            </tr>
            <tr>
              <td>Framing screws</td>
              <td>Stud count × fixings per stud</td>
              <td>15%</td>
              <td>Stud-to-track fixings</td>
            </tr>
            <tr>
              <td>Joint tape</td>
              <td>Linear metres of joints</td>
              <td>10%</td>
              <td>90 m rolls</td>
            </tr>
            <tr>
              <td>Jointing compound</td>
              <td>Area × coverage rate</td>
              <td>10%</td>
              <td>Only if wall is painted, not tiled</td>
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
