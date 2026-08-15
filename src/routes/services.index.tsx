import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, Sparkles, ShieldCheck, Check } from "lucide-react";
import { services, serviceCategories } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Fabric Care Services — Curtains, Carpets & Luxury Linen | Spin & Dry" },
      {
        name: "description",
        content:
          "Explore 16 specialist fabric care services: curtain & drape cleaning, hand-knotted rug restoration, silk sarees, goose down quilts, sofa covers & hotel commercial linen.",
      },
      { property: "og:title", content: "Fabric Care Services — Spin & Dry" },
      {
        property: "og:description",
        content:
          "Professional fabric care for household and commercial textiles in Bengaluru, with free pickup and delivery within 10 km.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

const serviceCoverImages: Record<string, string> = {
  "curtains-and-drapes": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  "carpets-and-area-rugs": "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=600&q=80",
  "sofa-and-cushion-covers": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "leather-restoration": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  "comforters-and-duvets": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "pillow-cleaning-and-sanitisation": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  "blankets-and-quilts": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
  "hotel-bed-linen": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "spa-and-salon-towels": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
};

const categoryCovers: Record<string, string> = {
  "Home Fabrics": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  "Bedding & Linen": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "Upholstery": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "Commercial": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
};

function ServicesIndex() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = services.filter((s) => {
    const matchesCat = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.summary.toLowerCase().includes(query.toLowerCase()) ||
      s.materials.some((m) => m.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <header className="border-b border-border bg-ink px-5 py-8 text-background md:px-10 md:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brass" />
            <span className="eyebrow text-brass">Master Catalog</span>
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
            Sixteen fabric programmes, one uncompromising standard
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-background/80 leading-relaxed">
            Each fabric construction requires its own inspection protocol, wash chemistry, temperature curve and finishing technique. Explore our specialist care programmes below.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-background/50" />
              <input
                type="text"
                placeholder="Search by fabric, material (silk, wool, velvet)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded border border-background/20 bg-background/10 py-3.5 pl-11 pr-4 text-sm text-background placeholder:text-background/50 focus:border-brass focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", ...serviceCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
                    activeCategory === cat
                      ? "bg-brass text-ink font-bold shadow-md"
                      : "bg-background/10 text-background/80 hover:bg-background/20",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Services Grid */}
      <section className="border-b border-border px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[88rem]">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="font-display text-3xl">No fabric services match your query</h3>
              <p className="mt-2 text-ink-soft">Try searching for wool, silk, curtains, or reset your category filter.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 inline-block bg-ink px-6 py-3 text-xs font-semibold text-background uppercase"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <ul className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s, i) => (
                <Reveal as="li" key={s.slug} delay={i * 40} className="bg-background">
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="group flex h-full flex-col justify-between p-8 transition-colors hover:bg-card border-b border-r border-border"
                  >
                    <div>
                      {/* Service Card Cover Photo */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 mb-6">
                        <img
                          src={s.image || serviceCoverImages[s.slug] || categoryCovers[s.category] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"}
                          alt={s.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="eyebrow text-brass">{s.category}</span>
                        <ArrowUpRight
                          className="size-4 shrink-0 text-brass transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </div>
                      <h2 className="mt-3 font-display text-3xl group-hover:text-brass transition-colors">
                        {s.name}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.summary}</p>
                    </div>

                    <div className="mt-8 border-t border-border/60 pt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">{s.turnaround}</span>
                      <span className="font-bold text-ink uppercase tracking-wider group-hover:text-brass">
                        Explore Programme →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-8 border border-border bg-card p-10 md:flex-row md:items-center md:p-14 shadow-lift">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-brass" />
              <span className="eyebrow text-brass">Fabric Specialist Advice</span>
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Unsure which programme fits your fabric?</h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              Tell our technicians your fabric composition, stain history, or concerns. We provide honest assessments before any work begins.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/book"
              className="bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase shadow-sm"
            >
              Book a Pickup
            </Link>
            <Link
              to="/contact"
              className="border border-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] uppercase hover:bg-ink hover:text-background transition-colors"
            >
              Ask a Technician
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}