import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { site } from "@/data/site";
import { saveLead } from "@/lib/admin-store";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Consultation | Spin & Dry Fabric Care" },
      {
        name: "description",
        content:
          "Contact the Spin & Dry fabric care studio for bookings, consultations, special requests, or commercial and hotel linen contracts — including addresses outside the 10 km pickup radius.",
      },
      { property: "og:title", content: "Contact & Consultation | Spin & Dry" },
      {
        property: "og:description",
        content:
          "Call, email or send an enquiry. Consultations available for addresses outside the 10 km pickup radius.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits and + - ( )"),
  topic: z.string().min(1),
  message: z.string().trim().min(10, "Tell us a little more").max(1200),
});

type Errs = Partial<Record<"name" | "email" | "phone" | "message", string>>;

function ContactPage() {
  const site = useSiteSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "Consultation",
    message: "",
  });
  const [errors, setErrors] = useState<Errs>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Errs = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0]) as keyof Errs] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    saveLead(form);
    setSent(true);
    toast.success("Enquiry received — we reply within one working day.");
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[88rem] gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow text-brass">Contact</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">
            Talk to the studio
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            For bookings, fabric consultations, special requests, or commercial and hotel linen
            contracts. If your address falls outside the {site.pickupRadiusKm} km pickup radius, this
            is the place to start.
          </p>

          <dl className="mt-12 grid gap-7">
            <div className="border-t border-border pt-5">
              <dt className="eyebrow text-muted-foreground">Phone</dt>
              <dd className="mt-2 font-display text-2xl">
                <a href={site.phoneHref}>{site.phone}</a>
              </dd>
            </div>
            <div className="border-t border-border pt-5">
              <dt className="eyebrow text-muted-foreground">Email</dt>
              <dd className="mt-2 font-display text-2xl">
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div className="border-t border-border pt-5">
              <dt className="eyebrow text-muted-foreground">Studio</dt>
              <dd className="mt-2 text-ink-soft">
                <address className="not-italic">{site.address}</address>
              </dd>
            </div>
            <div className="border-t border-border pt-5">
              <dt className="eyebrow text-muted-foreground">Hours</dt>
              <dd className="mt-2 text-ink-soft">
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days} — {h.time}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
            >
              Book a pickup
            </Link>
            <Link
              to="/coverage"
              className="border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Check coverage
            </Link>
          </div>
        </div>

        <div className="border border-border bg-card p-8 md:p-12">
          {sent ? (
            <div>
              <h2 className="font-display text-4xl">Thank you, {form.name.split(" ")[0]}</h2>
              <p className="mt-4 text-ink-soft">
                Your enquiry about {form.topic.toLowerCase()} has been received. We reply within one
                working day, usually sooner during studio hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", phone: "", topic: "Consultation", message: "" });
                }}
                className="mt-8 border border-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="font-display text-3xl">Send an enquiry</h2>
              <div className="mt-8 grid gap-5">
                <Field
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  error={errors.name}
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  error={errors.phone}
                  autoComplete="tel"
                />
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Topic</span>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm focus:border-ink focus:outline-none"
                  >
                    {[
                      "Consultation",
                      "Outside pickup radius",
                      "Commercial linen contract",
                      "Hotel linen contract",
                      "Office fabric care",
                      "Existing booking",
                      "Something else",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Message</span>
                  <textarea
                    rows={6}
                    maxLength={1200}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Fabric type, item counts, location and anything we should look at."
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm focus:border-ink focus:outline-none"
                  />
                  {errors.message && (
                    <span className="mt-2 block text-sm text-destructive">{errors.message}</span>
                  )}
                </label>
              </div>
              <button
                type="submit"
                className="mt-8 w-full bg-ink px-6 py-4 text-xs font-semibold tracking-[0.16em] text-background uppercase"
              >
                Send enquiry
              </button>
            </form>
          )}
        </div>
      </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={160}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm focus:border-ink focus:outline-none"
      />
      {error && <span className="mt-2 block text-sm text-destructive">{error}</span>}
    </label>
  );
}