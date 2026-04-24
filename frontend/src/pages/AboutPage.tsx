import { usePageTitle } from "../hooks/usePageTitle";

export default function AboutPage() {
  usePageTitle("About");
  return (
    <section className="section section-narrow essay">
      <div className="essay-head">
        <span className="eyebrow">About — Why RMBuild exists</span>
        <h2 className="essay-title">
          I was a labourer before <br />
          I was a computing student.
        </h2>
        <p className="essay-dateline">Rokas · Written in the final year of the dissertation, April 2026</p>
      </div>

      <div className="essay-body">
        <p className="essay-lead">
          Before I wrote a line of code for this project, I carried boards
          up stairs. I mixed compound. I stripped out old metal stud at
          eleven at night because the floor above had to be handed over
          by Monday.
        </p>

        <p>
          The estimators I worked for were good at their job. They were
          also using the same tools as in 1995 — a tape measure, a PDF,
          and an Excel sheet that nobody really owned. Pricing a partition
          job would take a morning. The job would start. Materials would
          sometimes arrive short. Someone would drive to Selco. The margin
          would disappear. Nobody blamed anyone because nobody really knew
          which cell had the wrong number.
        </p>

        <p>
          I kept thinking: the maths is the easy part. The maths is
          published. British Gypsum write it down in the spec and
          give it away for free. Why is this still slow?
        </p>

        <h3>What this is</h3>
        <p>
          RMBuild does one thing. It takes a drawing — a PDF, a photo, a
          sketch — and gives you the full material list to price a
          partition wall. Boards, studs, track or plates, insulation,
          fixings, tape, jointing, sealant, corner beads, skim plaster
          when the wall needs it. Every number tied to a published spec.
          Prices are editable because every merchant is different.
        </p>
        <p>
          Metal studwork follows British Gypsum GypWall Single Frame
          (A206001) — that's what I worked on. Timber partitions follow
          UK domestic convention (38&nbsp;×&nbsp;89&nbsp;mm CLS at 400&nbsp;mm
          centres, NHBC standards). Timber is published practice rather
          than first-hand experience, so if a chippy reading this spots
          something off, the contact form is one click away.
        </p>

        <h3>What it isn't</h3>
        <p>
          It doesn't price labour. Every company prices labour their own
          way, and pretending otherwise would make the tool wrong more
          often than right. It doesn't do metsec, shaftwall, or ceilings
          yet. It doesn't replace an estimator — it gives them back the
          morning.
        </p>

        <h3>Why I'm building it</h3>
        <p>
          Officially, this is my final-year dissertation. Unofficially,
          it's the tool I wish the estimators I worked for had. If it
          gets used, great. If the examiner pokes holes in it, better —
          I'll fix them.
        </p>

        <p className="essay-signoff">
          — Rokas, April 2026
        </p>
      </div>
    </section>
  );
}
