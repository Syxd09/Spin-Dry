import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { site } from "@/data/site";
import { haversineKm, mapsBrowserKey } from "@/lib/geo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coverage")({
  head: () => ({
    meta: [
      { title: "Pickup & Delivery Coverage — 10 km Radius | Spin & Dry" },
      {
        name: "description",
        content:
          "Spin & Dry offers free fabric care pickup and delivery within a 10 km radius of the studio. Check your location, get directions, or request service outside the radius.",
      },
      { property: "og:title", content: "Pickup & Delivery Coverage | Spin & Dry" },
      {
        property: "og:description",
        content:
          "Free pickup and delivery within 10 km. Check your distance from the studio instantly.",
      },
      { property: "og:url", content: "/coverage" },
    ],
    links: [{ rel: "canonical", href: "/coverage" }],
  }),
  component: CoveragePage,
});

const directions = `https://www.google.com/maps/dir/?api=1&destination=${site.coords.lat},${site.coords.lng}`;

function CoveragePage() {
  const [distance, setDistance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function check() {
    if (!("geolocation" in navigator)) {
      setError("Location is not available in this browser. Call us and we will confirm.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDistance(
          haversineKm(site.coords, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
        );
        setBusy(false);
      },
      () => {
        setBusy(false);
        setError("We could not read your location. Enter your address during booking instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const inRadius = distance !== null && distance <= site.pickupRadiusKm;

  return (
    <div>
      <header className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow text-brass">Coverage</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-7xl">
              Free pickup &amp; delivery inside {site.pickupRadiusKm} km
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Collection and delivery are free for every address within a {site.pickupRadiusKm} km
              radius of the studio, in two-hour slots, seven days a week. Outside that radius you
              can drop off at the studio or contact us for a consultation, special request or
              commercial route.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={check}
                className="inline-flex items-center gap-2 bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <MapPin className="size-3.5" aria-hidden />
                )}
                Check my distance
              </button>
              <a
                href={directions}
                target="_blank"
                rel="noreferrer noopener"
                className="border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
              >
                Get directions
              </a>
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {distance !== null && (
              <div
                className={cn(
                  "mt-6 border p-6",
                  inRadius ? "border-brass bg-brass-soft/40" : "border-border bg-card",
                )}
              >
                <p className="font-display text-3xl">{distance.toFixed(1)} km away</p>
                <p className="mt-2 text-sm text-ink-soft">
                  {inRadius
                    ? "You are inside the free pickup and delivery radius."
                    : `You are outside the ${site.pickupRadiusKm} km radius. Studio drop-off and consultations are still available, and commercial routes can extend further.`}
                </p>
                <Link
                  to={inRadius ? "/book" : "/contact"}
                  className="mt-5 inline-block bg-ink px-5 py-3 text-xs font-semibold tracking-[0.16em] text-background uppercase"
                >
                  {inRadius ? "Book a pickup" : "Request consultation"}
                </Link>
              </div>
            )}
          </div>

          <div className="border border-border bg-card">
            {mapsBrowserKey ? (
              <iframe
                title="Spin & Dry studio location"
                loading="lazy"
                className="aspect-square w-full"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/view?key=${mapsBrowserKey}&center=${site.coords.lat},${site.coords.lng}&zoom=12`}
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center p-10">
                <div className="relative flex size-full items-center justify-center">
                  <span className="absolute size-[86%] rounded-full border border-dashed border-brass" />
                  <span className="absolute size-[58%] rounded-full border border-border" />
                  <span className="absolute size-[30%] rounded-full border border-border" />
                  <span className="relative z-10 flex flex-col items-center text-center">
                    <MapPin className="size-6 text-brass" aria-hidden />
                    <span className="eyebrow mt-3">Studio</span>
                    <span className="mt-1 font-display text-3xl">
                      {site.pickupRadiusKm} km radius
                    </span>
                  </span>
                </div>
              </div>
            )}
            <div className="border-t border-border p-6">
              <p className="eyebrow text-muted-foreground">Studio address</p>
              <address className="mt-2 text-sm not-italic text-ink-soft">{site.address}</address>
            </div>
          </div>
        </div>
      </header>

      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-px bg-border md:grid-cols-3">
          {[
            {
              t: "Inside the radius",
              b: `Free doorstep pickup and delivery, two-hour slots, take-down and re-hanging for curtains and sofa covers, and recurring collection schedules for households and businesses.`,
            },
            {
              t: "Outside the radius",
              b: "Studio drop-off is open to everyone. For consultations, special requests, bulk household orders or one-off deep cleaning, contact us and we will arrange it.",
            },
            {
              t: "Commercial routes",
              b: "Hotels, restaurants, offices and property managers can be serviced beyond 10 km under a contracted route with agreed collection times.",
            },
          ].map((c) => (
            <div key={c.t} className="bg-background p-9">
              <h2 className="font-display text-2xl">{c.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}