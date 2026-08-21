import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Calculator, Check, Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredCMS } from "@/lib/admin-store";
import { services, servicePricingData } from "@/data/services";
import { useCMSServices } from "@/lib/use-site-settings";

type PricingCategory = {
  id: string;
  name: string;
  unitLabel: string;
  basePrice: number;
  unitName: string;
  minQty: number;
  maxQty: number;
  step: number;
  slug: string;
  description: string;
};

const categories: PricingCategory[] = [
  {
    id: "curtains",
    name: "Curtains & Floor Drapes",
    unitLabel: "Panels (Standard height up to 10 ft)",
    basePrice: 450,
    unitName: "panel(s)",
    minQty: 2,
    maxQty: 20,
    step: 1,
    slug: "curtains-and-drapes",
    description: "Steam-pressed, size-measured, hung on site with zero shrinkage.",
  },
  {
    id: "sofa",
    name: "Sofa & Cushion Covers",
    unitLabel: "Seater covers",
    basePrice: 350,
    unitName: "seater(s)",
    minQty: 1,
    maxQty: 12,
    step: 1,
    slug: "sofa-and-cushion-covers",
    description: "Form-fitted drying to preserve elastic stretch and seam integrity.",
  },
  {
    id: "rugs",
    name: "Carpets & Area Rugs",
    unitLabel: "Area in Sq. Ft.",
    basePrice: 45,
    unitName: "sq. ft.",
    minQty: 20,
    maxQty: 300,
    step: 10,
    slug: "carpets-and-area-rugs",
    description: "Deep dust extraction & fibre-safe solvent extraction for rugs.",
  },
  {
    id: "duvets",
    name: "Comforters & Quilts",
    unitLabel: "Items (Double / King size)",
    basePrice: 550,
    unitName: "item(s)",
    minQty: 1,
    maxQty: 10,
    step: 1,
    slug: "comforters-and-duvets",
    description: "Thermal fluff drying + anti-allergen ozone treatment included.",
  },
  {
    id: "couture",
    name: "Silk Sarees & Heritage Wear",
    unitLabel: "Garments",
    basePrice: 600,
    unitName: "garment(s)",
    minQty: 1,
    maxQty: 8,
    step: 1,
    slug: "dry-cleaning",
    description: "Hand-finished organic dry cleaning for gold zari & delicate silks.",
  },
];

