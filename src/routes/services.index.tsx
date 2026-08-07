import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { services, serviceCategories } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Fabric Care Services — Curtains, Carpets & Linen | Spin & Dry" },
      {
        name: "description",
        content:
          "16 professional fabric care services: curtain, carpet, blanket, sofa cover, bedsheet, comforter, duvet, pillow, cushion, quilt, table linen, home linen, commercial and hotel linen cleaning.",
      },
      { property: "og:title", content: "Fabric Care Services — Spin & Dry" },
      {
        property: "og:description",
        content:
          "Professional cleaning for household and commercial fabrics, with free pickup and delivery within 10 km.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <div>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Services</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">
            Sixteen fabric programmes, one standard of care
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">
            Each fabric type gets its own inspection criteria, wash chemistry, drying profile and
            finishing method. Choose a service to see exactly what is included, which materials we
            handle and how the process runs.
          </p>
        </div>
      </header>

      {serviceCategories.map((cat) => {
        const list = services.filter((s) => s.category === cat);
        return (
          <section key={cat} className="border-b border-border px-5 py-14 md:px-10 md:py-20">
            <div className="mx-auto max-w-[88rem]">
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="font-display text-3xl md:text-4xl">{cat}</h2>
                <span className="eyebrow text-muted-foreground">{list.length} services</span>
              </div>
              <ul className="mt-10 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
                {list.map((s, i) => (
                  <Reveal as="li" key={s.slug} delay={i * 60} className="bg-background">
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="group flex h-full flex-col justify-between gap-8 p-8 transition-colors hover:bg-card"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-2xl">{s.name}</h3>
                          <ArrowUpRight
                            className="mt-1 size-4 shrink-0 text-brass transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.summary}</p>
                      </div>
                      <span className="eyebrow text-muted-foreground">{s.turnaround}</span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-8 border border-border bg-card p-10 md:flex-row md:items-center md:p-14">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Not sure which service you need?</h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              Tell us the fabric and we will tell you the right programme — or say plainly if
              cleaning will not fix it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/book"
              className="bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Book a pickup
            </Link>
            <Link
              to="/contact"
              className="border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}