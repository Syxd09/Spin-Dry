import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Star, Award, CheckCircle, Clock, MapPin } from "lucide-react";
import { services } from "@/data/services";
import { generalFaqs, journey, site, testimonials } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import { InstantQuoteCalculator } from "@/components/site/InstantQuoteCalculator";
import { FabricRestorationShowcase } from "@/components/site/FabricRestorationShowcase";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { getStoredCMS } from "@/lib/admin-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroFabric from "@/assets/hero-fabric.jpg";
import linenStack from "@/assets/linen-stack.jpg";

const serviceFallbackImages: Record<string, string> = {
  "curtain-cleaning": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  "carpet-cleaning": "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=600&q=80",
  "blanket-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
  "sofa-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "bedsheet-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "comforter-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "duvet-cleaning": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  "pillow-cleaning": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  "cushion-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "quilt-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
  "table-linen-cleaning": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "home-linen-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "commercial-linen-cleaning": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "hotel-linen-cleaning": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "office-fabric-care": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  "general-laundry": "https://images.unsplash.com/photo-1545173168-9f19472c043a?auto=format&fit=crop&w=600&q=80",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spin & Dry — Professional Fabric Care & Luxury Laundry Studio | Bengaluru" },
      {
        name: "description",
        content:
          "Bespoke fabric care for drapes, hand-knotted rugs, silk sarees, quilts, sofa covers & hotel linen. Free doorstep pickup & re-fit within 10 km.",
      },
      { property: "og:title", content: "Spin & Dry — Professional Fabric Care & Luxury Laundry Studio" },
      {
        property: "og:description",
        content:
          "Precision fabric restoration, zero-shrinkage drape cleaning, eco-solvent technology & free doorstep pickup in Bengaluru.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const capabilities = [
  {
    t: "Fabric-Specific Programmes",
    b: "Wool, velvet, organic silk, blackout linings and hotel cotton each run on their own calibrated chemistry, temperature and drying profile.",
    icon: Sparkles,
  },
  {
    t: "Measured, Never Guessed",
    b: "Curtains and sofa covers are measured before processing and dried back to that exact dimension, so nothing shrinks out of fit.",
    icon: ShieldCheck,
  },
  {
    t: "Two-Stage Quality Assurance",
    b: "Graded and photographed at intake, then checked piece by piece under studio lighting before breathable packaging.",
    icon: Award,
  },
  {
    t: "Approved Quotes Only",
    b: "You receive a confirmed itemized quote after studio inspection. Processing begins only when you give your explicit approval.",
    icon: CheckCircle,
  },
];

const badges = [
  "100% Eco-Solvent Certified",
  "Zero Dimensional Shrinkage",
  "Free Doorstep Pickup (10 km)",
  "Ozone Anti-Allergen Sanitised",
];

function HeroImageSlider({ slides }: { slides: string[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0 size-full overflow-hidden bg-ink">
      {slides.map((src, idx) => {
        const isActive = idx === currentIdx;
        return (
          <img
            key={src + idx}
            src={src}
            alt={`Luxury fabric care visual slider ${idx + 1}`}
            loading={idx === 0 ? "eager" : "lazy"}
            className="absolute inset-0 size-full object-cover"
            style={{
              opacity: isActive ? 0.55 : 0,
              transform: isActive ? "scale(1.08) translate(1%, 0.5%)" : "scale(1.01) translate(0px, 0px)",
              transition: "opacity 1200ms ease-in-out, transform 6000ms linear",
            }}
          />
        );
      })}
    </div>
  );
}

function Index() {
  const cmsData = useMemo(() => getStoredCMS(), []);
  const galleryItems = cmsData.beforeAfterGallery || [];
  const displayServices = cmsData.services || services;
  const heroSlides = cmsData.heroSlides || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative -mt-20 min-h-[90svh] overflow-hidden bg-ink pt-24 text-background">
        <HeroImageSlider slides={heroSlides} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/40 to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(90svh-6rem)] max-w-[88rem] flex-col justify-between gap-10 px-5 py-10 md:px-10 md:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brass opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-brass"></span>
              </span>
              <span className="eyebrow text-brass">Bespoke Fabric Care Studio · Since {site.founded}</span>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.92] text-background">
              The fabrics you live with deserve more than a wash cycle
            </h1>

            <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-background/85">
              Spin &amp; Dry delivers specialist restoration and cleaning for floor-to-ceiling drapes, hand-knotted rugs, silk heirlooms, down duvets and luxury linen. Free pickup and doorstep re-fit within {site.pickupRadiusKm} km of our Konanakunte studio.
            </p>

            {/* Badges Row */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {badges.map((b) => (
                <span key={b} className="flex items-center gap-1.5 rounded border border-background/20 bg-background/5 px-3 py-1 text-xs text-background/80 backdrop-blur-sm">
                   <CheckCircle className="size-3 text-brass" /> {b}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/book"
                className="group inline-flex items-center gap-2.5 bg-brass px-7 py-3.5 text-xs font-bold tracking-[0.16em] text-ink uppercase transition-transform hover:-translate-y-0.5 shadow-gold"
              >
                Book a pickup <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                to="/services"
                className="border border-background/40 px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors hover:border-brass hover:text-brass"
              >
                Explore 16 Services
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <dl className="grid gap-px border-t border-background/20 sm:grid-cols-2 lg:grid-cols-4">
            {site.stats.map((s) => (
              <div key={s.label} className="pt-5 transition-colors hover:bg-background/5 p-3 rounded">
                <dt className="font-display text-3xl text-brass">{s.value}</dt>
                <dd className="mt-1 text-xs tracking-wide text-background/70 uppercase">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Positioning & Capabilities */}
      <section className="border-b border-border px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="eyebrow text-brass">Our Distinction</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">
              A specialized fabric care studio, not a generic laundry
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              We specialize in high-value textiles that conventional laundries routinely ruin: full-height blackout drapes, hand-knotted silk rugs, filled goose-down duvets, tailored leather &amp; sofa covers, heirloom sarees and high-volume hotel linen.
            </p>
            <div className="mt-6 rounded border border-border bg-card p-5">
              <h3 className="font-display text-xl text-ink">Zero Shrinkage Guarantee</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Every curtain panel and sofa cover is laser-measured at intake and finished to exact dimensions before packing.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((c) => (
                <li key={c.t} className="glass-card p-6 rounded border border-border/80">
                  <c.icon className="size-5 text-brass" />
                  <h3 className="mt-3 font-display text-xl text-foreground">{c.t}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{c.b}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Interactive Before & After Slider Section */}
      <BeforeAfterSlider items={galleryItems} />

      {/* Interactive Price Estimator */}
      <section className="border-b border-border bg-background px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto max-w-[88rem]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow text-brass">Transparent Pricing</span>
            <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
              Instant quote estimator
            </h2>
            <p className="mt-2 text-xs md:text-sm text-ink-soft">
              Calculate your exact fabric care investment in seconds. All pickup and delivery within 10 km is 100% free.
            </p>
          </div>
          <InstantQuoteCalculator />
        </div>
      </section>

      {/* Services Ledger */}
      <section className="border-b border-border px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto max-w-[88rem]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-brass">Tailored Catalog</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
                Sixteen fabric programmes, built for perfection
              </h2>
            </div>
            <Link
              to="/services"
              className="link-underline inline-flex items-center gap-2 text-sm font-semibold"
            >
              View all 16 services <ArrowUpRight className="size-4 text-brass" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 space-y-1.5">
            {displayServices.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={Math.min(i * 20, 150)}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group flex flex-col justify-between border-t border-border/70 py-4 px-3 transition-all duration-300 hover:bg-card hover:border-brass/40 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="eyebrow text-brass/80 font-mono w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="size-16 md:size-20 shrink-0 overflow-hidden rounded bg-slate-100 border border-border/70 shadow-xs relative">
                      <img
                        src={s.image || serviceFallbackImages[s.slug] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=150&q=80"}
                        alt={s.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <span className="font-display text-2xl md:text-3xl transition-colors group-hover:text-brass">
                        {s.name}
                      </span>
                      <p className="mt-1 text-xs text-ink-soft max-w-xl">{s.summary}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-6 md:mt-0">
                    <div className="text-right">
                      <span className="eyebrow block text-muted-foreground">{s.turnaround}</span>
                      <span className="text-xs font-semibold text-brass">View Protocol</span>
                    </div>
                    <ArrowUpRight
                      className="size-4 text-brass transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Studies Showcase */}
      <FabricRestorationShowcase />

      {/* The Journey */}
      <section className="border-b border-border bg-ink px-5 py-10 text-background md:px-10 md:py-16">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">The Process</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
            Booking to delivery, zero room for error
          </h2>

          <ol className="mt-10 grid gap-px bg-background/15 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((j, i) => (
              <Reveal as="li" key={j.step} delay={i * 50} className="bg-ink p-6 transition-colors hover:bg-background/5">
                <span className="font-display text-3xl text-brass">{j.step}</span>
                <h3 className="mt-3 font-display text-xl text-background">{j.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-background/70">{j.body}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-10 flex items-center justify-between border-t border-background/20 pt-6">
            <Link
              to="/process"
              className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-brass-soft"
            >
              Read full process &amp; quality policies <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <span className="hidden sm:inline-block text-xs text-background/60">
              * Curtains taken down &amp; re-fitted on request
            </span>
          </div>
        </div>
      </section>

      {/* Coverage & Distance */}
      <section className="grid border-b border-border lg:grid-cols-2">
        <div className="px-5 py-10 md:px-12 md:py-16">
          <p className="eyebrow text-brass">Doorstep Logistics</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
            Free collection within {site.pickupRadiusKm} km of our studio
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            Choose a date and a two-hour slot. Your address is validated against the {site.pickupRadiusKm} km radius while you book, giving you instant confirmation.
          </p>

          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Two-hour collection and delivery windows, seven days a week",
              "Items counted, tagged and photographed with you present",
              "Curtains taken down and re-hung; sofa covers refitted on site",
              "Serving Konanakunte, JP Nagar, Jayanagar, Banashankari & BTM Layout hubs",
            ].map((l) => (
              <li key={l} className="flex gap-2.5 border-b border-border pb-2.5 text-xs md:text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 bg-brass" aria-hidden />
                <span>{l}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/coverage"
              className="bg-ink px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Check My Coverage
            </Link>
            <Link
              to="/contact"
              className="border border-ink px-6 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Outside 10 km? Talk to Us
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-card border-l border-border min-h-[320px]">
          <img
            src={linenStack}
            alt="Neatly folded freshly cleaned white linen and towels"
            width={1200}
            height={1200}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded bg-background/90 p-5 backdrop-blur-md border border-border/80">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brass" />
              <span className="eyebrow text-brass">Studio Hub Location</span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-foreground">{site.address}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Studio hours: Mon - Sat 8:00 AM - 8:00 PM · Sun 8:00 AM - 1:00 PM</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto max-w-[88rem]">
          <p className="eyebrow text-brass">Client Testimonials</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
            Trusted by Bengaluru's finest residences &amp; boutiques
          </h2>

          <ul className="mt-10 grid gap-px bg-border md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 50} className="bg-background p-7">
                <div className="flex items-center gap-1 text-brass mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 fill-brass text-brass" />
                  ))}
                </div>
                <blockquote className="font-display text-xl md:text-2xl leading-snug text-foreground">“{t.quote}”</blockquote>
                <p className="eyebrow mt-4 text-muted-foreground">
                  {t.name} — <span className="text-foreground">{t.role}</span>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="eyebrow text-brass">Frequent Questions</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              Everything you need to know before booking
            </h2>
            <p className="mt-3 text-xs md:text-sm text-ink-soft">
              Have a specific fabric question? Contact our care specialists anytime.
            </p>
            <Link
              to="/faq"
              className="link-underline mt-6 inline-flex items-center gap-2 text-sm font-semibold"
            >
              All FAQs <ArrowUpRight className="size-4 text-brass" aria-hidden />
            </Link>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {generalFaqs.slice(0, 5).map((f, i) => (
              <AccordionItem key={f.q} value={`home-${i}`}>
                <AccordionTrigger className="text-left font-display text-lg md:text-xl hover:no-underline py-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm leading-relaxed text-ink-soft pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-5 py-10 md:px-10 md:py-16">
        <div className="mx-auto max-w-[88rem] border border-border bg-card p-8 md:p-12 shadow-lift">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-brass">Concierge Booking</span>
          </div>
          <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight md:text-5xl">
            Book your fabric collection in under two minutes
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            Select your services, pick a date &amp; slot. We handle collection, inspection, care chemistry and doorstep delivery.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-2.5 bg-ink px-7 py-3.5 text-xs font-bold tracking-[0.16em] text-background uppercase transition-transform hover:-translate-y-0.5 shadow-sm"
            >
              Book a pickup <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href={site.phoneHref}
              className="border border-ink px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-ink hover:text-background"
            >
              Call Studio ({site.phone})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
