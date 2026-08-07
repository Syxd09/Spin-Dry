import { createFileRoute, Link } from "@tanstack/react-router";
import { generalFaqs } from "@/data/site";
import { services } from "@/data/services";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Spin & Dry Fabric Care" },
      {
        name: "description",
        content:
          "Answers on pickup coverage, turnaround times, pricing, payment, cleaning methods and commercial contracts at Spin & Dry fabric care studio.",
      },
      { property: "og:title", content: "Frequently Asked Questions | Spin & Dry" },
      {
        property: "og:description",
        content:
          "Coverage, turnaround, pricing, payment and commercial service questions answered plainly.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: generalFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[88rem] gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow text-brass">FAQ</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">
            Questions, answered without the marketing
          </h1>
          <p className="mt-6 text-ink-soft">
            Still unsure about your fabric? Send us a photo and we will tell you what is possible.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-block border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
          >
            Contact the studio
          </Link>
        </div>
        <div>
          <Accordion type="single" collapsible className="w-full">
            {generalFaqs.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${i}`}>
                <AccordionTrigger className="text-left font-display text-xl hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ink-soft">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <h2 className="mt-16 font-display text-3xl">Service-specific questions</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="link-underline text-sm text-ink-soft"
                >
                  {s.name} FAQ
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}