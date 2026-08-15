import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, Search, ArrowRight, Clock } from "lucide-react";
import { site as staticSite } from "@/data/site";
import { useSiteSettings } from "@/lib/use-site-settings";
import { haversineKm, mapsBrowserKey } from "@/lib/geo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coverage")({
  head: () => ({
    meta: [
      { title: "Pickup & Delivery Coverage — 10 km Radius | Spin & Dry Bengaluru" },
      {
        name: "description",
        content:
          "Spin & Dry offers free fabric care pickup and delivery within a 10 km radius of our Konanakunte studio. Check your Bengaluru area or pincode instantly.",
      },
      { property: "og:title", content: "Pickup & Delivery Coverage | Spin & Dry" },
      {
        property: "og:description",
        content:
          "Free doorstep collection & delivery within 10 km. Check your distance or pincode instantly.",
      },
      { property: "og:url", content: "/coverage" },
    ],
    links: [{ rel: "canonical", href: "/coverage" }],
  }),
  component: CoveragePage,
});

const coverageZones = [
  { area: "Konanakunte & Narayana Nagar (Studio Hub)", pincode: "560062", status: "Free Doorstep Route", window: "2-Hour Express Slot" },
  { area: "JP Nagar (Phase 1 to 9)", pincode: "560078", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Jayanagar", pincode: "560041", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Banashankari", pincode: "560085", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Kumaraswamy Layout", pincode: "560078", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "BTM Layout", pincode: "560076", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Bannerghatta Road & Gottigere", pincode: "560083", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Arekere & Hulimavu", pincode: "560076", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
  { area: "Basavanagudi", pincode: "560004", status: "Free Doorstep Route", window: "Daily 8:00 - 20:00" },
];

// static coords never change (studio location is fixed)
const directions = `https://www.google.com/maps/dir/?api=1&destination=${staticSite.coords.lat},${staticSite.coords.lng}`;

function CoveragePage() {
  const site = useSiteSettings();
  const [distance, setDistance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pincodeQuery, setPincodeQuery] = useState("");

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
          haversineKm(staticSite.coords, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  const filteredZones = coverageZones.filter(
    (z) =>
      z.area.toLowerCase().includes(pincodeQuery.toLowerCase()) ||
      z.pincode.includes(pincodeQuery),
  );

  const inRadius = distance !== null && distance <= site.pickupRadiusKm;

  return (
    <div>
      {/* Header */}
      <header className="border-b border-border bg-background px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto grid max-w-[88rem] gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="eyebrow text-brass">Doorstep Logistics</span>
            <h1 className="mt-3 font-display text-4xl leading-[0.95] md:text-6xl">
              Free collection inside {site.pickupRadiusKm} km
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-soft leading-relaxed">
              Collection and delivery are 100% free for every address within a {site.pickupRadiusKm} km radius of our Konanakunte studio. We operate in two-hour slots, seven days a week.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={check}
                className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-background uppercase shadow-sm hover:bg-ink-soft transition-colors"
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <MapPin className="size-3.5 text-brass" />
                )}
                Verify Distance via GPS
              </button>
              <a
                href={directions}
                target="_blank"
                rel="noreferrer noopener"
                className="border border-ink px-6 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase hover:bg-ink hover:text-background transition-colors"
              >
                Get Directions to Studio
              </a>
            </div>

            {error && <p className="mt-3 text-sm text-destructive font-medium">{error}</p>}

            {distance !== null && (
              <div
                className={cn(
                  "mt-5 rounded border p-5 shadow-sm transition-all",
                  inRadius ? "border-brass bg-brass-soft/30" : "border-border bg-card",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-2xl text-foreground">{distance.toFixed(1)} km away</p>
                  <span className={cn("eyebrow rounded px-3 py-1", inRadius ? "bg-brass text-ink font-bold" : "bg-muted text-muted-foreground")}>
                    {inRadius ? "Free Pickup Eligible" : "Outside Standard Radius"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {inRadius
                    ? "✓ You are inside the free doorstep pickup and return radius! Select your slot to book."
                    : `Address is outside the ${site.pickupRadiusKm} km radius. Studio drop-off is open to everyone, and commercial routes can extend further.`}
                </p>
                <Link
                  to={inRadius ? "/book" : "/contact"}
                  className="mt-4 inline-flex items-center gap-2 bg-ink px-5 py-3 text-xs font-bold tracking-[0.16em] text-background uppercase"
                >
                  {inRadius ? "Book Pickup Now" : "Request Consultation"} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Location Map View */}
          <div className="border border-border bg-card shadow-lift overflow-hidden rounded">
            <iframe
              title="Spin & Dry studio location"
              loading="lazy"
              className="h-[320px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?cid=2576506162805989971&hl=en&ie=UTF8&iwloc=&output=embed"
            />
            <div className="border-t border-border p-5 bg-card">
              <p className="eyebrow text-brass">Studio Hub Address</p>
              <address className="mt-1 text-sm not-italic text-foreground font-medium">{site.address}</address>
              <p className="mt-0.5 text-xs text-muted-foreground">Hours: Mon - Sat 8:00 AM - 8:00 PM · Sun 8:00 AM - 1:00 PM</p>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Pincode Search Section */}
      <section className="border-b border-border bg-card px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8">
            <div>
              <span className="eyebrow text-brass">Coverage Hub Directory</span>
              <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
                Check your neighborhood or pincode
              </h2>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search neighborhood or pincode (e.g. 560062)..."
                value={pincodeQuery}
                onChange={(e) => setPincodeQuery(e.target.value)}
                className="w-full rounded border border-input bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredZones.map((z) => (
              <div key={z.area} className="glass-card p-5 rounded border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-brass">PIN {z.pincode}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="size-3" /> {z.status}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-foreground">{z.area}</h3>
                  <p className="mt-1.5 text-xs text-ink-soft flex items-center gap-1.5">
                    <Clock className="size-3 text-brass" /> Service Windows: {z.window}
                  </p>
                </div>

                <Link
                  to="/book"
                  className="mt-5 inline-flex items-center justify-between border-t border-border/60 pt-3 text-xs font-bold uppercase tracking-wider text-ink hover:text-brass transition-colors"
                >
                  <span>Book Pickup for {z.pincode}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistic Protocols */}
      <section className="px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-[88rem] gap-px bg-border md:grid-cols-3">
          {[
            {
              t: "Inside the 10 km Radius",
              b: "Free doorstep pickup and return in two-hour slots. Take-down and re-hanging available for curtains and sofa covers. Recurring collection schedules available for households.",
            },
            {
              t: "Outside the 10 km Radius",
              b: "Studio drop-off is open to everyone. For bulk household items, heirloom restorations or deep cleaning, contact us to arrange custom pickup logistics.",
            },
            {
              t: "Commercial & Hotel Routes",
              b: "Hotels, restaurants, corporate offices and property managers can be serviced beyond 10 km under contracted route schedules with volume pricing.",
            },
          ].map((c) => (
            <div key={c.t} className="bg-background p-7">
              <h2 className="font-display text-2xl text-foreground">{c.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}