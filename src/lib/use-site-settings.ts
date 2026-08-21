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
  isClosedManually: false,
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

function parseSingleTime(str: string): number | null {
  const match = str.trim().match(/^(\d+)(?::(\d+))?\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = parseInt(match[1] || "0", 10);
  const min = parseInt(match[2] || "0", 10);
  const ampm = (match[3] || "").toUpperCase();

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return hour * 60 + min;
}

function parseTimeString(timeStr: string): { startMinutes: number; endMinutes: number } | null {
  try {
    const normalized = timeStr.replace(/–/g, "-").replace(/—/g, "-").replace(/\s+/g, "");
    const parts = normalized.split("-");
    if (parts.length !== 2) return null;

    const start = parseSingleTime(parts[0] || "");
    const end = parseSingleTime(parts[1] || "");
    if (start === null || end === null) return null;

    return { startMinutes: start, endMinutes: end };
  } catch {
    return null;
  }
}

export function getStudioStatus(settings: StudioSettings): { isOpen: boolean; label: string } {
  if (settings.isClosedManually) {
    return { isOpen: false, label: "Studio Closed (Holiday/Concierge Pause)" };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 1-6 = Mon-Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const matchingHourConfig = settings.hours.find((h) => {
    const daysLower = h.days.toLowerCase();
    if (currentDay === 0) {
      return daysLower.includes("sun") || daysLower.includes("sunday");
    } else {
      return (
        daysLower.includes("mon") ||
        daysLower.includes("sat") ||
        daysLower.includes("tue") ||
        daysLower.includes("wed") ||
        daysLower.includes("thu") ||
        daysLower.includes("fri") ||
        daysLower.includes("weekday") ||
        daysLower.includes("monday") ||
        daysLower.includes("saturday")
      );
    }
  });

  if (!matchingHourConfig) {
    return { isOpen: false, label: "Studio Closed Today" };
  }

  const timeRange = parseTimeString(matchingHourConfig.time);
  if (!timeRange) {
    const start = 8 * 60; // 8:00 AM
    const end = currentDay === 0 ? 13 * 60 : 20 * 60; // 1:00 PM or 8:00 PM
    const open = currentMinutes >= start && currentMinutes < end;
    return { isOpen: open, label: open ? "Studio Open Today" : "Studio Closed Now" };
  }

  const open = currentMinutes >= timeRange.startMinutes && currentMinutes < timeRange.endMinutes;
  return { isOpen: open, label: open ? "Studio Open Today" : "Studio Closed Now" };
}
