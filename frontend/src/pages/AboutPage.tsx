export default function AboutPage() {
  return (
    <section className="section section-narrow">
      <div className="section-head">
        <span className="eyebrow">About RMBuild</span>
        <h2>Material estimation, done right</h2>
      </div>

      <div className="prose">
        <p>
          RMBuild is a drylining material estimator built to solve a problem I
          see every day on site: pricing partition walls is slow, error-prone,
          and sitting in spreadsheets nobody updates.
        </p>

        <h3>The problem</h3>
        <p>
          A typical drylining quote starts with a PDF drawing, a tape measure,
          and a calculator. Estimators measure wall lengths by hand, look up
          waste factors from memory, multiply by stud spacing, and hope they
          haven't missed an opening. One wrong row in the spreadsheet and the
          job runs over budget — or worse, short on materials on delivery day.
        </p>

        <h3>The solution</h3>
        <p>
          RMBuild does the maths for you. Upload a floor plan and the AI
          extracts wall dimensions automatically. Prefer to measure yourself?
          Manual entry calculates boards, studs, track, insulation, fixings,
          tape, and EasiFill — all following the official British Gypsum
          GypWall Single Frame specification (A206001).
        </p>

        <h3>Built on real spec</h3>
        <p>
          Every calculation is tied to the published GypWall spec. Stud spacing
          at 600mm or 400mm. Track cut to length plus waste. Board coverage
          from an opening deducted properly. Insulation only if the wall's
          insulated. Nothing invented.
        </p>

        <h3>Materials, not labour</h3>
        <p>
          RMBuild outputs quantities and material costs. Labour stays with you
          — every company prices labour differently, and we're not going to
          pretend otherwise. Our job is to give you an accurate takeoff; yours
          is to price up the work.
        </p>

        <h3>Who it's for</h3>
        <ul>
          <li><strong>Estimators</strong> pricing partition jobs from tender drawings</li>
          <li><strong>Tradespeople</strong> quoting direct to customers</li>
          <li><strong>Project managers</strong> checking supplier quotes against the spec</li>
          <li><strong>DIY builders</strong> working out what to buy for a home project</li>
        </ul>

        <p className="signoff">
          Built by Rokas — final-year dissertation project, University of Surrey.
        </p>
      </div>
    </section>
  );
}
