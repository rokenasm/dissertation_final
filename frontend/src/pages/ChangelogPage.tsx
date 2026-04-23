interface Entry {
  date: string;
  tag: "shipped" | "fixed" | "planned";
  title: string;
  body: string;
}

const ENTRIES: Entry[] = [
  {
    date: "2026-04-22",
    tag: "shipped",
    title: "Admin inbox, stories page, changelog, and personal About",
    body:
      "Rebuilt the About page as an essay. Added five site-stories at /stories to show why this tool exists. Wrote the contact form into a real FastAPI + SQLite inbox with a password-gated /admin page so messages actually go somewhere.",
  },
  {
    date: "2026-04-21",
    tag: "shipped",
    title: "Homepage rewrite — killed the generic SaaS bento grid",
    body:
      "Swapped the bento card layout for an annotated takeoff preview and a spec-style feature table. The homepage now reads more like a datasheet than a landing page — which is the point.",
  },
  {
    date: "2026-04-20",
    tag: "shipped",
    title: "Input validation, CSV export, save and restore",
    body:
      "Walls now validate before submitting. The estimate can be downloaded as a CSV. The last estimate is saved locally so refreshing the page doesn't lose your work.",
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "AI floor-plan agent — Claude vision integration",
    body:
      "Upload a PDF, JPEG, or PNG of a floor plan. Claude extracts partition runs with lengths, heights, and openings. You review and edit before anything gets calculated.",
  },
  {
    date: "2026-04-16",
    tag: "shipped",
    title: "Inline editable pricing with total cost",
    body:
      "Every material row has an editable unit price. The total cost updates live. Defaults are UK trade rates, but any price can be swapped in place.",
  },
  {
    date: "2026-04-27",
    tag: "planned",
    title: "Supplier dropdown and wall-finish toggle",
    body:
      "Pre-load prices from Jewson, Travis Perkins, and Selco. One dropdown swaps every unit price at once. A finish toggle per wall (paint, tile, skim-only) conditionally adds jointing compound.",
  },
  {
    date: "2026-04-29",
    tag: "planned",
    title: "Live materials sidebar on the estimator",
    body:
      "A sticky panel that updates as you type. Every keystroke shows the current takeoff — no 'Calculate' button needed.",
  },
];

function tagLabel(t: Entry["tag"]) {
  if (t === "shipped") return "Shipped";
  if (t === "fixed") return "Fixed";
  return "Planned";
}

export default function ChangelogPage() {
  return (
    <section className="section section-narrow changelog">
      <div className="section-head">
        <span className="eyebrow">Changelog — What I've been building</span>
        <h2>Week-by-week, what's gone into RMBuild.</h2>
        <p className="section-sub">
          A real person, working on a real deadline. This page is the
          logbook — most AI-generated websites don't have one because
          nothing is actually being built week to week.
        </p>
      </div>

      <ol className="changelog-list">
        {ENTRIES.map((e, i) => (
          <li key={i} className={`changelog-item changelog-${e.tag}`}>
            <div className="changelog-sidebar">
              <time className="changelog-date">{e.date}</time>
              <span className={`changelog-tag changelog-tag-${e.tag}`}>
                {tagLabel(e.tag)}
              </span>
            </div>
            <div className="changelog-body">
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
