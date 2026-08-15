import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, MapPin, ArrowLeft, ArrowRight, CircleCheck, Sparkles, MessageSquare, Printer, ShieldCheck, Clock, Layers } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { services, serviceCategories, type Service, servicePricingData } from "@/data/services";
import { site, timeSlots } from "@/data/site";
import { haversineKm, loadGoogleMaps, mapsBrowserKey } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { getStoredOrders, type AdminOrder, getStoredCMS } from "@/lib/admin-store";

export type BookingDraft = {
  serviceSlugs: string[];
  itemQuantities: Record<string, number>;
  logistics: "pickup-delivery" | "drop-off";
  date: string;
  slot: string;
  isExpress: boolean;
  address: string;
  pincode: string;
  coords: { lat: number; lng: number } | null;
  distanceKm: number | null;
  notes: string;
  name: string;
  phone: string;
  email: string;
  customerType: "residential" | "commercial";
  coupon?: string;
  paymentStatus?: "pending" | "paid";
};

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits and + - ( )"),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Enter a valid email address",
    }),
});

type Errs = {
  services?: string;
  date?: string;
  slot?: string;
  address?: string;
  radius?: string;
  name?: string;
  phone?: string;
  email?: string;
};

function getServiceStartingPrice(s: Service): string {
  const prices = s.prices && s.prices.length > 0 ? s.prices : (servicePricingData[s.slug] || []);
  if (prices.length > 0) {
    const firstItem = prices[0];
    if (firstItem) {
      const priceKeys = Object.keys(firstItem.prices);
      if (priceKeys.length > 0) {
        const firstPriceKey = priceKeys[0];
        if (firstPriceKey) {
          const priceValue = firstItem.prices[firstPriceKey];
          return `₹${priceValue} (${firstPriceKey})`;
        }
      }
    }
  }
  return "Quote on Intake";
}

const steps = ["Services", "Logistics", "Schedule", "Address", "Details", "Review"] as const;

const popularPincodes = [
  { area: "Konanakunte", code: "560062" },
  { area: "JP Nagar", code: "560078" },
  { area: "Jayanagar", code: "560041" },
  { area: "Banashankari", code: "560085" },
  { area: "BTM Layout", code: "560076" },
  { area: "Bannerghatta Rd", code: "560083" },
];

