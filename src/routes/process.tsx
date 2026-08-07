import { createFileRoute, Link } from "@tanstack/react-router";
import { journey, site } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import facility from "@/assets/facility.jpg";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "How It Works — Pickup, Cleaning & Delivery | Spin & Dry" },
      {
        name: "description",
        content:
          "The complete Spin & Dry customer journey: book a collection, doorstep pickup, inspection and quote, professional cleaning, quality check, then delivery and re-fitting.",
      },
      { property: "og:title", content: "How It Works — Spin & Dry" },
      {
        property: "og:description",
        content:
          "Six stages from booking to delivery, including inspection, quoting and quality control.",
      },
      { property: "og:url", content: "/process" },
    ],
    links: [{ rel: "canonical", href: "/process" }],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <div>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Process</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">
            From your door to the studio and back, in six stages
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">
            Every order follows the same documented sequence. You always know where your fabrics
            are, what they will cost and when they return.
          </p>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <ol className="mx-auto max-w-[88rem]">
          {journey.map((j, i) => (
            <Reveal
              as="li"
              key={j.step}
              delay={i * 60}
              className="grid gap-6 border-t border-border py-10 md:grid-cols-[6rem_1fr_1.2fr] md:items-baseline md:gap-12"
            >
              <span className="font-display text-5xl text-brass">{j.step}</span>
              <h2 className="font-display text-3xl">{j.title}</h2>
              <p className="text-ink-soft">{j.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="grid border-b border-border lg:grid-cols-2">
        <img
          src={facility}
          alt="Spin & Dry technician inspecting cleaned linen beside professional laundry equipment"
          width={1600}
          height={1104}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="px-5 py-16 md:px-14 md:py-24">
          <p className="eyebrow text-brass">Policies, stated plainly</p>
          <h2 className="mt-4 font-display text-4xl">What you can count on</h2>
          <dl className="mt-10 grid gap-8">
            <Policy
              term="Pickup policy"
              def={`Free doorstep pickup within ${site.pickupRadiusKm} km of the studio, in two-hour slots, seven days a week. Items are counted and tagged with you present.`}
            />
            <Policy
              term="Delivery policy"
              def="Returned in a slot you choose, packed in breathable covers. Curtains and sofa covers are re-hung and refitted on site."
            />
            <Policy
              term="Outside the radius"
              def={`Beyond ${site.pickupRadiusKm} km you can drop off at the studio, or contact us for a consultation, special request or commercial route assessment.`}
            />
            <Policy
              term="Pricing & approval"
              def="Quotes follow inspection and are shared before processing. Nothing is cleaned without your approval, and payment is collected on delivery."
            />
            <Policy
              term="Cleaning methods"
              def="Professional laundering with fabric-specific programmes, controlled drying and finishing equipment. Spin & Dry does not provide wet cleaning."
            />
          </dl>
          <Link
            to="/book"
            className="mt-12 inline-block bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
          >
            Book a pickup
          </Link>
        </div>
      </section>
    </div>
  );
}

function Policy({ term, def }: { term: string; def: string }) {
  return (
    <div className="border-t border-border pt-5">
      <dt className="eyebrow text-muted-foreground">{term}</dt>
      <dd className="mt-2 text-ink-soft">{def}</dd>
    </div>
  );
}