import { createFileRoute, Link } from "@tanstack/react-router";
import { site, testimonials } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import facility from "@/assets/facility.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Studio — Fabric Care Expertise | Spin & Dry" },
      {
        name: "description",
        content:
          "Spin & Dry has cared for household and commercial fabrics since 2013: professional equipment, trained technicians, documented quality assurance and honest fabric assessment.",
      },
      { property: "og:title", content: "The Studio — Spin & Dry" },
      {
        property: "og:description",
        content:
          "Twelve years of professional fabric care: equipment, training, quality assurance and the people behind the studio.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    title: "Professional equipment",
    body: "Large-capacity drums that let bulky items move freely, programmable wash chemistry, controlled-temperature drying and roller press finishing. Domestic machines physically cannot do this work.",
  },
  {
    title: "Trained technicians",
    body: "Every technician is trained in fibre identification, dye stability, stain chemistry and finishing. Nothing is processed on a guess.",
  },
  {
    title: "Quality assurance",
    body: "Two-stage inspection: intake grading with photographs, and a final check against the manifest for stain lift, odour, shrinkage and finish before packing.",
  },
  {
    title: "Fabric care expertise",
    body: "From heirloom kantha quilts to hotel duvet covers, each item is matched to a programme built for its construction, not the machine that happens to be free.",
  },
  {
    title: "Honest assessment",
    body: "If a stain will not lift or a pillow is past saving, we say so at inspection. You approve a quote knowing what the outcome will be.",
  },
  {
    title: "Documented handling",
    body: "Digital manifests, per-item tagging and intake photography mean nothing is lost, swapped or disputed.",
  },
];

function AboutPage() {
  return (
    <div>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">The studio</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
            We started because good fabric kept being ruined by the wrong wash
          </h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <p className="text-lg leading-relaxed text-ink-soft">
              Spin &amp; Dry opened in {site.founded} as a specialist fabric care studio, not a
              neighbourhood laundry. The reason was simple: the items people care most about —
              curtains, carpets, quilts, upholstery, heirloom linen — are the items most often
              damaged by generic cleaning. Shrunken drapes, felted wool, flattened comforters,
              covers that never fit the sofa again.
            </p>
            <p className="text-lg leading-relaxed text-ink-soft">
              So we built the studio around inspection and process. Fabrics are identified before
              they are washed, measured before they are dried, and checked twice before they are
              packed. Twelve years later the same discipline serves households, hotels,
              restaurants, offices, interior designers and property managers across the city.
            </p>
          </div>
        </div>
      </header>

      <section className="border-b border-border px-5 py-14 md:px-10">
        <dl className="mx-auto grid max-w-[88rem] gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {site.stats.map((s) => (
            <div key={s.label} className="bg-background p-8">
              <dt className="font-display text-5xl text-brass">{s.value}</dt>
              <dd className="mt-3 text-sm text-ink-soft">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid border-b border-border lg:grid-cols-[1.1fr_1fr]">
        <div className="px-5 py-16 md:px-14 md:py-24">
          <p className="eyebrow text-brass">Capability</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            What professional fabric care actually requires
          </h2>
          <ul className="mt-12 grid gap-px bg-border">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 50} className="bg-background py-7">
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
        <img
          src={facility}
          alt="Interior of the Spin & Dry fabric care studio with professional laundry equipment"
          width={1600}
          height={1104}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </section>

      <section className="border-b border-border bg-ink px-5 py-16 text-background md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Who we serve</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            Households and businesses that treat fabric as an asset
          </h2>
          <ul className="mt-12 flex flex-wrap gap-2 text-sm">
            {[
              "Families",
              "Apartment residents",
              "Villa owners",
              "Working professionals",
              "Hotels",
              "Serviced apartments",
              "Restaurants & cafes",
              "Corporate offices",
              "Interior designers",
              "Property managers",
              "Salons & spas",
              "Clinics & wellness studios",
            ].map((a) => (
              <li key={a} className="border border-background/25 px-4 py-2.5">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Testimonials</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">What clients say</h2>
          <ul className="mt-12 grid gap-px bg-border md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 60} className="bg-background p-9">
                <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <p className="eyebrow mt-6 text-muted-foreground">
                  {t.name} — {t.role}
                </p>
              </Reveal>
            ))}
          </ul>
          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Book a pickup
            </Link>
            <Link
              to="/services"
              className="border border-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              See all services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}