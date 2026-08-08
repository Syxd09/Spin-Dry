import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone, CalendarCheck, MessageSquare } from "lucide-react";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "Studio" },
  { to: "/coverage", label: "Coverage" },
  { to: "/track", label: "Track Order" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Announcement & Concierge Bar */}
      <div className="border-b border-border/60 bg-ink px-5 py-2 text-xs text-background/80 md:px-10">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Studio Open Today · Konanakunte, Bengaluru</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/track" className="font-semibold text-brass hover:underline flex items-center gap-1">
              📍 Track Order
            </Link>
            <span className="hidden sm:inline">Free Doorstep Pickup within {site.pickupRadiusKm} km</span>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brass hover:text-brass-soft transition-colors"
            >
              <MessageSquare className="size-3" /> WhatsApp Care Concierge
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "border-b border-border/80 bg-background/90 backdrop-blur-md shadow-sm"
            : "border-b border-border/40 bg-background/70 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-5 md:px-10">
          <Link to="/" aria-label="Spin & Dry home" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative py-1 text-sm font-medium text-ink-soft transition-colors hover:text-foreground group"
                activeProps={{ className: "text-foreground font-semibold" }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-brass transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-brass transition-colors md:flex"
            >
              <Phone className="size-3.5 text-brass" aria-hidden />
              {site.phone}
            </a>

            <Link
              to="/book"
              className="hidden items-center gap-2 bg-ink px-6 py-3 text-xs font-semibold tracking-[0.16em] text-background uppercase transition-transform hover:-translate-y-0.5 hover:bg-ink/90 sm:flex"
            >
              <CalendarCheck className="size-3.5 text-brass" />
              Book pickup
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex size-11 items-center justify-center border border-border bg-background lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="fixed inset-x-0 top-[110px] bottom-0 z-40 overflow-y-auto border-t border-border bg-background/98 backdrop-blur-xl px-5 py-8 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-4 font-display text-2xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <p className="eyebrow text-brass">16 Fabric Care Services</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    onClick={() => setOpen(false)}
                    className="text-xs text-ink-soft hover:text-foreground"
                  >
                    • {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/book"
            onClick={() => setOpen(false)}
            className="mt-8 block bg-brass py-4 text-center text-xs font-bold tracking-[0.16em] text-ink uppercase"
          >
            Book a pickup
          </Link>
        </div>
      )}
    </header>
  );
}