export function InstantQuoteCalculator() {
  const cmsServices = useCMSServices();

  const dynamicCategories = useMemo(() => {
    return cmsServices.map((s) => {
      let basePrice = 150;
      const prices = s.prices && s.prices.length > 0 ? s.prices : (servicePricingData[s.slug] || []);
      if (prices.length > 0) {
        const firstItem = prices[0];
        if (firstItem) {
          const values = Object.values(firstPriceItem(firstItem));
          if (values.length > 0) {
            basePrice = values[0] || 150;
          }
        }
      }

      const nameLower = s.name.toLowerCase();
      const isSqFt = nameLower.includes("carpet") || nameLower.includes("rug") || nameLower.includes("curtain");
      
      const unitName = isSqFt ? "sq. ft." : "item(s)";
      const unitLabel = isSqFt 
        ? "Area in Sq. Ft. (e.g., width x height)" 
        : `${s.name} Count / Quantity`;
      const minQty = isSqFt ? 20 : 1;
      const maxQty = isSqFt ? 300 : 20;
      const step = isSqFt ? 10 : 1;

      return {
        id: s.slug,
        name: s.name,
        unitLabel,
        basePrice,
        unitName,
        minQty,
        maxQty,
        step,
        slug: s.slug,
        description: s.summary,
      };
    });

    function firstPriceItem(item: any): Record<string, number> {
      return item.prices || {};
    }
  }, [cmsServices]);

  const [activeCatSlug, setActiveCatSlug] = useState<string>(dynamicCategories[0]?.slug || "curtains-and-drapes");
  const [qty, setQty] = useState<number>(4);
  const [isExpress, setIsExpress] = useState<boolean>(false);

  const selectedCat = useMemo(() => {
    return (dynamicCategories.find((c) => c.slug === activeCatSlug) || dynamicCategories[0] || categories[0]) as PricingCategory;
  }, [dynamicCategories, activeCatSlug]);

  const subtotal = selectedCat.basePrice * qty;
  const expressFee = isExpress ? Math.round(subtotal * 0.25) : 0;
  const total = subtotal + expressFee;

  return (
    <div className="mx-auto max-w-[88rem] overflow-hidden border border-border/80 bg-card/95 shadow-lift">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        {/* Left Side: Controls */}
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-brass/20 text-brass">
              <Calculator className="size-4" />
            </span>
            <span className="eyebrow text-brass">Instant Estimate</span>
          </div>

          <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl">
            Calculate your fabric care quote
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Select your item type and volume for an instant estimate. Final quotes are confirmed at intake with zero obligations.
          </p>

          {/* Category Tabs (Scrollable List) */}
          <div className="mt-8">
            <label className="eyebrow mb-3 block text-muted-foreground">1. Select Fabric Category</label>
            <div className="max-h-[260px] overflow-y-auto pr-1.5 space-y-2 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
              <div className="grid gap-2 sm:grid-cols-2">
                {dynamicCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCatSlug(c.slug);
                      setQty(c.minQty);
                    }}
                    className={cn(
                      "flex flex-col items-start border p-3.5 text-left transition-all rounded-lg",
                      selectedCat.id === c.id
                        ? "border-brass bg-brass-soft/30 text-ink shadow-sm ring-1 ring-brass"
                        : "border-border bg-background hover:border-border/80 hover:bg-card",
                    )}
                  >
                    <span className="font-semibold text-sm line-clamp-1">{c.name}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground font-mono">From ₹{c.basePrice} / {c.unitName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity Slider / Counter */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <label className="eyebrow text-muted-foreground">2. Volume / Quantity</label>
              <span className="font-display text-2xl font-medium text-brass">
                {qty} {selectedCat.unitName}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <input
                type="range"
                min={selectedCat.minQty}
                max={selectedCat.maxQty}
                step={selectedCat.step}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brass bg-border rounded-lg"
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">{selectedCat.unitLabel}</p>
          </div>

          {/* Turnaround speed toggle */}
          <div className="mt-8">
            <label className="eyebrow mb-3 block text-muted-foreground">3. Processing Turnaround</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsExpress(false)}
                className={cn(
                  "flex items-center justify-between border p-3.5 transition-all text-xs font-semibold uppercase tracking-wider",
                  !isExpress ? "border-ink bg-ink text-background" : "border-border bg-background text-ink",
                )}
              >
                <span>Standard (48 hrs)</span>
                <Clock className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpress(true)}
                className={cn(
                  "flex items-center justify-between border p-3.5 transition-all text-xs font-semibold uppercase tracking-wider",
                  isExpress ? "border-brass bg-brass text-ink font-bold shadow-sm" : "border-border bg-background text-ink",
                )}
              >
                <span>Express 24h (+25%)</span>
                <Sparkles className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Quote Summary Box */}
        <div className="flex flex-col justify-between border-t border-border bg-ink p-8 text-background lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between border-b border-background/20 pb-6">
              <div>
                <span className="eyebrow text-brass">Estimated Investment</span>
                <h3 className="mt-1 font-display text-4xl text-brass">₹{total.toLocaleString("en-IN")}</h3>
              </div>
              <span className="rounded bg-brass/20 px-3 py-1 text-xs font-medium text-brass">
                Free Pickup Included
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm text-background/80">
              <div className="flex justify-between border-b border-background/10 pb-2">
                <span>Category:</span>
                <span className="font-semibold text-background">{selectedCat.name}</span>
              </div>
              <div className="flex justify-between border-b border-background/10 pb-2">
                <span>Quantity:</span>
                <span className="font-semibold text-background">{qty} {selectedCat.unitName}</span>
              </div>
              <div className="flex justify-between border-b border-background/10 pb-2">
                <span>Turnaround:</span>
                <span className="font-semibold text-background">{isExpress ? "24-Hour Express" : "48-Hour Standard"}</span>
              </div>
              <div className="flex justify-between border-b border-background/10 pb-2">
                <span>Doorstep Pickup & Return:</span>
                <span className="font-semibold text-brass">FREE (within 10 km)</span>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="mt-8 rounded bg-background/5 p-5 border border-background/10">
              <h4 className="font-display text-lg text-brass">What's included in this price</h4>
              <ul className="mt-3 space-y-2 text-xs text-background/70">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brass" /> Pre-cleaning fibre & stain inspection report
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brass" /> 100% Size match guarantee (no shrinkage)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brass" /> Breathable garment sleeve packaging
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brass" /> Doorstep take-down & re-fit consultation
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/book"
              search={{ service: selectedCat.slug }}
              className="group flex w-full items-center justify-center gap-2 bg-brass py-4 text-xs font-bold uppercase tracking-[0.16em] text-ink transition-transform hover:-translate-y-0.5"
            >
              Book this quote <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-center text-xs text-background/50 flex items-center justify-center gap-1">
              <ShieldCheck className="size-3 text-brass" /> You approve final quote after physical inspection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
