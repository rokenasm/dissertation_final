import { usePageTitle } from "../hooks/usePageTitle";

interface Story {
  id: string;
  year: string;
  place: string;
  headline: string;
  body: string;
  lesson: string;
}

const STORIES: Story[] = [
  {
    id: "hospital-mr-boards",
    year: "2023",
    place: "A hospital in the South East",
    headline: "Eighty metres short on delivery day.",
    body:
      "The take-off had the wrong waste factor in one cell. Nobody caught it. The boards arrived, the labourers started, and by lunchtime the foreman was on the phone to the merchant asking for more MR board than was on site in a fifty-mile radius.",
    lesson:
      "A spreadsheet with one wrong cell looks identical to a spreadsheet that's right. A tool that shows its working does not.",
  },
  {
    id: "office-fitout-revisions",
    year: "2024",
    place: "An office fit-out in West London",
    headline: "Three revisions. Three recalculations by hand.",
    body:
      "The architect kept moving one partition. Each new drawing meant the estimator had to re-measure, re-type, and re-price. On the third revision the dividing wall between two offices was quietly dropped from the sheet. Nobody noticed until first fix.",
    lesson:
      "If the drawing changes, the takeoff should change with it — not be rebuilt from scratch each time.",
  },
  {
    id: "domestic-skim-only",
    year: "2024",
    place: "A domestic refurb, North London",
    headline: "EasiFill on a wall that was getting tiled.",
    body:
      "The quote included jointing compound for every square metre of board. The client's bathroom wall was going to be tiled top to bottom. The compound wasn't needed. It wasn't a big number, but it was the one the client circled and asked about. The estimator had to explain it.",
    lesson:
      "Finish matters. A wall that's tiled doesn't need the same materials as a wall that's painted. The tool has to know.",
  },
  {
    id: "commercial-spacing",
    year: "2023",
    place: "A commercial fit-out, City",
    headline: "Stud spacing at 600 when it should have been 300.",
    body:
      "The spec called for 300 mm centres because the wall was taking a heavy noticeboard. The estimate was built at 600. The price came in low and competitive. The PM noticed the discrepancy in pre-start and the company ate the difference.",
    lesson:
      "The published spec has reasons for every number. Ignoring them cheaper-up-front is a guaranteed loss later.",
  },
  {
    id: "late-night-takeoff",
    year: "2023",
    place: "An estimator's kitchen table, 11pm",
    headline: "The tender goes in tomorrow.",
    body:
      "Fourteen partition runs, each with openings, each with a different height. Two coffees in. The estimator's wife is asking when he's coming to bed. The deadline is 9 a.m. One of the runs gets transposed — length becomes height — and it isn't caught. The tender wins, the job loses.",
    lesson:
      "The worst estimating mistakes happen at eleven at night. The tool should make the maths the boring bit.",
  },
];

export default function StoriesPage() {
  usePageTitle("Stories from site");
  return (
    <section className="section section-narrow stories">
      <div className="section-head">
        <span className="eyebrow">Stories — From the sites I worked on</span>
        <h2>Why this tool exists, in five stories.</h2>
        <p className="section-sub">
          Real jobs, stripped of names and locations. Every one of these
          is a thing I watched happen, or a thing that happened to the
          estimator I was working for. Every one of them is the kind of
          thing RMBuild is trying to stop happening.
        </p>
      </div>

      <ol className="stories-list">
        {STORIES.map((s, i) => (
          <li key={s.id} className="story-card">
            <div className="story-meta">
              <span className="story-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="story-year">{s.year}</span>
              <span className="story-place">{s.place}</span>
            </div>
            <h3 className="story-headline">{s.headline}</h3>
            <p className="story-body">{s.body}</p>
            <p className="story-lesson">
              <span className="story-lesson-label">Lesson — </span>
              {s.lesson}
            </p>
          </li>
        ))}
      </ol>

      <p className="stories-outro">
        Got a story of your own? <a href="/contact">Send it in</a> — the
        best ones become features.
      </p>
    </section>
  );
}
