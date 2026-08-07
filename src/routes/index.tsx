import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { generalFaqs, journey, site, testimonials } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroFabric from "@/assets/hero-fabric.jpg";
import linenStack from "@/assets/linen-stack.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spin & Dry — Professional Fabric Care & Laundry Studio" },
      {
        name: "description",
        content:
          "Professional fabric care for curtains, carpets, blankets, upholstery, bedding and commercial linen. Free pickup and delivery within 10 km. Book a collection in under two minutes.",
      },
      { property: "og:title", content: "Spin & Dry — Professional Fabric Care & Laundry Studio" },
      {
        property: "og:description",
        content:
          "Curtains, carpets, bedding, upholstery and hotel linen cared for by trained technicians on professional equipment. Free pickup and delivery within 10 km.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const capabilities = [
  {
    t: "Fabric-specific programmes",
    b: "Wool, velvet, silk blends, blackout linings and hotel cotton each run on their own chemistry, temperature and drying profile.",
  },
  {
    t: "Measured, not guessed",
    b: "Curtains and sofa covers are measured before processing and dried back to that exact size, so nothing shrinks out of fit.",
  },
  {
    t: "Two-stage quality control",
    b: "Graded and photographed at intake, then checked piece by piece against the manifest before packing.",
  },
  {
    t: "Approved quotes only",
    b: "You see the confirmed quote after inspection. Nothing is cleaned until you approve it.",
  },
];

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative -mt-20 min-h-[92svh] overflow-hidden bg-ink pt-20 text-background">
        <img
          src={heroFabric}
          alt="Close-up of layered linen and cotton fabric in warm light"
          width={1600}
          height={1200}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
        <div className="relative mx-auto flex min-h-[calc(92svh-5rem)] max-w-[88rem] flex-col justify-between gap-16 px-5 py-16 md:px-10 md:py-20">
          <div>
            <p className="eyebrow text-brass">Professional fabric care studio · since {site.founded}</p>
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(2.9rem,7.5vw,6.5rem)] leading-[0.92]">
              The fabrics you live with deserve more than a wash cycle
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-background/80">
              Spin &amp; Dry cleans curtains, carpets, bedding, upholstery and commercial linen on
              professional equipment, with trained technicians and a documented process. Free pickup
              and delivery within {site.pickupRadiusKm} km.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 bg-brass px-7 py-4 text-xs font-semibold tracking-[0.16em] text-ink uppercase transition-transform hover:-translate-y-0.5"
              >
                Book a pickup <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <Link
                to="/services"
                className="border border-background/40 px-7 py-4 text-xs font-semibold tracking-[0.16em] uppercase transition-colors hover:border-background"
              >
                Explore 16 services
              </Link>
            </div>
          </div>

          <dl className="grid gap-px border-t border-background/20 sm:grid-cols-2 lg:grid-cols-4">
            {site.stats.map((s) => (
              <div key={s.label} className="pt-7">
                <dt className="font-display text-4xl text-brass">{s.value}</dt>
                <dd className="mt-2 text-xs tracking-wide text-background/65">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Positioning */}
      <section className="border-b border-border px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow text-brass">What we are</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              A fabric care studio, not a neighbourhood laundry
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-ink-soft">
              We specialise in the textiles that generic laundries damage: full-height drapes,
              hand-knotted rugs, wool blankets, filled duvets, tailored sofa covers, heirloom
              quilts and high-volume hotel linen. Every item is identified, graded and matched to a
              programme built for its construction — then measured, dried and finished under
              controlled conditions.
            </p>
            <ul className="mt-10 grid gap-px bg-border sm:grid-cols-2">
              {capabilities.map((c) => (
                <li key={c.t} className="bg-background py-6 sm:px-1">
                  <h3 className="font-display text-2xl">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.b}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Services ledger */}
      <section className="border-b border-border px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[88rem]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-brass">Services</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                Sixteen fabric programmes, each with its own page
              </h2>
            </div>
            <Link
              to="/services"
              className="link-underline inline-flex items-center gap-2 text-sm font-semibold"
            >
              View all services <ArrowUpRight className="size-4 text-brass" aria-hidden />
            </Link>
          </div>

          <ul className="mt-14">
            {services.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={Math.min(i * 30, 240)}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group grid items-baseline gap-2 border-t border-border py-6 transition-colors hover:bg-card md:grid-cols-[4rem_1fr_1.3fr_9rem] md:gap-8"
                >
                  <span className="eyebrow text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-3xl transition-colors group-hover:text-brass">
                    {s.name}
                  </span>
                  <span className="text-sm text-ink-soft">{s.summary}</span>
                  <span className="eyebrow flex items-center justify-between gap-2 text-muted-foreground">
                    {s.turnaround}
                    <ArrowUpRight
                      className="size-4 text-brass opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Journey */}
      <section className="border-b border-border bg-ink px-5 py-20 text-background md:px-10 md:py-28">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">The journey</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Booking to delivery, with nothing left to chance
          </h2>
          <ol className="mt-16 grid gap-px bg-background/15 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((j, i) => (
              <Reveal as="li" key={j.step} delay={i * 70} className="bg-ink p-8">
                <span className="font-display text-4xl text-brass">{j.step}</span>
                <h3 className="mt-5 font-display text-2xl">{j.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">{j.body}</p>
              </Reveal>
            ))}
          </ol>
          <Link
            to="/process"
            className="link-underline mt-14 inline-flex items-center gap-2 text-sm font-semibold text-brass-soft"
          >
            Read the full process and policies <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Coverage */}
      <section className="grid border-b border-border lg:grid-cols-2">
        <div className="px-5 py-20 md:px-14 md:py-28">
          <p className="eyebrow text-brass">Pickup &amp; delivery</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Free collection within {site.pickupRadiusKm} km of the studio
          </h2>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Choose a date and a two-hour slot. Your address is validated against the{" "}
            {site.pickupRadiusKm} km radius while you book, so you know instantly whether doorstep
            collection applies. Outside the radius, studio drop-off and consultations remain open to
            everyone, and commercial routes can extend further.
          </p>
          <ul className="mt-10 grid gap-3 text-sm">
            {[
              "Two-hour collection and delivery windows, seven days a week",
              "Items counted, tagged and photographed with you present",
              "Curtains taken down and re-hung; sofa covers refitted",
              "Recurring weekly and fortnightly household schedules",
            ].map((l) => (
              <li key={l} className="flex gap-3 border-b border-border pb-3">
                <span className="mt-2 size-1.5 shrink-0 bg-brass" aria-hidden />
                {l}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/coverage"
              className="bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Check my coverage
            </Link>
            <Link
              to="/contact"
              className="border border-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Outside 10 km? Talk to us
            </Link>
          </div>
        </div>
        <img
          src={linenStack}
          alt="Neatly folded freshly cleaned white linen and towels"
          width={1200}
          height={1200}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </section>

      {/* Testimonials */}
      <section className="border-b border-border px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Trusted by</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Homes, hotels and offices that cannot afford a ruined fabric
          </h2>
          <ul className="mt-14 grid gap-px bg-border md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 60} className="bg-background p-9">
                <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <p className="eyebrow mt-6 text-muted-foreground">
                  {t.name} — {t.role}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-brass">Questions</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              The things people ask first
            </h2>
            <Link
              to="/faq"
              className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-semibold"
            >
              All FAQs <ArrowUpRight className="size-4 text-brass" aria-hidden />
            </Link>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {generalFaqs.slice(0, 4).map((f, i) => (
              <AccordionItem key={f.q} value={`home-${i}`}>
                <AccordionTrigger className="text-left font-display text-xl hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ink-soft">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[88rem] border border-border bg-card p-10 md:p-16">
          <p className="eyebrow text-brass">Next step</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Book a collection in under two minutes
          </h2>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Select your services, pick a slot, confirm your address. We handle the rest — and you
            approve the quote before anything is cleaned.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Book a pickup <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <a
              href={site.phoneHref}
              className="border border-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Call {site.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
