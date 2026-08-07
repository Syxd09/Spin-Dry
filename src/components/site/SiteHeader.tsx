import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "Studio" },
  { to: "/coverage", label: "Coverage" },
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
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-500",
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "bg-transparent",
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
              className="link-underline text-sm text-ink-soft transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 text-sm text-ink-soft transition-colors hover:text-foreground md:flex"
          >
            <Phone className="size-3.5" aria-hidden />
            {site.phone}
          </a>
          <Link
            to="/book"
            className="hidden bg-ink px-5 py-3 text-xs font-semibold tracking-[0.16em] text-background uppercase transition-colors hover:bg-ink-soft sm:inline-block"
          >
            Book pickup
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto border-t border-border bg-background px-5 py-8 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 font-display text-2xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="eyebrow mt-8 text-muted-foreground">All services</p>
          <ul className="mt-3 grid gap-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  onClick={() => setOpen(false)}
                  className="text-sm text-ink-soft"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/book"
            onClick={() => setOpen(false)}
            className="mt-8 block bg-ink py-4 text-center text-xs font-semibold tracking-[0.16em] text-background uppercase"
          >
            Book a pickup
          </Link>
        </div>
      )}
    </header>
  );
}