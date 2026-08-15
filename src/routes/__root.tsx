import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { useSiteSettings } from "@/lib/use-site-settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Spin & Dry — Professional Fabric Care & Laundry" },
      {
        name: "description",
        content:
          "Professional fabric care studio for curtains, carpets, bedding, upholstery and commercial linen. Free pickup and delivery within 10 km.",
      },
      { name: "author", content: "Spin & Dry" },
      { property: "og:site_name", content: "Spin & Dry" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const isAdmin = router.state.location.pathname.startsWith("/admin");
  const siteSettings = useSiteSettings();

  // Format hours array to Schema specification
  const schemaHours = siteSettings.hours && siteSettings.hours.length > 0
    ? siteSettings.hours.map((h) => {
        const daysMap: Record<string, string> = {
          "Mon - Sat": "Mo-Sa",
          "Sun": "Su",
          "Monday - Saturday": "Mo-Sa",
          "Sunday": "Su"
        };
        const cleanDays = daysMap[h.days] || h.days;
        const cleanTime = h.time.replace(/ – /g, "-").replace(/ - /g, "-").replace(/ AM/gi, "").replace(/ PM/gi, "");
        return `${cleanDays} ${cleanTime}`;
      })
    : ["Mo-Sa 08:00-20:00", "Su 08:00-13:00"];

  return (
    <QueryClientProvider client={queryClient}>
      {/* Dynamic SEO Business Schema Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://spinanddry.com/#business",
            name: siteSettings.name || "Spin & Dry",
            description: siteSettings.description || "Professional fabric care and laundry studio.",
            telephone: siteSettings.phone || "+91 98765 43210",
            email: siteSettings.email || "care@spinanddry.com",
            address: {
              "@type": "PostalAddress",
              streetAddress: siteSettings.address || "14th Cross Rd, Narayana Nagar 1st Block, Konanakunte",
              addressLocality: "Bengaluru",
              postalCode: "560062",
              addressCountry: "IN",
            },
            geo: { "@type": "GeoCoordinates", latitude: 12.880174, longitude: 77.5517447 },
            areaServed: {
              "@type": "GeoCircle",
              geoMidpoint: { "@type": "GeoCoordinates", latitude: 12.880174, longitude: 77.5517447 },
              geoRadius: String((siteSettings.pickupRadiusKm || 10) * 1000),
            },
            openingHours: schemaHours,
            priceRange: "$$",
          }),
        }}
      />
      <div className="flex min-h-screen flex-col">
        {!isAdmin && <SiteHeader />}
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        {!isAdmin && <SiteFooter />}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
