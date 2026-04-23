export default function AboutPage() {
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
          sketch — and gives you the material list to price a GypWall
          partition. Boards, studs, track, insulation, fixings, tape.
          Every number tied to the published British Gypsum spec
          (A206001). Prices are editable because every merchant is
          different.
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
