/**
 * useSiteSettings
 *
 * A hook that reads the live CMS StudioSettings from localStorage.
 * Whenever the Admin Panel saves settings, this hook picks them up.
 * Falls back to the static site defaults when no CMS data is saved yet.
 */
import { useState, useEffect } from "react";
import { site } from "@/data/site";
import type { StudioSettings } from "@/lib/admin-store";
import { getStoredCMS } from "@/lib/admin-store";
import { Service, services as defaultServices } from "@/data/services";

const staticDefaults: StudioSettings = {
  name: site.name,
  tagline: site.tagline,
  description: site.description,
  phone: site.phone,
  phoneHref: site.phoneHref,
  whatsapp: site.whatsapp,
  email: site.email,
  address: site.address,
  pickupRadiusKm: site.pickupRadiusKm,
  founded: site.founded,
  hours: [...site.hours],
};

function readSettings(): StudioSettings {
  try {
    const cms = getStoredCMS();
    if (cms?.settings) {
      return { ...staticDefaults, ...cms.settings };
    }
  } catch {
    // ignore
  }
  return staticDefaults;
}

/**
 * Reactive hook - re-reads settings whenever localStorage changes
 * (cross-tab via storage event, same-tab via a custom cms-updated event).
 */
export function useSiteSettings(): StudioSettings {
  const [settings, setSettings] = useState<StudioSettings>(readSettings);

  useEffect(() => {
    function onStorage() {
      setSettings(readSettings());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("cms-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cms-updated", onStorage);
    };
  }, []);

  return settings;
}

/**
 * Non-reactive getter for one-shot reads (coverage checks, booking validation, etc.)
 */
export function getSiteSettings(): StudioSettings {
  return readSettings();
}

function readServices(): Service[] {
  try {
    const cms = getStoredCMS();
    if (cms?.services && cms.services.length > 0) {
      return cms.services;
    }
  } catch {
    // ignore
  }
  return defaultServices;
}

export function useCMSServices(): Service[] {
  const [list, setList] = useState<Service[]>(readServices);

  useEffect(() => {
    function onStorage() {
      setList(readServices());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("cms-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cms-updated", onStorage);
    };
  }, []);

  return list;
}
