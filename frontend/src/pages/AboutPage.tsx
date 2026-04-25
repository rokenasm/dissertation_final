import { usePageTitle } from "../hooks/usePageTitle";

export default function AboutPage() {
  usePageTitle("About");
  return (
    <section className="section section-narrow essay">
      <div className="essay-head essay-head--with-photo">
        <div className="essay-head-text">
          <span className="eyebrow">About — Why RMBuild exists</span>
          <h2 className="essay-title">
            I was a labourer before <br />
            I was a software engineering student.
          </h2>
          <p className="essay-dateline">Rokas · Written in the final year of the dissertation, April 2026</p>
        </div>
        <figure className="essay-photo">
          <img
            src="/award.JPG"
            alt="Rokas receiving a health and safety award at Luton & Dunstable University Hospital"
          />
          <figcaption>H&amp;S award · Luton &amp; Dunstable University Hospital, 2022–24.</figcaption>
        </figure>
      </div>

      <div className="essay-body">
        <p className="essay-lead">
          I started on site in November 2021 at <strong>Grove View
          Integrated Health and Care Hub</strong>, an NHS primary care
          fit-out. It was my first construction job. Most days were
          labouring — carrying boards up stairs, fetching materials,
          keeping the trades moving. But I helped with everything else
          as it came up — anything to do with drylining, I had a hand
          in. You learn the trade by being underneath it before you're
          on top of it.
        </p>
        <p>
          The job began with SFS — Steel Framing Systems — so the first
          thing I had to learn was how all the different metals fit
          together. What each section is for, where it goes, why. I was
          learning the materials and the system at the same time as
          working alongside the people building with them, and SFS is
          not an easy place to start.
        </p>

        <p>
          After Grove View I moved onto a longer project at <strong>Luton
          &amp; Dunstable University Hospital</strong>, on site from 2022
          through to the end of 2024. Three years of drylining across a
          live hospital environment is where the rest of the trade
          really clicked — and where I picked up the health and safety
          award shown above.
        </p>

        <p>
          After that I worked a few more sites before landing where I am
          now: in <strong>March 2026 I started as a trainee estimator</strong>.
          The tool you're looking at is partly the reason I got here, and
          partly the result of getting here.
        </p>

        <figure className="essay-figure">
          <img
            src="/grove-view-partition.JPG"
            alt="Metal stud partition mid-build at Grove View"
          />
          <figcaption>
            Grove View partition mid-build — Gypframe C-studs at 600&nbsp;mm
            centres between U-track at floor and soffit. This is the
            exact system RMBuild prices.
          </figcaption>
        </figure>

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
          (A206001) — the system in the photo above. Timber partitions
          follow UK domestic convention (38&nbsp;×&nbsp;89&nbsp;mm CLS at
          600&nbsp;mm centres, NHBC standards). Timber is published
          practice rather than first-hand experience, so if a chippy
          reading this spots something off, the contact form is one
          click away.
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
          it's a tool for the people who don't have an estimator to
          call — anyone building their first partition wall at home,
          anyone walking into a builder's merchant without a trade
          account. If it gets used, great.
        </p>

        <p className="essay-signoff">
          — Rokas, April 2026
        </p>
      </div>
    </section>
  );
}
