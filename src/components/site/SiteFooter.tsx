import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { services } from "@/data/services";
import { useSiteSettings } from "@/lib/use-site-settings";

export function SiteFooter() {
  const site = useSiteSettings();
  return (
    <footer className="bg-ink text-background/80">
      <div className="mx-auto max-w-[88rem] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Spin & Dry Logo"
                className="size-11 rounded-full object-cover border-2 border-brass/60 shadow-lg"
              />
              <p className="font-display text-3xl text-background font-bold">
                Spin <span className="text-brass">&amp;</span> Dry
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Professional fabric care and laundry studio. Curtains, carpets, bedding, upholstery
              and commercial linen, with free pickup and delivery inside {site.pickupRadiusKm} km.
            </p>
            <address className="mt-6 text-sm not-italic">
              {site.address}
              <br />
              <a href={site.phoneHref} className="text-brass-soft">
                {site.phone}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="text-brass-soft">
                {site.email}
              </a>
            </address>
          </div>

          <nav aria-label="Services" className="lg:col-span-2">
            <p className="eyebrow text-brass">Services</p>
            <ul className="mt-5 grid gap-2.5 text-sm sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="transition-colors hover:text-background"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow text-brass">Company</p>
            <ul className="mt-5 grid gap-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-background">
                  The studio
                </Link>
              </li>
              <li>
                <Link to="/process" className="hover:text-background">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/coverage" className="hover:text-background">
                  Pickup coverage
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-background">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-background">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-brass-soft">
                  Book a pickup
                </Link>
              </li>
              <li>
                <Link to="/track" search={{ ref: "", phone: "" }} className="text-brass font-semibold hover:underline inline-flex items-center gap-1">
                  <MapPin className="size-3 text-brass" /> Track Order Live
                </Link>
              </li>
            </ul>
            <p className="eyebrow mt-8 text-brass">Hours</p>
            <ul className="mt-4 grid gap-1.5 text-sm">
              {site.hours.map((h) => (
                <li key={h.days}>
                  {h.days}
                  <span className="block text-background/60">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-background/15 pt-8 text-xs text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Professional fabric care since {site.founded}.
          </p>
          <p>Free pickup &amp; delivery within {site.pickupRadiusKm} km of the studio.</p>
        </div>
      </div>
    </footer>
  );
}