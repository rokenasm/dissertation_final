import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">AI-Powered Drylining Takeoff</span>
            <h1 className="hero-title">
              From drawing to <span className="accent">quote in minutes</span>
            </h1>
            <p className="hero-sub">
              Upload a floor plan, let AI detect the walls, and get a complete material takeoff for
              British Gypsum GypWall partitions — accurate to the spec, ready to price up.
            </p>
            <div className="hero-ctas">
              <Link to="/estimator" className="btn btn-primary btn-lg">Start estimating →</Link>
              <Link to="/about" className="btn btn-ghost btn-lg">How it works</Link>
            </div>
            <div className="hero-trust">
              <span>✓ GypWall Single Frame spec A206001</span>
              <span>✓ Works with PDF & images</span>
              <span>✓ Editable UK merchant prices</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="blueprint-card">
              <div className="blueprint-header">
                <span className="blueprint-dot" />
                <span className="blueprint-dot" />
                <span className="blueprint-dot" />
                <span className="blueprint-filename">floor-plan.pdf</span>
              </div>
              <div className="blueprint-body">
                <svg viewBox="0 0 280 180" className="blueprint-svg">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d6e4f2" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="280" height="180" fill="url(#grid)" />
                  {/* Outer walls */}
                  <rect x="20" y="20" width="240" height="140" fill="none" stroke="#0a1f3d" strokeWidth="3" />
                  {/* Interior partitions (cyan = detected) */}
                  <line x1="120" y1="20" x2="120" y2="100" stroke="#00b4d8" strokeWidth="3" />
                  <line x1="120" y1="100" x2="200" y2="100" stroke="#00b4d8" strokeWidth="3" />
                  {/* Door opening */}
                  <line x1="160" y1="100" x2="180" y2="100" stroke="#fff" strokeWidth="4" />
                  <path d="M 160 100 A 20 20 0 0 1 180 100" fill="none" stroke="#00b4d8" strokeWidth="1" />
                  {/* Dimension labels */}
                  <text x="70" y="15" fill="#0a1f3d" fontSize="9" fontFamily="monospace">5.0 m</text>
                  <text x="5" y="95" fill="#0a1f3d" fontSize="9" fontFamily="monospace" transform="rotate(-90, 10, 90)">2.4 m</text>
                  <circle cx="120" cy="60" r="3" fill="#00b4d8" />
                  <text x="128" y="64" fill="#00b4d8" fontSize="9" fontFamily="monospace" fontWeight="700">Wall 1</text>
                  <circle cx="160" cy="100" r="3" fill="#00b4d8" />
                  <text x="168" y="112" fill="#00b4d8" fontSize="9" fontFamily="monospace" fontWeight="700">Wall 2</text>
                </svg>
              </div>
              <div className="blueprint-footer">
                <span className="blueprint-status">✓ 2 walls detected · 1 opening · scale 1:50</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to a material list</h2>
          <p className="section-sub">No CAD licence, no spreadsheets, no guesswork. Upload, review, get the takeoff.</p>
        </div>
        <div className="steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Upload your plan</h3>
            <p>Drop in a PDF, JPEG or PNG of your floor plan or elevation. Architect drawings, hand sketches, or photos all work.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>AI detects the walls</h3>
            <p>Claude vision reads the drawing, identifies partition walls — even colour-coded wall types — and extracts dimensions.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Get your takeoff</h3>
            <p>Boards, studs, track, insulation, screws, tape, EasiFill — all calculated per GypWall spec with editable prices.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-tint">
        <div className="section-head">
          <span className="eyebrow">What you get</span>
          <h2>Built for real estimating work</h2>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">📐</div>
            <h3>GypWall spec compliant</h3>
            <p>Calculations follow British Gypsum A206001 to the letter — stud spacing, track, waste factors, the lot.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI floor plan reader</h3>
            <p>Upload a drawing and extract walls automatically. Handles architect colour coding for wall types.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💷</div>
            <h3>UK merchant pricing</h3>
            <p>Pre-loaded with current UK trade rates. Edit any price to match your merchant's quote.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🧱</div>
            <h3>Wall templates</h3>
            <p>Standard office partitions, bathrooms, dividing walls — one click to load typical dimensions.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>CSV export</h3>
            <p>Download the full takeoff as a spreadsheet. Share with merchants, clients, or your own systems.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💾</div>
            <h3>Save & restore</h3>
            <p>Save your estimates locally. Come back and reload exactly where you left off.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-card">
          <h2>Ready to try it?</h2>
          <p>No sign-up. No credit card. Just upload a floor plan and see the result.</p>
          <Link to="/estimator" className="btn btn-primary btn-lg">Launch the estimator →</Link>
        </div>
      </section>
    </>
  );
}
