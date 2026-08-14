import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowLeftRight } from "lucide-react";
import { BeforeAfterItem } from "@/lib/admin-store";

export function BeforeAfterSlider({ items }: { items: BeforeAfterItem[] }) {
  if (!items || items.length === 0) return null;

  const [activeItem, setActiveItem] = useState<BeforeAfterItem>(items[0]!);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <section className="border-b border-border bg-background px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brass" />
              <span className="eyebrow text-brass">Restoration Gallery</span>
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
              Visual Proof of Master Care
            </h2>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Slide the divider left and right to inspect the fabric condition before and after our signature restoration cycles.
            </p>
          </div>
        </div>

        {/* Interactive Slider Container */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div 
            ref={containerRef}
            className="relative h-[480px] w-full overflow-hidden select-none border border-border shadow-lg cursor-ew-resize rounded-xl bg-slate-100"
            onMouseDown={(e) => {
              e.preventDefault();
              isDragging.current = true;
              handleMove(e.clientX);
            }}
            onMouseMove={(e) => {
              if (isDragging.current) handleMove(e.clientX);
            }}
            onTouchStart={() => {
              isDragging.current = true;
            }}
            onTouchMove={(e) => {
              if (isDragging.current && e.touches[0]) handleMove(e.touches[0].clientX);
            }}
          >
            {/* Before Image (Background) */}
            <img 
              src={activeItem.beforeImage} 
              alt="Before Restoration" 
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 left-4 z-10 rounded bg-ink/75 px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-white uppercase backdrop-blur-xs">
              Before Care (Dirty)
            </div>

            {/* After Image (Overlay, width controlled by sliderPosition) */}
            <div 
              className="absolute inset-y-0 left-0 right-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img 
                src={activeItem.afterImage} 
                alt="After Restoration" 
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                style={{ width: containerRef.current?.getBoundingClientRect().width || "100%" }}
              />
            </div>
            <div className="absolute top-4 right-4 z-10 rounded bg-brass/90 px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-ink uppercase backdrop-blur-xs">
              After Clean (Pristine)
            </div>

            {/* Slider Line Divider & Drag Handle */}
            <div 
              className="absolute inset-y-0 z-20 w-0.5 bg-brass cursor-ew-resize pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -left-5 -translate-y-1/2 flex size-10 items-center justify-center rounded-full border border-brass bg-ink text-brass shadow-lg cursor-ew-resize">
                <ArrowLeftRight className="size-4" />
              </div>
            </div>
          </div>

          {/* Text Details & Sidebar Cards */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="eyebrow text-brass font-bold text-xs uppercase tracking-wider block">
                {activeItem.serviceName}
              </span>
              <h3 className="font-display text-3xl text-foreground font-bold leading-tight">
                {activeItem.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-soft">
                {activeItem.description}
              </p>
            </div>

            {/* Thumbnail Cards Grid */}
            <div className="space-y-4">
              <span className="eyebrow text-muted-foreground text-[10px] uppercase tracking-wider block">
                Select Case Study
              </span>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {items.map((item) => {
                  const isActive = item.id === activeItem.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveItem(item);
                        setSliderPosition(50);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "border-brass bg-brass/5 shadow-xs"
                          : "border-border bg-card hover:border-brass/50 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="font-bold text-sm text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{item.serviceName}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
