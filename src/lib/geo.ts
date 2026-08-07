export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const mapsBrowserKey: string | undefined = import.meta.env[
  "VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"
] as string | undefined;

type MapsApi = Record<string, unknown>;

let mapsPromise: Promise<MapsApi | null> | null = null;

/**
 * Loads the Google Maps JS API (Places included) when a browser key is
 * configured. Resolves to null when no key is present so the booking flow can
 * fall back to manual address entry + browser geolocation.
 */
export function loadGoogleMaps(): Promise<MapsApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!mapsBrowserKey) return Promise.resolve(null);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve) => {
    const w = window as unknown as Record<string, unknown>;
    if (w["google"]) return resolve(w["google"] as MapsApi);
    const cbName = "__spinDryMapsReady";
    w[cbName] = () => resolve(w["google"] as MapsApi);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsBrowserKey}&libraries=places&loading=async&callback=${cbName}`;
    script.async = true;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return mapsPromise;
}