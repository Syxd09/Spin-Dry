import { useState } from "react";
import { Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import heroFabric from "@/assets/hero-fabric.jpg";
import linenStack from "@/assets/linen-stack.jpg";
import facility from "@/assets/facility.jpg";

type CaseStudy = {
  id: string;
  title: string;
  category: string;
  challenge: string;
  solution: string;
  result: string;
  stats: { label: string; value: string }[];
  image: string;
  tags: string[];
};

const caseStudies: CaseStudy[] = [
  {
    id: "silk-rug",
    title: "10x14 ft Hand-Knotted Silk & Wool Persian Rug",
    category: "Rugs & Carpets",
    challenge: "Deep aged red wine stain, dust compaction, matted silk fringe.",
    solution: "Controlled pH solvent extraction, hand-brushed fringe revival & low-heat air drying.",
    result: "100% stain removal, restored silk lustre, 0% dye bleed.",
    stats: [
      { label: "Stain Lift Rate", value: "99.8%" },
      { label: "Dye Retention", value: "100%" },
      { label: "Processing Time", value: "72 Hours" },
    ],
    image: heroFabric,
    tags: ["Hand-knotted Silk", "Stain Extraction", "Fringe Restoration"],
  },
  {
    id: "velvet-drapes",
    title: "14-Foot Blackout Lined Velvet Living Room Drapes",
    category: "Curtains & Drapes",
    challenge: "Accumulated urban particulate soot, heavy creasing, threat of shrinkage.",
    solution: "Intake dimension logging, non-aqueous dry vapour treatment, vertical drape pressing.",
    result: "Zero dimensional shrinkage, restored deep velvet pile texture.",
    stats: [
      { label: "Size Match", value: "100%" },
      { label: "Dust Extraction", value: "100%" },
      { label: "Re-hang Service", value: "Included" },
    ],
    image: linenStack,
    tags: ["Floor-to-Ceiling Drapes", "Zero Shrinkage", "Vertical Steam Press"],
  },
  {
    id: "down-duvet",
    title: "Goose Down King Size Hotel-Grade Duvet",
    category: "Bedding & Quilts",
    challenge: "Clumped down fill, body oil discolouration, allergen buildup.",
    solution: "Low-RPM ozone wash chemistry, thermal fluff drying with ball agitators.",
    result: "Restored 95% original loft height, 100% anti-microbial sanitisation.",
    stats: [
      { label: "Loft Restored", value: "95%" },
      { label: "Allergen Removal", value: "100%" },
      { label: "Sanitised", value: "Ozone Treated" },
    ],
    image: facility,
    tags: ["Goose Down", "Loft Revival", "Ozone Anti-Allergen"],
  },
];

export function FabricRestorationShowcase() {
  const [activeTab, setActiveTab] = useState<CaseStudy>(caseStudies[0]);

  return (
    <section className="border-b border-border bg-ink px-5 py-20 text-background md:px-10 md:py-28">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brass" />
              <span className="eyebrow text-brass">Master Craftsmanship</span>
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
              Fabric restoration case studies
            </h2>
          </div>
          <p className="max-w-md text-sm text-background/70">
            See how specialized care chemistry and precision drying restore fabrics that generic laundromats typically destroy.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="mt-12 flex flex-wrap gap-2 border-b border-background/20 pb-4">
          {caseStudies.map((cs) => (
            <button
              key={cs.id}
              type="button"
              onClick={() => setActiveTab(cs)}
              className={cn(
                "flex items-center gap-2 border px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all",
                activeTab.id === cs.id
                  ? "border-brass bg-brass text-ink font-bold shadow-md"
                  : "border-background/20 bg-background/5 text-background/80 hover:border-background/40 hover:bg-background/10",
              )}
            >
              <span>{cs.title}</span>
            </button>
          ))}
        </div>

        {/* Case Study Content Grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Visual Showcase Box */}
          <div className="relative overflow-hidden border border-background/20 bg-background/5 p-2 lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={activeTab.image}
                alt={activeTab.title}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                {activeTab.tags.map((t) => (
                  <span key={t} className="rounded bg-brass/90 px-3 py-1 text-[11px] font-bold text-ink uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <span className="eyebrow text-brass-soft">{activeTab.category}</span>
              <h3 className="mt-2 font-display text-3xl text-background">{activeTab.title}</h3>
            </div>

            <div className="space-y-4 rounded border border-background/15 bg-background/5 p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-1 size-4 shrink-0 text-destructive" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-background/60">Initial Condition / Challenge</h4>
                  <p className="mt-1 text-sm text-background/90">{activeTab.challenge}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-background/10 pt-4">
                <Sparkles className="mt-1 size-4 shrink-0 text-brass" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-background/60">Spin & Dry Protocol</h4>
                  <p className="mt-1 text-sm text-background/90">{activeTab.solution}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-background/10 pt-4">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-background/60">Verified Result</h4>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{activeTab.result}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-px bg-background/20 p-px">
              {activeTab.stats.map((s) => (
                <div key={s.label} className="bg-ink p-4 text-center">
                  <span className="font-display text-2xl text-brass">{s.value}</span>
                  <span className="mt-1 block text-[11px] text-background/60 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
