import { usePageTitle } from "../hooks/usePageTitle";

interface Entry {
  date: string;
  tag: "shipped" | "fixed" | "planned";
  title: string;
  body: string;
}

const ENTRIES: Entry[] = [
  {
    date: "2026-04-24",
    tag: "shipped",
    title: "Mobile-first responsive pass",
    body:
      "Every page now behaves on a phone. Navigation wraps, the wall form stacks, the takeoff table scrolls horizontally inside its own block, and the total hero card stacks cleanly at phone sizes. Global horizontal overflow suppressed so nothing can push the viewport wider than the screen.",
  },
  {
    date: "2026-04-24",
    tag: "shipped",
    title: "Finish-aware accessories — skim plaster, corner beads, sealant, VAT",
    body:
      "Corner beads only appear on walls with a paint or skim finish. Skim walls now also get Gyproc Drywall Sealer primer and Thistle Multi-Finish plaster on the bill — previously they only got tape. Every takeoff includes acoustic sealant, perimeter fixings, and a VAT-inclusive total in a hero card at the top so the full cost jumps out.",
  },
  {
    date: "2026-04-24",
    tag: "shipped",
    title: "Product catalogue — Knauf alternatives, CLS timber, screw lengths",
    body:
      "Every product now has a Knauf alternative alongside British Gypsum — brand picked once at project level, whole takeoff swaps. Added CLS timber studwork (38 × 63 and 38 × 89) at 400 mm centres for domestic partitions, with plates and mid-height noggins. Screw length now auto-picks between 25 mm, 38 mm, 45 mm and 38 mm coarse based on board thickness, layers and frame. A reference catalogue panel at the bottom of the estimator lists every product side-by-side with prices researched from UK merchants.",
  },
  {
    date: "2026-04-23",
    tag: "shipped",
    title: "Live auto-calculating takeoff",
    body:
      "The estimator restructured into three numbered sections — drop a drawing, measure walls, read the takeoff. No 'Calculate' button. The moment a wall's dimensions are valid the takeoff appears and keeps updating as you tweak. Multi-skin walls now flip screw length to 45 mm automatically.",
  },
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
    date: "2026-05-10",
    tag: "planned",
    title: "Merchant preset — single-click prices from Jewson, Travis Perkins, Selco",
    body:
      "Replace the current indicative merchant-average prices with a dropdown that pulls a full catalogue of current prices from one merchant. Opens the door to a proper integration with a trade account.",
  },
  {
    date: "2026-05-20",
    tag: "planned",
    title: "Labour-hour estimation on top of materials",
    body:
      "Currently out of scope — every company prices labour differently. Planned as an optional layer: typical hours per m² for boarding, taping, and skimming, fully editable.",
  },
];

function tagLabel(t: Entry["tag"]) {
  if (t === "shipped") return "Shipped";
  if (t === "fixed") return "Fixed";
  return "Planned";
}

export default function ChangelogPage() {
  usePageTitle("Changelog");
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
