import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { useSiteSettings, getStudioStatus } from "@/lib/use-site-settings";
import { CalendarX } from "lucide-react";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book a Pickup — Spin & Dry Fabric Care" },
      {
        name: "description",
        content:
          "Book professional fabric care in six steps: choose services, pick a date and two-hour slot, confirm your address inside the 10 km pickup radius and review your booking.",
      },
      { property: "og:title", content: "Book a Pickup — Spin & Dry" },
      {
        property: "og:description",
        content:
          "Free pickup and delivery within 10 km. Select services, choose a slot and confirm in under two minutes.",
      },
      { property: "og:url", content: "/book" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

function BookPage() {
  const site = useSiteSettings();
  const { service } = useSearch({ from: "/book" });
  const status = getStudioStatus(site);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-10 md:py-24">
      <p className="eyebrow text-brass">Booking</p>
      <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">
        Book a collection
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft">
        Six short steps. Free pickup and delivery within {site.pickupRadiusKm} km of the studio, and
        a confirmed quote after inspection — before anything is cleaned.
      </p>
      <div className="mt-14">
        {status.isOpen ? (
          <BookingFlow {...(service ? { initialService: service } : {})} />
        ) : (
          <div className="rounded-none border border-rose-300 bg-rose-50/30 p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
            <div className="inline-flex size-12 items-center justify-center bg-rose-100 border border-rose-200 text-rose-600 rounded-none mb-2">
              <CalendarX className="size-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Bookings Suspended</h2>
            <p className="text-sm text-slate-650 leading-relaxed">
              Our online booking portal is currently closed. We are either outside operating hours, or have paused intakes due to high volume.
            </p>
            <div className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-4 py-2.5 inline-block rounded-none font-mono">
              Status: {status.label}
            </div>
            <p className="text-sm text-slate-800 font-bold pt-2">
              Need immediate support? Contact our Care Concierge via phone at{" "}
              <a href={site.phoneHref} className="text-brass underline hover:text-brass-soft">
                {site.phone}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}