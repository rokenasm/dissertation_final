import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-rule" />
              <span>No. 001 — Drylining Series</span>
            </div>
            <h1 className="hero-title">
              From drawing to<br />
              quote in <em>minutes</em>.
            </h1>
            <p className="hero-sub">
              A material takeoff tool for British Gypsum GypWall partitions —
              built by someone who works in the trade, for people who actually
              price these jobs.
            </p>
            <div className="hero-ctas">
              <Link to="/estimator" className="btn btn-primary">Start estimating →</Link>
              <Link to="/about" className="btn btn-text">Read the story</Link>
            </div>
          </div>

          {/* Title-block card */}
          <aside className="titleblock">
            <div className="titleblock-top">
              <div className="titleblock-cell">
                <span className="tb-key">Project</span>
                <span className="tb-val">RMBuild</span>
              </div>
              <div className="titleblock-cell">
                <span className="tb-key">Rev.</span>
                <span className="tb-val">04</span>
              </div>
            </div>
            <div className="titleblock-body">
              <div className="tb-row">
                <span className="tb-key">Spec</span>
                <span className="tb-val tb-mono">A206001 — GypWall Single Frame</span>
              </div>
              <div className="tb-row">
                <span className="tb-key">Scope</span>
                <span className="tb-val">Material takeoff only</span>
              </div>
              <div className="tb-row">
                <span className="tb-key">Inputs</span>
                <span className="tb-val tb-mono">PDF · JPG · PNG · manual</span>
              </div>
              <div className="tb-row">
                <span className="tb-key">Output</span>
                <span className="tb-val tb-mono">Boards · studs · track · ins. · fixings · tape · EasiFill</span>
              </div>
            </div>
            <div className="titleblock-bottom">
              <div className="tb-stat">
                <span className="tb-stat-num">12</span>
                <span className="tb-stat-label">materials calculated</span>
              </div>
              <div className="tb-stat">
                <span className="tb-stat-num">~30s</span>
                <span className="tb-stat-label">per floor plan</span>
              </div>
              <div className="tb-stat">
                <span className="tb-stat-num">£0</span>
                <span className="tb-stat-label">to try</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span className="divider-label">Method</span>
      </div>

      {/* How it works — as a numbered vertical list with callout lines */}
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
              <p>Boards, studs, track, fixings, tape, EasiFill — all calculated to spec. Prices are editable so it matches your merchant.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span className="divider-label">Features</span>
      </div>

      {/* Bento grid — varied sizes */}
      <section className="bento">
        <div className="bento-card bento-lg">
          <div className="bento-tag">Spec-compliant</div>
          <h3>Every calc tied to <em>GypWall A206001</em>.</h3>
          <p>
            Stud spacing at 600 or 400 mm. Track cut with waste. Openings
            deducted from the boarded area. Insulation only if the wall's
            insulated. Nothing invented — just the published spec, done right.
          </p>
          <div className="bento-detail">
            <span className="tb-mono">GypWall Single Frame · Spec A206001</span>
          </div>
        </div>

        <div className="bento-card bento-md">
          <div className="bento-tag">Vision</div>
          <h3>Walls, detected.</h3>
          <p>Upload a floor plan and get dimensioned partitions back. Handles architect colour-coding for wall types.</p>
        </div>

        <div className="bento-card bento-md bento-red">
          <div className="bento-tag">UK pricing</div>
          <h3>Merchant-ready numbers.</h3>
          <p>Pre-loaded with UK trade rates. Edit any price in place — the total updates live.</p>
        </div>

        <div className="bento-card bento-sm">
          <div className="bento-tag">Templates</div>
          <h3>One-click walls.</h3>
          <p>Office partitions. Bathrooms. Dividing walls. Common builds, pre-filled.</p>
        </div>

        <div className="bento-card bento-sm">
          <div className="bento-tag">CSV</div>
          <h3>Export, anywhere.</h3>
          <p>Download the takeoff as a spreadsheet. Share with merchants, clients, PMs.</p>
        </div>

        <div className="bento-card bento-sm">
          <div className="bento-tag">Local save</div>
          <h3>Come back to it.</h3>
          <p>Saves stay in your browser. No account, no server, no chance of losing a quote.</p>
        </div>
      </section>

      {/* Redline callout */}
      <section className="pullquote">
        <p className="pullquote-text">
          &ldquo;Pricing a partition job shouldn't take a morning.<br />
          <span className="redline">It should take a coffee.</span>&rdquo;
        </p>
        <p className="pullquote-attr">— the whole point of RMBuild</p>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <div>
            <h2 className="big-h2 no-em">Have a drawing? Try it now.</h2>
            <p className="cta-sub">No sign-up. No credit card. Free to use.</p>
          </div>
          <Link to="/estimator" className="btn btn-primary btn-xl">Launch the estimator →</Link>
        </div>
      </section>
    </>
  );
}
