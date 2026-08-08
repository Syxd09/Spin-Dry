import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Calendar,
  IndianRupee,
  ChevronRight,
  FileText,
  Megaphone,
} from "lucide-react";
import { site } from "@/data/site";
import { AdminOrder, OrderStatus, getStoredOrders } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: (search["ref"] as string) || "",
    phone: (search["phone"] as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Track Your Order — Live Fabric Care Status | Spin & Dry" },
      {
        name: "description",
        content:
          "Track your Spin & Dry fabric care order in real time by entering your Order Number and Mobile Phone Number.",
      },
      { property: "og:title", content: "Track Your Order — Spin & Dry" },
      { property: "og:url", content: "/track" },
    ],
    links: [{ rel: "canonical", href: "/track" }],
  }),
  component: TrackPage,
});

const trackingSteps: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: "Pending Intake",
    label: "Doorstep Pickup & Intake",
    desc: "Order registered. Uniformed team member collects, counts, and tags your items.",
  },
  {
    status: "Inspected & Quoted",
    label: "Studio Inspection & Quote",
    desc: "Fabrics graded for fibre and soil level. Confirmed quote shared for your approval.",
  },
  {
    status: "In Processing",
    label: "Calibrated Care & Wash",
    desc: "Running on fabric-specific eco-solvent programme and laser dimensional drying.",
  },
  {
    status: "QC Passed",
    label: "Master Quality Check",
    desc: "Checked under studio light for stain lift, odour, and finish before breathable packing.",
  },
  {
    status: "Out for Delivery",
    label: "Out for Doorstep Delivery",
    desc: "Driver is en route to your address in your selected 2-hour delivery slot.",
  },
  {
    status: "Completed",
    label: "Delivered & Re-Fitted",
    desc: "Items delivered back. Curtains re-hung and sofa covers refitted on site.",
  },
];

