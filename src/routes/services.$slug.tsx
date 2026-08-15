import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { getService, services, type Service, servicePricingData } from "@/data/services";
import { site } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import { getStoredCMS } from "@/lib/admin-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import linenStack from "@/assets/linen-stack.jpg";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const cms = getStoredCMS();
    const service = cms.services.find((s) => s.slug === params.slug) || getService(params.slug);
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

const serviceCoverFallbackImages: Record<string, string> = {
  // Real active slugs
  "curtain-cleaning": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "carpet-cleaning": "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=1200&q=80",
  "blanket-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=80",
  "sofa-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
  "bedsheet-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  "comforter-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  "duvet-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  "pillow-cleaning": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
  "cushion-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
  "quilt-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=80",
  "table-linen-cleaning": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "home-linen-cleaning": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "commercial-linen-cleaning": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "hotel-linen-cleaning": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "office-fabric-care": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  "general-laundry": "https://images.unsplash.com/photo-1545173168-9f19472c043a?auto=format&fit=crop&w=1200&q=80",

  // Legacy mappings for backward compatibility
  "curtains-and-drapes": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "carpets-and-area-rugs": "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=1200&q=80",
  "sofa-and-cushion-covers": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
  "leather-restoration": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  "comforters-and-duvets": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  "pillow-cleaning-and-sanitisation": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
  "blankets-and-quilts": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=80",
  "hotel-bed-linen": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "spa-and-salon-towels": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
};

const categoryCoverFallbackImages: Record<string, string> = {
  "Home Fabrics": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "Bedding & Linen": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  "Upholstery": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
  "Commercial": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
};




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
  
  // Ensure we always have exactly 3 related cards to fill the layout columns
  const related = services.filter((r) => r.category === s.category && r.slug !== s.slug);
  const displayRelated = related.length >= 3 
    ? related.slice(0, 3) 
    : [...related, ...services.filter((r) => r.slug !== s.slug && r.category !== s.category)].slice(0, 3);

  const pricingItems = s.prices && s.prices.length > 0 ? s.prices : (servicePricingData[s.slug] || []);
  const uniquePriceHeaders = Array.from(
    new Set(pricingItems.flatMap((item) => Object.keys(item.prices)))
  );

  return (
    <article>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24 bg-card/10">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.25fr_0.85fr_0.9fr] lg:items-center">
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

          {/* Service Cover Photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-border shadow-lift">
            <img
              src={s.image || serviceCoverFallbackImages[s.slug] || categoryCoverFallbackImages[s.category] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"}
              alt={s.name}
              className="h-full w-full object-cover"
            />
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

      {/* Standard pricing catalog directory */}
      {pricingItems.length > 0 && (
        <section className="border-b border-border bg-background px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-[88rem]">
            <span className="eyebrow text-brass">Standard Pricing Directory</span>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Fabric care investment catalogue
            </h2>
            <p className="mt-2 text-xs md:text-sm text-ink-soft max-w-xl">
              All prices listed below represent our base standard rates (starting from, exclusive of GST) and may vary depending on material condition, sizing, and specific details.
            </p>
            <div className="mt-10 overflow-x-auto border border-border rounded-xl shadow-lift bg-card/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-card text-foreground border-b border-border font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 md:p-5">Item Type</th>
                    {uniquePriceHeaders.map((hdr) => (
                      <th key={hdr} className="p-4 md:p-5 text-center">{hdr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {pricingItems.map((item) => (
                    <tr key={item.name} className="hover:bg-card/20 transition-colors">
                      <td className="p-4 md:p-5 font-bold text-foreground">{item.name}</td>
                      {uniquePriceHeaders.map((hdr) => (
                        <td key={hdr} className="p-4 md:p-5 text-center font-mono font-bold text-ink">
                          {item.prices[hdr] && item.prices[hdr] !== "-" ? `₹${item.prices[hdr]}` : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground italic font-semibold text-right">
              * Note: All prices shown above are starting rates exclusive of GST.
            </p>
          </div>
        </section>
      )}

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
              src={s.image || serviceCoverFallbackImages[s.slug] || categoryCoverFallbackImages[s.category] || linenStack}
              alt={`Freshly cleaned linen prepared after ${s.name.toLowerCase()} at the Spin & Dry studio`}
              width={1200}
              height={1200}
              loading="lazy"
              className="mt-10 hidden aspect-square w-full object-cover lg:block rounded-xl"
            />
          </div>
          <div className="flex flex-col justify-between h-full gap-8">
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
            
            <div className="border border-brass/25 bg-brass/5 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:border-brass/45">
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900">Have a specific fabric concern?</h4>
                <p className="text-xs text-ink-soft mt-1">Speak directly with our studio conservators for specialized advice.</p>
              </div>
              <Link
                to="/contact"
                className="bg-ink px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-background uppercase shrink-0 transition-colors hover:bg-ink-soft"
              >
                Contact Studio
              </Link>
            </div>
          </div>
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

          {displayRelated.length > 0 && (
            <>
              <h2 className="mt-20 font-display text-3xl">Related care services</h2>
              <ul className="mt-8 grid gap-px bg-border md:grid-cols-3">
                {displayRelated.map((r) => (
                  <li key={r.slug} className="bg-background overflow-hidden">
                    <Link
                      to="/services/$slug"
                      params={{ slug: r.slug }}
                      className="group block h-full p-8 border border-transparent hover:border-brass/35 hover:-translate-y-1 hover:bg-card shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-2xl group-hover:text-brass transition-colors duration-300">{r.name}</h3>
                          <ArrowUpRight className="size-5 text-brass/40 group-hover:text-brass group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
                        </div>
                        <p className="mt-3 text-sm text-ink-soft line-clamp-3 leading-relaxed">{r.summary}</p>
                      </div>
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