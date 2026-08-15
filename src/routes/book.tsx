import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { useSiteSettings } from "@/lib/use-site-settings";

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
        <BookingFlow {...(service ? { initialService: service } : {})} />
      </div>
    </div>
  );
}