function todayISO(offset = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function BookingFlow({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [draft, setDraft] = useState<BookingDraft>({
    serviceSlugs: initialService ? [initialService] : [],
    itemQuantities: initialService ? { [initialService]: 1 } : {},
    logistics: "pickup-delivery",
    date: todayISO(1),
    slot: timeSlots[1],
    isExpress: false,
    address: "",
    pincode: "",
    coords: null,
    distanceKm: null,
    notes: "",
    name: "",
    phone: "",
    email: "",
    customerType: "residential",
  });
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState<Errs>({});
  const addressRef = useRef<HTMLInputElement>(null);

  const inRadius =
    draft.distanceKm === null ? null : draft.distanceKm <= site.pickupRadiusKm;

  const existingBookings = useMemo(() => {
    if (typeof window === "undefined") return [];
    return getStoredOrders();
  }, [step, draft.date]);

  const cmsData = useMemo(() => {
    if (typeof window === "undefined") return { services: [] };
    return getStoredCMS();
  }, []);

  const activeServices = useMemo(() => {
    return cmsData.services && cmsData.services.length > 0 ? cmsData.services : services;
  }, [cmsData.services]);

  const selected = useMemo(
    () => activeServices.filter((s) => draft.serviceSlugs.includes(s.slug)),
    [draft.serviceSlugs, activeServices],
  );

  const filteredServices = useMemo(() => {
    if (selectedCategory === "All") return activeServices;
    return activeServices.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, activeServices]);

  // Reset selected slot to first available slot if it becomes invalid (past or booked)
  useEffect(() => {
    if (!draft.date) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    const currentHour = now.getHours();

    const isCurrentSlotInvalid = () => {
      if (!draft.slot) return true;
      const startHour = parseInt(draft.slot.split(":")[0] || "0", 10);
      const isPast = draft.date < todayStr || (draft.date === todayStr && currentHour >= startHour);
      
      const slotBookings = existingBookings.filter(
        (o) => o.date === draft.date && o.slot === draft.slot && o.status !== "Cancelled"
      );
      const isBooked = slotBookings.length >= 2;
      
      return isPast || isBooked;
    };

    if (isCurrentSlotInvalid()) {
      const firstAvailable = timeSlots.find((slot) => {
        const startHour = parseInt(slot.split(":")[0] || "0", 10);
        const isPast = draft.date < todayStr || (draft.date === todayStr && currentHour >= startHour);
        const slotBookings = existingBookings.filter(
          (o) => o.date === draft.date && o.slot === slot && o.status !== "Cancelled"
        );
        const isBooked = slotBookings.length >= 2;
        return !isPast && !isBooked;
      });
      setDraft((d) => ({ ...d, slot: firstAvailable || "" }));
    }
  }, [draft.date, existingBookings]);

  useEffect(() => {
    if (step !== 3 || !mapsBrowserKey) return;
    let cancelled = false;
    void loadGoogleMaps().then((g) => {
      if (cancelled || !g || !addressRef.current) return;
      const places = (g as { maps?: { places?: Record<string, unknown> } }).maps?.places as
        | { Autocomplete: new (el: HTMLInputElement, o: unknown) => AcInstance }
        | undefined;
      if (!places) return;
      const ac = new places.Autocomplete(addressRef.current, {
        fields: ["formatted_address", "geometry"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const loc = place.geometry?.location;
        if (!loc) return;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        setDraft((d) => ({
          ...d,
          address: place.formatted_address ?? d.address,
          coords,
          distanceKm: haversineKm(site.coords, coords),
        }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [step]);

  async function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Location feature is not supported by your browser.");
      return;
    }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const km = haversineKm(site.coords, coords);

        let fetchedAddress = "";
        let fetchedPincode = "";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              fetchedAddress = data.display_name;
              fetchedPincode = data.address?.postcode || "";
            }
          }
        } catch {
          // fallback if network fails
        }

        setDraft((d) => ({
          ...d,
          coords,
          distanceKm: km,
          address: fetchedAddress || d.address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (GPS Location)`,
          pincode: fetchedPincode || d.pincode || "560062",
        }));

        setChecking(false);
        toast.success(`Device GPS Location & Address Auto-Filled! (${km.toFixed(1)} km from studio)`);
      },
      () => {
        setChecking(false);
        toast.error("Could not capture GPS location. Please type your street address manually.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function toggleService(slug: string) {
    setDraft((d) => {
      const exists = d.serviceSlugs.includes(slug);
      const newSlugs = exists
        ? d.serviceSlugs.filter((s) => s !== slug)
        : [...d.serviceSlugs, slug];
      const newQty = { ...d.itemQuantities };
      if (!exists) {
        newQty[slug] = 1;
      } else {
        delete newQty[slug];
      }
      return { ...d, serviceSlugs: newSlugs, itemQuantities: newQty };
    });
  }

  function updateQty(slug: string, delta: number) {
    setDraft((d) => {
      const current = d.itemQuantities[slug] || 1;
      const nextVal = Math.max(1, current + delta);
      return {
        ...d,
        itemQuantities: { ...d.itemQuantities, [slug]: nextVal },
      };
    });
  }

  function validateStep(): boolean {
    const e: Errs = {};
    if (step === 0 && draft.serviceSlugs.length === 0) e.services = "Select at least one fabric care service";
    if (step === 2) {
      if (!draft.date) e.date = "Choose a date for collection";
      if (!draft.slot) e.slot = "Choose a time slot";
    }
    if (step === 3 && draft.logistics === "pickup-delivery") {
      if (draft.address.trim().length < 8) e.address = "Enter your full pickup address";
      if (inRadius === false)
        e.radius = `That address is ${draft.distanceKm?.toFixed(1)} km away, outside our ${site.pickupRadiusKm} km pickup radius. Switch to studio drop-off or request a commercial route.`;
    }
    if (step === 4) {
      const parsed = contactSchema.safeParse(draft);
      if (!parsed.success) {
        for (const issue of parsed.error.issues)
          e[String(issue.path[0]) as keyof Errs] = issue.message;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    const reference = `SD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      const key = "spinanddry.bookings";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      localStorage.setItem(
        key,
        JSON.stringify([...prev, { reference, createdAt: new Date().toISOString(), ...draft }]),
      );
    } catch {
      /* storage fallback */
    }
    setConfirmed(reference);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (confirmed) {
    const whatsappMsg = `Hello Spin & Dry! I just completed booking reference ${confirmed} for ${selected.map((s) => s.name).join(", ")} on ${draft.date} (${draft.slot}).`;
    const whatsappLink = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="mx-auto max-w-3xl border border-border bg-card p-6 md:p-12 shadow-lift printable-receipt">
        {/* Print-Only Studio Header (Visible only when printing) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">{site.name}</h1>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{site.tagline}</p>
              <p className="mt-1 text-xs text-slate-600 max-w-md">{site.address}</p>
              <p className="text-xs text-slate-600">Phone: {site.phone} · Email: {site.email} · GST: 29AAAAA0000A1Z5</p>
            </div>
            <div className="text-right">
              <span className="rounded bg-slate-950 px-3 py-1 font-mono text-sm font-bold text-white uppercase">
                #{confirmed}
              </span>
              <p className="mt-2 text-xs font-bold text-emerald-700 uppercase">Booking Confirmed ✓</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Web View Banner Header */}
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex size-12 items-center justify-center rounded-full bg-brass/20 text-brass">
            <CircleCheck className="size-6" />
          </div>
          <div>
            <span className="eyebrow text-brass">Booking Confirmed</span>
            <h2 className="font-display text-4xl text-foreground">Order Ref: #{confirmed}</h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft print:hidden">
          Thank you, <span className="font-semibold text-foreground">{draft.name}</span>. Our concierge team has registered your request. We will call <span className="font-semibold text-foreground">{draft.phone}</span> to confirm your two-hour pickup window.
        </p>

        {/* Printable Official Receipt Summary Box */}
        <div className="mt-8 rounded-none border border-border bg-background p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-display text-xl text-foreground font-bold">Official Digital Order Receipt</h3>
              <span className="text-xs text-muted-foreground">Order Reference: #{confirmed}</span>
            </div>
            <span className="eyebrow text-brass font-bold bg-brass/10 px-3 py-1 rounded-none">Inspection &amp; Quote Pending</span>
          </div>

          <dl className="grid gap-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-muted-foreground">Customer Name</dt>
              <dd className="mt-1 font-bold text-sm text-foreground">{draft.name}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Phone Number</dt>
              <dd className="mt-1 font-bold text-sm text-foreground">{draft.phone}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Scheduled Collection Slot</dt>
              <dd className="mt-1 font-semibold text-foreground">{draft.date} · {draft.slot}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Logistics Mode</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {draft.logistics === "pickup-delivery" ? "Doorstep Collection & Return (Free Zone)" : "Studio Drop-off"}
              </dd>
            </div>
            {draft.logistics === "pickup-delivery" && (
              <div className="sm:col-span-2">
                <dt className="eyebrow text-muted-foreground">Doorstep Pickup Address</dt>
                <dd className="mt-1 font-medium text-foreground leading-relaxed">{draft.address}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow text-muted-foreground">Processing Speed</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {draft.isExpress ? "24-Hour Express Priority" : "48-Hour Standard Fabric Care"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Customer Account Type</dt>
              <dd className="mt-1 font-semibold text-foreground capitalize">
                {draft.customerType === "residential" ? "Residential Household" : "Commercial Account"}
              </dd>
            </div>
          </dl>

          {/* Itemized Services Table */}
          <div className="mt-6 border-t border-border pt-4">
            <span className="eyebrow text-muted-foreground block mb-2">Registered Care Services</span>
            <table className="w-full text-left text-xs border border-border">
              <thead className="bg-muted font-bold text-foreground uppercase">
                <tr>
                  <th className="p-2.5 border-b border-border">Service Name</th>
                  <th className="p-2.5 border-b border-border text-center">Category</th>
                  <th className="p-2.5 border-b border-border text-center">Estimated Rate</th>
                  <th className="p-2.5 border-b border-border text-center">Estimated Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {selected.map((s) => {
                  const rate = getServiceStartingPrice(s);
                  return (
                    <tr key={s.slug}>
                      <td className="p-2.5 font-bold">{s.name}</td>
                      <td className="p-2.5 text-center text-muted-foreground">{s.category}</td>
                      <td className="p-2.5 text-center font-semibold text-brass">{rate}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{draft.itemQuantities[s.slug] || 1}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {draft.notes && (
            <div className="border-t border-border pt-4 text-xs">
              <span className="eyebrow text-muted-foreground block mb-1">Client Special Access / Fabric Notes</span>
              <p className="text-foreground italic">{draft.notes}</p>
            </div>
          )}

          <div className="border-t border-dashed border-border pt-4 text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Spin &amp; Dry Guarantee: Zero dimensional shrinkage · Eco-solvent technology</span>
            <span className="font-mono text-brass font-bold">Studio Status: Intake Registered</span>
          </div>
        </div>

        {/* Live Status Timeline (Hidden when printing) */}
        <div className="mt-8 print:hidden">
          <h4 className="eyebrow mb-4 text-brass">Order Status Timeline</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded bg-brass/20 p-2.5 font-semibold text-brass border border-brass/40">
              1. Booked ✓
            </div>
            <div className="rounded bg-muted p-2.5 text-muted-foreground">
              2. Pickup &amp; Tag
            </div>
            <div className="rounded bg-muted p-2.5 text-muted-foreground">
              3. Studio Care
            </div>
            <div className="rounded bg-muted p-2.5 text-muted-foreground">
              4. Return
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="mt-10 flex flex-wrap items-center gap-3 print:hidden">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] text-white uppercase hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageSquare className="size-4" /> Instant WhatsApp Confirmation
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border border-ink bg-ink text-background px-6 py-3.5 text-xs font-bold tracking-[0.14em] uppercase hover:bg-brass hover:text-ink transition-colors shadow-sm"
          >
            <Printer className="size-4" /> Print Clean Receipt Summary
          </button>
          <a
            href={`/track?ref=${confirmed}`}
            className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase hover:border-ink transition-colors"
          >
            <MapPin className="size-4 text-brass" /> Track Order Live
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Step Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow text-brass">Concierge Booking Engine</span>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>

        <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {steps.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex flex-col items-center gap-1 border p-2.5 text-center text-xs transition-all",
                i === step
                  ? "border-brass bg-brass/10 font-bold text-ink"
                  : i < step
                  ? "border-brass/40 bg-brass-soft/30 text-brass font-medium"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                {i < step ? <Check className="size-3 text-brass" /> : <span className="font-mono">{i + 1}</span>}
                <span className="truncate">{label}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="py-10">
        {step === 0 && (
          <Step
            title="What fabrics require care?"
            hint="Select one or more fabric services below. You can adjust exact item counts now or at pickup."
          >
            {/* Category Filter Pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {["All", ...serviceCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded px-3.5 py-1.5 text-xs font-semibold transition-all",
                    selectedCategory === cat
                      ? "bg-ink text-background shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-border",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredServices.map((s) => {
                const active = draft.serviceSlugs.includes(s.slug);
                const qty = draft.itemQuantities[s.slug] || 1;

                return (
                  <div
                    key={s.slug}
                    className={cn(
                      "flex flex-col justify-between border p-4 transition-all",
                      active
                        ? "border-brass bg-brass-soft/20 text-ink shadow-sm"
                        : "border-border bg-card hover:border-border/80",
                    )}
                  >
                    <div
                      onClick={() => toggleService(s.slug)}
                      className="cursor-pointer flex items-start justify-between gap-4"
                    >
                      <div>
                        <span className="block text-sm font-semibold">{s.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {s.category} · {s.turnaround}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-brass">
                          Starting rate: {getServiceStartingPrice(s)}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center border rounded",
                          active ? "border-brass bg-brass text-ink" : "border-border",
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                    </div>

                    {active && (
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="text-xs font-medium text-ink-soft">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(s.slug, -1)}
                            className="flex size-7 items-center justify-center rounded border border-border bg-background font-bold text-xs hover:bg-muted"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(s.slug, 1)}
                            className="flex size-7 items-center justify-center rounded border border-border bg-background font-bold text-xs hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <FieldError message={errors.services} />
          </Step>
        )}

        {step === 1 && (
          <Step title="How should we collect?" hint="Free doorstep collection & return within 10 km of our Konanakunte studio.">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "pickup-delivery",
                  title: "Doorstep Pickup & Delivery",
                  badge: "Most Popular · Free <10 km",
                  body: "Our uniformed team counts, tags and photographs every item with you at your doorstep. We return it packed in breathable covers.",
                },
                {
                  id: "drop-off",
                  title: "Studio Direct Drop-off",
                  badge: "No Distance Restriction",
                  body: "Drop your items directly at our Konanakunte studio during operational hours. Accessible to all clients across the city.",
                },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, logistics: o.id as any }))}
                  className={cn(
                    "border p-6 text-left transition-all relative",
                    draft.logistics === o.id
                      ? "border-brass bg-brass-soft/20 text-ink shadow-sm"
                      : "border-border bg-card hover:border-border/80",
                  )}
                >
                  <span className="eyebrow text-brass block mb-1">{o.badge}</span>
                  <span className="font-display text-2xl">{o.title}</span>
                  <span className="mt-2 block text-sm text-ink-soft leading-relaxed">{o.body}</span>
                </button>
              ))}
            </div>

            <fieldset className="mt-8">
              <legend className="eyebrow text-muted-foreground">Account Type</legend>
              <div className="mt-3 flex gap-3">
                {[
                  { id: "residential", label: "Residential / Household" },
                  { id: "commercial", label: "Commercial / Hotel / Office Account" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, customerType: t.id as any }))}
                    className={cn(
                      "border px-5 py-3 text-xs font-semibold uppercase tracking-wider",
                      draft.customerType === t.id ? "border-ink bg-ink text-background" : "border-border bg-card text-ink",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </Step>
        )}

        {step === 2 && (
          <Step title="Pick a collection date and slot" hint="Choose a two-hour window for our concierge team to arrive.">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Preferred Pickup Date</span>
                  <input
                    type="date"
                    min={todayISO(0)}
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="mt-2 w-full border border-input bg-card px-4 py-3.5 text-sm font-medium focus:border-ink focus:outline-none"
                  />
                </label>
                <FieldError message={errors.date} />
              </div>

              {/* Express Toggle Box */}
              <div className="rounded border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-brass" />
                    <span className="font-semibold text-sm">24-Hour Express Priority</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, isExpress: !d.isExpress }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                      draft.isExpress ? "bg-brass" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        draft.isExpress ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  Priority processing with guaranteed 24-hour return (+25% express fee).
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="eyebrow text-muted-foreground mb-3">Two-Hour Collection Slots</p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {timeSlots.map((slot) => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  const day = String(now.getDate()).padStart(2, "0");
                  const todayStr = `${year}-${month}-${day}`;
                  const currentHour = now.getHours();

                  const startHour = parseInt(slot.split(":")[0] || "0", 10);
                  const isPast = draft.date < todayStr || (draft.date === todayStr && currentHour >= startHour);

                  const slotBookings = existingBookings.filter(
                    (o) => o.date === draft.date && o.slot === slot && o.status !== "Cancelled"
                  );
                  const isBooked = slotBookings.length >= 2;

                  if (isBooked) {
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled
                        className="border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed p-4 text-sm flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="line-through">{slot}</span>
                        <span className="text-[10px] font-sans font-bold text-rose-500 uppercase tracking-wider">Fully Booked</span>
                      </button>
                    );
                  }

                  if (isPast) {
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled
                        className="border border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed p-4 text-sm flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>{slot}</span>
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Unavailable</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, slot }))}
                      className={cn(
                        "border p-4 text-sm transition-all flex items-center justify-between",
                        draft.slot === slot
                          ? "border-brass bg-brass text-ink font-bold shadow-sm"
                          : "border-border bg-card hover:border-brass/35 text-ink",
                      )}
                    >
                      <span>{slot}</span>
                      {draft.slot === slot && <Check className="size-4 text-ink" />}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.slot} />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step
            title={draft.logistics === "pickup-delivery" ? "Where should we collect?" : "Confirm Drop-off Note"}
            hint={
              draft.logistics === "pickup-delivery"
                ? `Enter your Bengaluru address. Free collection applies within a ${site.pickupRadiusKm} km radius.`
                : "No address required for direct studio drop-off. Add special instructions if applicable."
            }
          >
            {draft.logistics === "pickup-delivery" && (
              <>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Full Street Address</span>
                  <input
                    ref={addressRef}
                    type="text"
                    autoComplete="street-address"
                    maxLength={220}
                    placeholder="Villa / Flat No., Building Name, Street, Area, Landmark"
                    value={draft.address}
                    onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                    className="mt-2 w-full border border-input bg-card px-4 py-3.5 text-sm focus:border-ink focus:outline-none"
                  />
                </label>
                <FieldError message={errors.address} />

                {/* Popular Pincode Suggestions */}
                <div className="mt-4">
                  <span className="eyebrow text-muted-foreground">Popular Bengaluru Coverage Hubs:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {popularPincodes.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          const newAddr = draft.address ? `${draft.address}, ${p.area} ${p.code}` : `${p.area}, Bengaluru ${p.code}`;
                          setDraft((d) => ({ ...d, address: newAddr, pincode: p.code }));
                        }}
                        className="rounded-none border border-border bg-card px-3 py-1 text-xs hover:border-brass hover:bg-brass-soft/20"
                      >
                        + {p.area} ({p.code})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prominent 1-Click GPS Auto-Fill Card */}
                <div className="mt-6 rounded-none border border-brass/50 bg-brass/10 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                      <MapPin className="size-5 text-brass shrink-0" />
                      <span>GPS Device Auto-Fill &amp; Doorstep Verification</span>
                    </div>
                    <button
                      type="button"
                      onClick={useMyLocation}
                      disabled={checking}
                      className="inline-flex items-center justify-center gap-2 rounded-none bg-brass px-4 py-2.5 text-xs font-bold text-ink uppercase tracking-wider shadow-gold hover:bg-brass/90 transition-all disabled:opacity-50"
                    >
                      {checking ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                      1-Click Auto-Fill Address
                    </button>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Clicking 1-Click Auto-Fill will request your device's precise location, automatically reverse geocode your full street address &amp; pincode, and calculate doorstep pickup distance.
                  </p>

                  {draft.coords && (
                    <div className="rounded-none border border-border bg-card p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-brass uppercase">GPS Coordinates Captured:</span>{" "}
                        <code className="font-mono font-semibold">{draft.coords.lat.toFixed(5)}, {draft.coords.lng.toFixed(5)}</code>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${draft.coords.lat},${draft.coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brass underline hover:text-foreground"
                      >
                        View Precise Location on Google Maps ↗
                      </a>
                    </div>
                  )}
                </div>

                {draft.distanceKm !== null && (
                  <div
                    className={cn(
                      "mt-4 rounded-none border p-5 text-sm shadow-sm",
                      inRadius ? "border-brass/60 bg-brass-soft/30" : "border-destructive/40 bg-card",
                    )}
                  >
                    <p className="font-semibold text-base flex items-center gap-2">
                      <MapPin className="size-4 text-brass" />
                      {draft.distanceKm.toFixed(1)} km from Spin &amp; Dry Studio (Konanakunte)
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {inRadius
                        ? "✓ Verified inside the 10 km free doorstep pickup & return zone!"
                        : `Address is outside our ${site.pickupRadiusKm} km standard pickup radius. Studio drop-off remains open, or contact us for commercial route expansion.`}
                    </p>
                  </div>
                )}
                <FieldError message={errors.radius} />
              </>
            )}

            <label className="mt-8 block">
              <span className="eyebrow text-muted-foreground">Fabric &amp; Access Notes (Optional)</span>
              <textarea
                rows={4}
                maxLength={600}
                placeholder="E.g., Drapes hanging at 12 ft, stain on sofa corner, gate entry code, handle with extra care..."
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                className="mt-2 w-full border border-input bg-card px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </label>
          </Step>
        )}

        {step === 4 && (
          <Step title="Contact Details" hint="Used exclusively for order confirmation and delivery notifications.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={draft.name}
                onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Phone Number"
                value={draft.phone}
                onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                error={errors.phone}
                autoComplete="tel"
                type="tel"
              />
              <Field
                label="Email Address (Optional)"
                value={draft.email}
                onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                error={errors.email}
                autoComplete="email"
                type="email"
                className="sm:col-span-2"
              />
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Review &amp; Confirm" hint="Zero upfront charge. Final itemized quote is issued after physical intake inspection.">
            <dl className="grid gap-6 border-y border-border py-8 sm:grid-cols-2">
              <Detail
                label="Care Services"
                value={selected.map((s) => `${s.name} (x${draft.itemQuantities[s.slug] || 1})`).join(", ")}
              />
              <Detail
                label="Logistics Mode"
                value={draft.logistics === "pickup-delivery" ? "Doorstep Pickup & Delivery" : "Studio Drop-off"}
              />
              <Detail label="Collection Date" value={draft.date} />
              <Detail label="Time Slot" value={draft.slot} />
              {draft.logistics === "pickup-delivery" && (
                <Detail
                  label="Pickup Address"
                  value={`${draft.address}${draft.distanceKm !== null ? ` (${draft.distanceKm.toFixed(1)} km from studio)` : ""}`}
                />
              )}
              <Detail label="Turnaround Mode" value={draft.isExpress ? "⚡ 24-Hour Express Care" : "48-Hour Standard Care"} />
              <Detail label="Contact" value={`${draft.name} · ${draft.phone} · ${draft.email}`} />
              {draft.notes && <Detail label="Notes" value={draft.notes} />}
            </dl>

            <div className="mt-6 flex items-start gap-3 rounded bg-brass-soft/30 p-4 border border-brass/40">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brass" />
              <div className="text-xs leading-relaxed text-ink">
                <p className="font-semibold">Zero Risk Quote Guarantee</p>
                <p className="mt-0.5 text-ink-soft">
                  Payment is collected on delivery by UPI, Card, or Net Banking. You approve the final quote after physical inspection before any cleaning begins.
                </p>
              </div>
            </div>
          </Step>
        )}
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase disabled:opacity-30 hover:text-brass transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 bg-ink px-8 py-4 text-xs font-bold tracking-[0.16em] text-background uppercase transition-transform hover:-translate-y-0.5"
          >
            Continue <ArrowRight className="size-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-2 bg-brass px-8 py-4 text-xs font-bold tracking-[0.16em] text-ink uppercase shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Confirm Booking <Check className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

type AcInstance = {
  addListener: (event: string, cb: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
};

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl text-foreground">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">{hint}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={160}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-input bg-card px-4 py-3.5 text-sm focus:border-ink focus:outline-none"
      />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-semibold text-destructive">{message}</p>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}