import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getService, services, type Service } from "@/data/services";
import { site } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import linenStack from "@/assets/linen-stack.jpg";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Service not found — Spin & Dry" }, { name: "robots", content: "noindex" }],
      };
    }
    const s = loaderData.service;
    const title = `${s.name} — Professional Fabric Care | Spin & Dry`;
    return {
      meta: [
        { title },
        { name: "description", content: s.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: s.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/services/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                name: s.name,
                serviceType: s.name,
                description: s.summary,
                provider: { "@type": "LocalBusiness", name: "Spin & Dry" },
                areaServed: {
                  "@type": "GeoCircle",
                  geoMidpoint: {
                    "@type": "GeoCoordinates",
                    latitude: site.coords.lat,
                    longitude: site.coords.lng,
                  },
                  geoRadius: "10000",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: s.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ServicePage,
  notFoundComponent: ServiceNotFound,
});

function ServiceNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="font-display text-4xl">That service does not exist</h1>
      <p className="mt-4 text-ink-soft">Browse the full list of fabric care programmes instead.</p>
      <Link
        to="/services"
        className="mt-8 inline-block bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
      >
        All services
      </Link>
    </div>
  );
}

function ServicePage() {
  const { service: s } = Route.useLoaderData() as { service: Service };
  const related = services.filter((r) => r.category === s.category && r.slug !== s.slug).slice(0, 3);

  return (
    <article>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <nav aria-label="Breadcrumb" className="eyebrow text-muted-foreground">
              <Link to="/services" className="hover:text-foreground">
                Services
              </Link>
              <span className="mx-2 text-brass">/</span>
              <span>{s.category}</span>
            </nav>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] md:text-7xl">{s.name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{s.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/book"
                search={{ service: s.slug }}
                className="bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase transition-colors hover:bg-ink-soft"
              >
                Book {s.name.toLowerCase()}
              </Link>
              <Link
                to="/contact"
                className="border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
              >
                Ask about my fabric
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-border">
            <Fact label="Turnaround" value={s.turnaround} />
            <Fact label="Category" value={s.category} />
            <Fact label="Pickup radius" value={`${site.pickupRadiusKm} km, free`} />
            <Fact label="Quote" value="After inspection" />
          </dl>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl">What the service includes</h2>
            <ul className="mt-8 grid gap-3">
              {s.includes.map((item) => (
                <li key={item} className="flex gap-3 border-b border-border pb-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display text-3xl md:text-4xl">Suitable materials</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {s.materials.map((m) => (
                <li key={m} className="border border-border bg-card px-4 py-2.5 text-sm">
                  {m}
                </li>
              ))}
            </ul>
            <h3 className="mt-12 font-display text-2xl">Benefits</h3>
            <ul className="mt-5 grid gap-2.5 text-sm text-ink-soft">
              {s.benefits.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 bg-brass" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-ink px-5 py-16 text-background md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Cleaning process</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl md:text-5xl">
            How {s.name.toLowerCase()} runs at the studio
          </h2>
          <ol className="mt-14 grid gap-px bg-background/15 md:grid-cols-2 xl:grid-cols-4">
            {s.process.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80} className="bg-ink p-8">
                <span className="font-display text-4xl text-brass">0{i + 1}</span>
                <h3 className="mt-5 font-display text-2xl text-background">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow text-brass">FAQ</p>
            <h2 className="mt-4 font-display text-4xl">{s.name} questions</h2>
            <img
              src={linenStack}
              alt={`Freshly cleaned linen prepared after ${s.name.toLowerCase()} at the Spin & Dry studio`}
              width={1200}
              height={1200}
              loading="lazy"
              className="mt-10 hidden aspect-square w-full object-cover lg:block"
            />
          </div>
          <Accordion type="single" collapsible className="w-full">
            {s.faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
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

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <div className="flex flex-col items-start justify-between gap-8 border border-border bg-card p-10 md:flex-row md:items-center md:p-14">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">
                Ready to book {s.name.toLowerCase()}?
              </h2>
              <p className="mt-3 max-w-xl text-ink-soft">
                Choose a date and a two-hour slot. We validate your address against the{" "}
                {site.pickupRadiusKm} km pickup radius before you confirm.
              </p>
            </div>
            <Link
              to="/book"
              search={{ service: s.slug }}
              className="bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Book pickup
            </Link>
          </div>

          {related.length > 0 && (
            <>
              <h2 className="mt-20 font-display text-3xl">Related {s.category.toLowerCase()} care</h2>
              <ul className="mt-8 grid gap-px bg-border md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug} className="bg-background">
                    <Link
                      to="/services/$slug"
                      params={{ slug: r.slug }}
                      className="block h-full p-8 transition-colors hover:bg-card"
                    >
                      <h3 className="font-display text-2xl">{r.name}</h3>
                      <p className="mt-3 text-sm text-ink-soft">{r.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-6">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-2xl">{value}</dd>
    </div>
  );
}