function getStepIndex(status: OrderStatus): number {
  if (status === "Cancelled") return -1;
  const idx = trackingSteps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

function TrackPage() {
  const search = useSearch({ from: "/track" });
  const [refInput, setRefInput] = useState(search.ref || "");
  const [phoneInput, setPhoneInput] = useState(search.phone || "");

  const [searchedOrder, setSearchedOrder] = useState<AdminOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if search params exist on initial mount
  useEffect(() => {
    if (search.ref) {
      handleLookup(search.ref, search.phone);
    }
  }, [search.ref, search.phone]);

  function handleLookup(refToSearch: string, phoneToSearch: string) {
    setErrorMsg("");
    setSearchedOrder(null);
    setHasSearched(true);

    const cleanRef = refToSearch.trim().toUpperCase().replace(/^#/, "");
    const cleanPhone = phoneToSearch.trim().replace(/[^0-9]/g, "");

    if (!cleanRef) {
      setErrorMsg("Please enter your Order Reference Number (e.g. SD-849201).");
      return;
    }

    const allOrders = getStoredOrders();

    // Look for matching order
    const match = allOrders.find((o) => {
      const oRef = o.reference.toUpperCase().replace(/^#/, "");
      const oPhoneClean = o.phone.replace(/[^0-9]/g, "");

      const refMatch = oRef === cleanRef || oRef === `SD-${cleanRef}`;
      const phoneMatch =
        !cleanPhone ||
        oPhoneClean.includes(cleanPhone) ||
        cleanPhone.includes(oPhoneClean.slice(-4));

      return refMatch && phoneMatch;
    });

    if (match) {
      setSearchedOrder(match);
    } else {
      setErrorMsg(
        `No order found matching reference #${cleanRef}${
          cleanPhone ? ` and phone ending in ${cleanPhone.slice(-4)}` : ""
        }. Please verify your details or call our studio.`,
      );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLookup(refInput, phoneInput);
  }

  const currentStepIdx = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header Banner */}
      <header className="border-b border-border bg-ink px-5 py-10 text-background md:px-10 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-4 py-1.5 backdrop-blur-md mb-4">
            <Sparkles className="size-3.5 text-brass" />
            <span className="eyebrow text-brass">Real-Time Logistics Tracker</span>
          </div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Track Your Fabric Care Order
          </h1>
          <p className="mt-3 text-sm md:text-base text-background/80 max-w-xl mx-auto">
            Enter your Order Reference Number and Mobile Phone Number to check live cleaning status, technician notes, and delivery schedules.
          </p>
        </div>
      </header>

      {/* Main Search & Tracking Container */}
      <main className="mx-auto max-w-4xl px-5 py-10 md:py-14">
        {/* Search Card Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lift md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Order Reference Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-brass">
                    #
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="SD-849201 or 849201"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    className="w-full rounded border border-input bg-background py-3 pl-8 pr-4 text-sm font-mono font-bold text-foreground placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+91 98450 12345 or last 4 digits"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full rounded border border-input bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-brass px-7 py-4 text-xs font-bold tracking-[0.16em] text-ink uppercase shadow-gold transition-transform hover:-translate-y-0.5"
            >
              <Search className="size-4" /> Track Order Status
            </button>
          </form>

          {/* Quick Demo Reference Suggestions */}
          <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            <span>Try sample order refs:</span>
            {["SD-849201", "SD-739102", "SD-950311", "SD-441299"].map((sampleRef) => (
              <button
                key={sampleRef}
                type="button"
                onClick={() => {
                  setRefInput(sampleRef);
                  setPhoneInput("");
                  handleLookup(sampleRef, "");
                }}
                className="font-mono text-xs font-semibold text-brass hover:underline bg-brass-soft/20 px-2 py-0.5 rounded"
              >
                #{sampleRef}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-destructive flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{errorMsg}</p>
              <p className="mt-1 text-xs text-destructive/80">
                Need instant assistance? Reach out to our studio concierge at{" "}
                <a href={site.phoneHref} className="font-bold underline">
                  {site.phone}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Live Order Status Display */}
        {searchedOrder && (
          <div className="mt-8 space-y-6">
            {/* Live Studio Operational Alert */}
            {searchedOrder.adminAlert && (
              <div className="rounded-xl border border-brass/60 bg-brass/10 p-5 text-foreground flex items-start gap-3.5 shadow-sm">
                <Megaphone className="size-5 text-brass shrink-0 mt-0.5" />
                <div>
                  <span className="eyebrow block text-brass font-bold">Studio Operational Alert</span>
                  <p className="mt-1 text-sm font-semibold text-foreground leading-relaxed">
                    {searchedOrder.adminAlert}
                  </p>
                </div>
              </div>
            )}

            {/* Status Summary Banner */}
            <div className="rounded-xl border border-brass/50 bg-ink p-6 text-background shadow-lift">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-brass">#{searchedOrder.reference}</span>
                    {searchedOrder.isExpress && (
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold text-purple-300 uppercase tracking-wider">
                        ⚡ 24h Express
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-background">
                    Client: {searchedOrder.customerName}
                  </h2>
                  <p className="text-xs text-background/70 mt-0.5">
                    Service Date: {searchedOrder.date} ({searchedOrder.slot})
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="eyebrow block text-background/60">Current Care Stage</span>
                  <span className="mt-1 inline-block rounded bg-brass px-3 py-1.5 font-display text-base font-bold text-ink uppercase">
                    {searchedOrder.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-background/20 pt-4 text-xs sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-brass" />
                  <span>
                    Pickup Radius: <strong>{searchedOrder.distanceKm?.toFixed(1) || "2.1"} km</strong> from Studio
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-brass" />
                  <span>
                    Logistics: <strong>{searchedOrder.logistics === "pickup-delivery" ? "Doorstep Pickup" : "Studio Drop-off"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="size-4 text-brass" />
                  <span>
                    Confirmed Investment: <strong>₹{searchedOrder.quoteAmount}</strong> ({searchedOrder.paymentStatus})
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <h3 className="eyebrow text-brass mb-6">Care Process Timeline</h3>

              {searchedOrder.status === "Cancelled" ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-foreground space-y-4">
                  <div className="flex items-center gap-2.5 text-destructive font-bold">
                    <AlertCircle className="size-6" />
                    <h4 className="font-display text-2xl">Order Cancelled</h4>
                  </div>
                  <div className="rounded border border-destructive/20 bg-background p-4">
                    <span className="eyebrow block text-destructive font-bold">Reason for Cancellation</span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      "{searchedOrder.cancellationReason || "This order was cancelled by studio logistics or client request."}"
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you need to reschedule or have questions regarding a refund, please contact our studio care team.
                  </p>
                </div>
              ) : (
                <ol className="relative border-l-2 border-border/80 ml-3 space-y-8 pl-6">
                  {trackingSteps.map((step, idx) => {
                    const isDone = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <li key={step.status} className="relative">
                        {/* Status Icon Marker */}
                        <span
                          className={cn(
                            "absolute -left-[35px] top-0 flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all",
                            isDone
                              ? "bg-emerald-600 text-white shadow-sm"
                              : isCurrent
                              ? "bg-brass text-ink ring-4 ring-brass/20"
                              : "bg-muted text-muted-foreground border border-border",
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4" />
                          ) : isCurrent ? (
                            <Clock className="size-3.5 animate-spin-slow" />
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                "font-display text-lg",
                                isCurrent
                                  ? "text-brass font-bold"
                                  : isDone
                                  ? "text-foreground font-semibold"
                                  : "text-muted-foreground",
                              )}
                            >
                              {step.label}
                            </h4>
                            {isCurrent && (
                              <span className="rounded bg-brass/20 px-2 py-0.5 text-[10px] font-extrabold text-brass uppercase">
                                Active Now
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-ink-soft leading-relaxed max-w-xl">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* Order Items & Fabric Protocol Summary */}
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <h3 className="eyebrow text-brass">Registered Items &amp; Notes</h3>
                <span className="text-xs font-medium text-muted-foreground">
                  Assigned Tech: {searchedOrder.assignedTechnician || "Studio Senior Team"}
                </span>
              </div>

              <ul className="divide-y divide-border/60">
                {searchedOrder.items.map((item, i) => (
                  <li key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-display text-base text-foreground">{item.serviceName}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity} units</p>
                    </div>
                    <span className="font-mono font-bold text-foreground">₹{item.quantity * item.unitPrice}</span>
                  </li>
                ))}
              </ul>

              {searchedOrder.notes && (
                <div className="mt-4 rounded bg-background p-4 border border-border/80">
                  <span className="eyebrow block text-brass">Technician Care Notes</span>
                  <p className="mt-1 text-xs text-ink-soft italic">"{searchedOrder.notes}"</p>
                </div>
              )}
            </div>

            {/* Support Actions */}
            <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-display text-lg text-foreground">Questions about your order?</h4>
                <p className="text-xs text-ink-soft">
                  Speak directly with our studio concierge via WhatsApp or phone.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi Spin & Dry! I'm inquiring about my order #${searchedOrder.reference}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-xs font-bold text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp Concierge
                </a>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2 border border-ink px-5 py-3 text-xs font-bold uppercase rounded hover:bg-ink hover:text-background transition-colors"
                >
                  <Phone className="size-3.5" /> Call Studio
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
