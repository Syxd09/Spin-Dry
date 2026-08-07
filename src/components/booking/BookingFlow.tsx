import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, MapPin, ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { services } from "@/data/services";
import { site, timeSlots } from "@/data/site";
import { haversineKm, loadGoogleMaps, mapsBrowserKey } from "@/lib/geo";
import { cn } from "@/lib/utils";

/**
 * Booking draft shape. Kept as one serialisable object so it can be POSTed to a
 * server function / bookings table and extended with payment fields later.
 */
export type BookingDraft = {
  serviceSlugs: string[];
  logistics: "pickup-delivery" | "drop-off";
  date: string;
  slot: string;
  address: string;
  coords: { lat: number; lng: number } | null;
  distanceKm: number | null;
  notes: string;
  name: string;
  phone: string;
  email: string;
  customerType: "residential" | "commercial";
  /** reserved for future coupon + payment integration */
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
  email: z.string().trim().email("Enter a valid email").max(160),
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

const steps = ["Services", "Logistics", "Schedule", "Address", "Details", "Review"] as const;

function todayISO(offset = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function BookingFlow({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>({
    serviceSlugs: initialService ? [initialService] : [],
    logistics: "pickup-delivery",
    date: todayISO(1),
    slot: "",
    address: "",
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

  const selected = useMemo(
    () => services.filter((s) => draft.serviceSlugs.includes(s.slug)),
    [draft.serviceSlugs],
  );

  // Google Places autocomplete when a Maps browser key is configured.
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

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Location is not available in this browser");
      return;
    }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const km = haversineKm(site.coords, coords);
        setDraft((d) => ({ ...d, coords, distanceKm: km }));
        setChecking(false);
        toast.success(`Location captured — ${km.toFixed(1)} km from the studio`);
      },
      () => {
        setChecking(false);
        toast.error("We could not read your location. Please type your address instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function toggleService(slug: string) {
    setDraft((d) => ({
      ...d,
      serviceSlugs: d.serviceSlugs.includes(slug)
        ? d.serviceSlugs.filter((s) => s !== slug)
        : [...d.serviceSlugs, slug],
    }));
  }

  function validateStep(): boolean {
    const e: Errs = {};
    if (step === 0 && draft.serviceSlugs.length === 0) e.services = "Select at least one service";
    if (step === 2) {
      if (!draft.date) e.date = "Choose a date";
      if (!draft.slot) e.slot = "Choose a time slot";
    }
    if (step === 3 && draft.logistics === "pickup-delivery") {
      if (draft.address.trim().length < 8) e.address = "Enter your full pickup address";
      if (inRadius === false)
        e.radius = `That address is ${draft.distanceKm?.toFixed(1)} km away, outside our ${site.pickupRadiusKm} km pickup radius. Continue to the contact page for a consultation.`;
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
    // Booking payload is persisted locally for now; the same object is what a
    // bookings table / payment checkout will receive.
    try {
      const key = "spinanddry.bookings";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      localStorage.setItem(
        key,
        JSON.stringify([...prev, { reference, createdAt: new Date().toISOString(), ...draft }]),
      );
    } catch {
      /* storage unavailable — booking reference is still shown */
    }
    setConfirmed(reference);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (confirmed) {
    return (
      <div className="border border-border bg-card p-8 md:p-14">
        <CircleCheck className="size-10 text-brass" aria-hidden />
        <h2 className="mt-6 font-display text-4xl">Booking confirmed</h2>
        <p className="mt-3 max-w-xl text-ink-soft">
          Your reference is <span className="font-semibold text-foreground">{confirmed}</span>. We
          will call {draft.phone} to confirm the collection window and answer any fabric-specific
          questions before pickup.
        </p>
        <dl className="mt-8 grid gap-6 border-t border-border pt-8 sm:grid-cols-2">
          <Detail label="Services" value={selected.map((s) => s.name).join(", ")} />
          <Detail
            label="Collection"
            value={`${draft.date} · ${draft.slot} · ${
              draft.logistics === "pickup-delivery" ? "Pickup & delivery" : "Studio drop-off"
            }`}
          />
          {draft.logistics === "pickup-delivery" && (
            <Detail label="Pickup address" value={draft.address} />
          )}
          <Detail label="Contact" value={`${draft.name} · ${draft.phone} · ${draft.email}`} />
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/services" className="bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase">
            Explore services
          </Link>
          <Link to="/" className="border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-5">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn(
              "eyebrow flex items-center gap-2",
              i === step ? "text-foreground" : i < step ? "text-brass" : "text-muted-foreground",
            )}
          >
            {i < step ? <Check className="size-3" aria-hidden /> : <span>{i + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      <div className="py-10">
        {step === 0 && (
          <Step
            title="What needs care?"
            hint="Select one or more services. You can add items and quantities at pickup."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((s) => {
                const active = draft.serviceSlugs.includes(s.slug);
                return (
                  <button
                    type="button"
                    key={s.slug}
                    onClick={() => toggleService(s.slug)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start justify-between gap-4 border p-4 text-left transition-colors",
                      active
                        ? "border-ink bg-ink text-background"
                        : "border-border bg-card hover:border-ink",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{s.name}</span>
                      <span
                        className={cn(
                          "mt-1 block text-xs",
                          active ? "text-background/70" : "text-muted-foreground",
                        )}
                      >
                        {s.turnaround}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center border",
                        active ? "border-brass bg-brass text-ink" : "border-border",
                      )}
                    >
                      {active && <Check className="size-3" aria-hidden />}
                    </span>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.services} />
          </Step>
        )}

        {step === 1 && (
          <Step title="How should we collect?" hint="Pickup and delivery is free within 10 km.">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: "pickup-delivery",
                    title: "Pickup & delivery",
                    body: "We collect from your door and return the finished order in your chosen slot. Free inside 10 km.",
                  },
                  {
                    id: "drop-off",
                    title: "Studio drop-off",
                    body: "Bring items to the studio and collect them yourself. Available to everyone, any distance.",
                  },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, logistics: o.id }))}
                  aria-pressed={draft.logistics === o.id}
                  className={cn(
                    "border p-6 text-left transition-colors",
                    draft.logistics === o.id
                      ? "border-ink bg-ink text-background"
                      : "border-border bg-card hover:border-ink",
                  )}
                >
                  <span className="font-display text-2xl">{o.title}</span>
                  <span
                    className={cn(
                      "mt-2 block text-sm",
                      draft.logistics === o.id ? "text-background/70" : "text-ink-soft",
                    )}
                  >
                    {o.body}
                  </span>
                </button>
              ))}
            </div>
            <fieldset className="mt-8">
              <legend className="eyebrow text-muted-foreground">Customer type</legend>
              <div className="mt-3 flex gap-2">
                {(["residential", "commercial"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, customerType: t }))}
                    className={cn(
                      "border px-4 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase",
                      draft.customerType === t ? "border-ink bg-ink text-background" : "border-border",
                    )}
                  >
                    {t === "residential" ? "Home" : "Business"}
                  </button>
                ))}
              </div>
            </fieldset>
          </Step>
        )}

        {step === 2 && (
          <Step title="Pick a date and slot" hint="Two-hour windows, seven days a week.">
            <label className="block max-w-xs">
              <span className="eyebrow text-muted-foreground">Preferred date</span>
              <input
                type="date"
                min={todayISO(0)}
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className="mt-2 w-full border border-input bg-card px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </label>
            <FieldError message={errors.date} />
            <p className="eyebrow mt-8 text-muted-foreground">Time slot</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, slot }))}
                  aria-pressed={draft.slot === slot}
                  className={cn(
                    "border px-4 py-4 text-sm transition-colors",
                    draft.slot === slot
                      ? "border-ink bg-ink text-background"
                      : "border-border bg-card hover:border-ink",
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
            <FieldError message={errors.slot} />
          </Step>
        )}

        {step === 3 && (
          <Step
            title={draft.logistics === "pickup-delivery" ? "Where do we collect?" : "Confirm drop-off"}
            hint={
              draft.logistics === "pickup-delivery"
                ? `We validate the address against our ${site.pickupRadiusKm} km pickup radius before you confirm.`
                : "No address needed for studio drop-off — add any notes for our team."
            }
          >
            {draft.logistics === "pickup-delivery" && (
              <>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Pickup address</span>
                  <input
                    ref={addressRef}
                    type="text"
                    autoComplete="street-address"
                    maxLength={220}
                    placeholder="Flat, building, street, area, city"
                    value={draft.address}
                    onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                    className="mt-2 w-full border border-input bg-card px-4 py-3 text-sm focus:border-ink focus:outline-none"
                  />
                </label>
                <FieldError message={errors.address} />

                <button
                  type="button"
                  onClick={useMyLocation}
                  className="mt-4 inline-flex items-center gap-2 border border-ink px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase"
                >
                  {checking ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <MapPin className="size-3.5" aria-hidden />
                  )}
                  Verify with my location
                </button>

                {draft.distanceKm !== null && (
                  <div
                    className={cn(
                      "mt-6 border p-5 text-sm",
                      inRadius ? "border-brass bg-brass-soft/40" : "border-destructive/40 bg-card",
                    )}
                  >
                    <p className="font-semibold">
                      {draft.distanceKm.toFixed(1)} km from the Spin &amp; Dry studio
                    </p>
                    <p className="mt-1 text-ink-soft">
                      {inRadius
                        ? "Inside the free pickup and delivery radius. Continue to your details."
                        : `Outside our ${site.pickupRadiusKm} km pickup radius. You can still drop off at the studio, or contact us for a consultation or a commercial route assessment.`}
                    </p>
                    {!inRadius && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, logistics: "drop-off" }))}
                          className="border border-ink px-4 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase"
                        >
                          Switch to drop-off
                        </button>
                        <Link
                          to="/contact"
                          className="bg-ink px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-background uppercase"
                        >
                          Request consultation
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <FieldError message={errors.radius} />
              </>
            )}

            <label className="mt-8 block">
              <span className="eyebrow text-muted-foreground">
                Fabric notes (optional)
              </span>
              <textarea
                rows={4}
                maxLength={600}
                placeholder="Item counts, delicate fabrics, stains we should look at, access instructions…"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                className="mt-2 w-full border border-input bg-card px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </label>
          </Step>
        )}

        {step === 4 && (
          <Step title="Your details" hint="Used only to confirm and deliver this order.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={draft.name}
                onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Phone"
                value={draft.phone}
                onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                error={errors.phone}
                autoComplete="tel"
                type="tel"
              />
              <Field
                label="Email"
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
          <Step title="Review your booking" hint="Nothing is charged now. Final quote follows inspection.">
            <dl className="grid gap-6 border-y border-border py-8 sm:grid-cols-2">
              <Detail label="Services" value={selected.map((s) => s.name).join(", ")} />
              <Detail
                label="Logistics"
                value={
                  draft.logistics === "pickup-delivery" ? "Pickup & delivery" : "Studio drop-off"
                }
              />
              <Detail label="Date" value={draft.date} />
              <Detail label="Slot" value={draft.slot} />
              {draft.logistics === "pickup-delivery" && (
                <Detail
                  label="Pickup address"
                  value={`${draft.address}${
                    draft.distanceKm !== null ? ` · ${draft.distanceKm.toFixed(1)} km` : ""
                  }`}
                />
              )}
              <Detail label="Customer type" value={draft.customerType === "residential" ? "Home" : "Business"} />
              <Detail label="Contact" value={`${draft.name} · ${draft.phone} · ${draft.email}`} />
              {draft.notes && <Detail label="Notes" value={draft.notes} />}
            </dl>
            <p className="mt-6 max-w-xl text-sm text-ink-soft">
              Payment is collected on delivery by card, UPI or bank transfer. Every item is
              inspected and quoted before processing begins, and nothing is cleaned without your
              approval.
            </p>
          </Step>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase disabled:opacity-30"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 bg-ink px-7 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase transition-colors hover:bg-ink-soft"
          >
            Continue <ArrowRight className="size-3.5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-2 bg-brass px-7 py-4 text-xs font-semibold tracking-[0.16em] text-ink uppercase"
          >
            Confirm booking <Check className="size-3.5" aria-hidden />
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
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
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
        className="mt-2 w-full border border-input bg-card px-4 py-3 text-sm focus:border-ink focus:outline-none"
      />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-destructive">{message}</p>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm">{value || "—"}</dd>
    </div>
  );
}