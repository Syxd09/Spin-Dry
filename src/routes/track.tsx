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
import { useSiteSettings } from "@/lib/use-site-settings";
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
      { name: "robots", content: "noindex, nofollow" },
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
  const site = useSiteSettings();
  const search = useSearch({ from: "/track" });
  const [refInput, setRefInput] = useState(search.ref || "");
  const [phoneInput, setPhoneInput] = useState(search.phone || "");

  const [searchedOrder, setSearchedOrder] = useState<AdminOrder | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<AdminOrder[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if search params exist on initial mount
  useEffect(() => {
    if (search.ref || search.phone) {
      handleLookup(search.ref || "", search.phone || "");
    }
  }, [search.ref, search.phone]);

  // Live listener to capture order changes or quote edits instantly
  useEffect(() => {
    function handleOrdersRefresh() {
      if (hasSearched) {
        // Read directly from inputs to refresh current active filters
        handleLookup(refInput, phoneInput);
      }
    }
    window.addEventListener("storage", handleOrdersRefresh);
    window.addEventListener("orders-updated", handleOrdersRefresh);
    return () => {
      window.removeEventListener("storage", handleOrdersRefresh);
      window.removeEventListener("orders-updated", handleOrdersRefresh);
    };
  }, [hasSearched, refInput, phoneInput]);

  function handleLookup(refToSearch: string, phoneToSearch: string) {
    setErrorMsg("");
    setSearchedOrder(null);
    setMatchedOrders([]);
    setHasSearched(true);

    const cleanRef = refToSearch.trim().toUpperCase().replace(/^#/, "");
    const cleanPhone = phoneToSearch.trim().replace(/[^0-9]/g, "");

    if (!cleanRef && !cleanPhone) {
      setErrorMsg("Please enter either an Order Reference Number or a Mobile Phone Number to search.");
      return;
    }

    const allOrders = getStoredOrders();
    let results = allOrders;

    if (cleanRef) {
      results = results.filter((o) => {
        const oRef = o.reference.toUpperCase().replace(/^#/, "");
        return oRef === cleanRef || oRef === `SD-${cleanRef}`;
      });
    }

    if (cleanPhone) {
      results = results.filter((o) => {
        const oPhoneClean = o.phone.replace(/[^0-9]/g, "");
        if (cleanPhone.length >= 5) {
          const matchEnd = cleanPhone.slice(-5);
          return oPhoneClean.endsWith(matchEnd);
        }
        return oPhoneClean.endsWith(cleanPhone) || oPhoneClean.includes(cleanPhone);
      });
    }

    if (results.length === 0) {
      if (cleanRef && cleanPhone) {
        setErrorMsg(
          `No order found matching reference #${cleanRef} and phone ending in ${cleanPhone.slice(-5)}.`
        );
      } else if (cleanRef) {
        setErrorMsg(`No order found matching reference #${cleanRef}.`);
      } else {
        setErrorMsg(`No orders found matching phone ending in ${cleanPhone.slice(-5)}.`);
      }
      return;
    }

    setMatchedOrders(results);
    if (results.length === 1 && results[0]) {
      setSearchedOrder(results[0]);
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
          <div className="inline-flex items-center gap-2 rounded-none border border-brass/30 bg-brass/10 px-4 py-1.5 backdrop-blur-md mb-4">
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
        <div className="rounded-none border border-border bg-card p-6 shadow-lift md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Order Reference Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-brass">
                    #
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. SD-849201 or 849201"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    className="w-full rounded-none border border-input bg-background py-3 pl-8 pr-4 text-sm font-mono font-bold text-foreground placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground focus:border-brass focus:outline-none"
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
                    placeholder="Enter whole number or last 5 digits"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full rounded-none border border-input bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
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
          <div className="mt-6 rounded-none border border-destructive/40 bg-destructive/10 p-5 text-destructive flex items-start gap-3">
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

        {/* Matching Orders List (Multiple Results) */}
        {matchedOrders.length > 0 && !searchedOrder && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <h3 className="font-display text-xl text-foreground font-bold">
                Orders Found ({matchedOrders.length})
              </h3>
              <span className="text-xs text-muted-foreground">Select an order to track live progress</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {matchedOrders.map((order) => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div
                    key={order.reference}
                    onClick={() => setSearchedOrder(order)}
                    className="cursor-pointer border border-border bg-card p-5 hover:border-brass transition-all hover:shadow-sm space-y-4 relative flex flex-col justify-between group rounded-none"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-brass">
                          #{order.reference}
                        </span>
                        <span className={cn(
                          "rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          order.status === "Completed"
                            ? "bg-emerald-100 text-emerald-950"
                            : order.status === "Cancelled"
                            ? "bg-rose-100 text-rose-950"
                            : "bg-amber-100 text-amber-950"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-foreground group-hover:text-brass transition-colors">
                        {order.customerName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: <strong>{order.date}</strong> · {order.slot}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Services: <strong>{order.items.length} services</strong> ({totalItems} items)
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs mt-2">
                      <span className="font-bold text-slate-800">
                        Quote: ₹{order.quoteAmount}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-brass group-hover:underline">
                        Track Care <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Order Status Display */}
        {searchedOrder && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            {matchedOrders.length > 1 && (
              <button
                type="button"
                onClick={() => setSearchedOrder(null)}
                className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none shadow-xs transition-colors mb-2"
              >
                ← Back to orders list ({matchedOrders.length})
              </button>
            )}
            {/* Live Studio Operational Alert */}
            {searchedOrder.adminAlert && (
              <div className="rounded-none border border-brass/60 bg-brass/10 p-5 text-foreground flex items-start gap-3.5 shadow-sm">
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
            <div className="rounded-none border border-brass/50 bg-ink p-6 text-background shadow-lift">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-brass">#{searchedOrder.reference}</span>
                    {searchedOrder.isExpress && (
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="size-3 text-purple-300" /> 24h Express
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

            {/* Thank You & Queries card for Completed Orders */}
            {searchedOrder.status === "Completed" && (
              <div className="rounded-none border border-emerald-300 bg-emerald-50/50 p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-emerald-100 flex items-center justify-center border border-emerald-200 rounded-none">
                    <CheckCircle2 className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-slate-900">Thank You for Choosing Spin & Dry!</h3>
                    <p className="text-xs text-slate-500">Your fabric care order has been successfully delivered and re-fitted.</p>
                  </div>
                </div>

                <div className="border-t border-emerald-200 pt-4 space-y-2 text-sm text-slate-700">
                  <p>
                    We hope you are delighted with the restoration quality and care of your items. Every piece was inspected, washed with eco-solvent chemistry, and QC checked under studio lighting.
                  </p>
                  <p className="font-semibold text-slate-900">
                    Have queries, concerns, or feedback about this delivery?
                  </p>
                  <p>
                    Please call our studio at <a href={site.phoneHref} className="text-amber-600 font-bold hover:underline">{site.phone}</a> or email us at <a href={`mailto:${site.email}`} className="text-amber-600 font-bold hover:underline">{site.email}</a>. We are committed to making things right if any detail isn't perfect.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="/?writeReview=true"
                    className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-background px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all rounded-none"
                  >
                    Share Your Feedback / Write a Review <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Stepper Timeline */}
            <div className="rounded-none border border-border bg-card p-6 md:p-8">
              <h3 className="eyebrow text-brass mb-6">Care Process Timeline</h3>

              {searchedOrder.status === "Cancelled" ? (
                <div className="rounded-none border border-destructive/40 bg-destructive/10 p-6 text-foreground space-y-4">
                  <div className="flex items-center gap-2.5 text-destructive font-bold">
                    <AlertCircle className="size-6" />
                    <h4 className="font-display text-2xl">Order Cancelled</h4>
                  </div>
                  <div className="rounded-none border border-destructive/20 bg-background p-4">
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
                    const isCompletedOrder = searchedOrder.status === "Completed";
                    const isDone = idx < currentStepIdx || (isCompletedOrder && idx === currentStepIdx);
                    const isCurrent = idx === currentStepIdx && !isCompletedOrder;

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
            <div className="rounded-none border border-border bg-card p-6 md:p-8">
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

              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Itemised Subtotal</span>
                  <span className="font-mono font-semibold">₹{searchedOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)}</span>
                </div>
                {searchedOrder.isExpress && (
                  <div className="flex justify-between items-center text-xs text-purple-600 font-semibold">
                    <span>24h Express Rush Fee</span>
                    <span>Included</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-dashed border-border/80 pt-2.5 mt-1.5">
                  <span className="text-sm font-bold text-foreground">Final Approved Quote</span>
                  <span className="font-mono text-base font-extrabold text-brass">₹{searchedOrder.quoteAmount}</span>
                </div>
              </div>

              {searchedOrder.notes && (
                <div className="mt-4 rounded-none bg-background p-4 border border-border/80">
                  <span className="eyebrow block text-brass">Technician Care Notes</span>
                  <p className="mt-1 text-xs text-ink-soft italic">"{searchedOrder.notes}"</p>
                </div>
              )}
            </div>

            {/* Support Actions */}
            <div className="rounded-none border border-border bg-background p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-xs font-bold text-white rounded-none hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp Concierge
                </a>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2 border border-ink px-5 py-3 text-xs font-bold uppercase rounded-none hover:bg-ink hover:text-background transition-colors"
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
