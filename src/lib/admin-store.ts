import { site, testimonials as initialTestimonials, journey as initialJourney } from "@/data/site";
import { services as initialServices, Service } from "@/data/services";
import { haversineKm } from "@/lib/geo";

// --- ORDERS TYPES ---
export type OrderStatus =
  | "Pending Intake"
  | "Inspected & Quoted"
  | "In Processing"
  | "QC Passed"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Paid - UPI" | "Paid - Card" | "Paid - Cash";

export type AdminOrderItem = {
  serviceSlug: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  reference: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  customerType: "residential" | "commercial";
  logistics: "pickup-delivery" | "drop-off";
  date: string;
  slot: string;
  address: string;
  pincode: string;
  coords: { lat: number; lng: number } | null;
  distanceKm: number | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  isExpress: boolean;
  notes: string;
  cancellationReason?: string;
  adminAlert?: string;
  items: AdminOrderItem[];
  quoteAmount: number;
  assignedTechnician?: string;
};

// --- CMS TYPES ---
export type TestimonialItem = {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
};

export type JourneyStepItem = {
  step: string;
  title: string;
  body: string;
};

export type StudioSettings = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  pickupRadiusKm: number;
  founded: number;
  hours: { days: string; time: string }[];
};

export type BeforeAfterItem = {
  id: string;
  title: string;
  serviceName: string;
  beforeImage: string;
  afterImage: string;
  description: string;
};

export type CaseStudyStat = { label: string; value: string };

export type CaseStudy = {
  id: string;
  title: string;
  category: string;
  challenge: string;
  solution: string;
  result: string;
  stats: CaseStudyStat[];
  image: string;
  tags: string;
};

export type CMSData = {
  services: Service[];
  testimonials: TestimonialItem[];
  journey: JourneyStepItem[];
  settings: StudioSettings;
  beforeAfterGallery: BeforeAfterItem[];
  heroSlides: string[];
  caseStudies: CaseStudy[];
};

const ORDERS_STORAGE_KEY = "spinanddry.bookings";
const CMS_STORAGE_KEY = "spinanddry.cms_data";

// Initial seed orders for immediate out-of-the-box demo (disabled to use real data only)
const seedOrders: AdminOrder[] = [];

const seedBeforeAfter: BeforeAfterItem[] = [
  {
    id: "ba-1",
    title: "Living Room Blackout Drapes",
    serviceName: "Curtain & Drape Restoration",
    beforeImage: "/assets/curtain_before.jpg",
    afterImage: "/assets/curtain_after.jpg",
    description: "Deep dust buildup, body oil discolouration, and grease spots completely restored to original loft and luster.",
  },
  {
    id: "ba-2",
    title: "Luxury Linen Sofa Cushion",
    serviceName: "Upholstery & Sofa Care",
    beforeImage: "/assets/sofa_before.jpg",
    afterImage: "/assets/sofa_after.jpg",
    description: "Dark coffee spillages, embedded dust rings, and fabric discoloration deep cleaned using low-moisture organic extraction.",
  },
];

const defaultCMSData: CMSData = {
  services: initialServices,
  testimonials: initialTestimonials.map((t, idx) => ({ id: `test-${idx + 1}`, rating: 5, ...t })),
  journey: initialJourney.map((j) => ({ ...j })),
  settings: {
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
  },
  beforeAfterGallery: seedBeforeAfter,
  heroSlides: [
    "https://images.unsplash.com/photo-1545173168-9f19472c043a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80"
  ],
  caseStudies: [
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
      image: "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=1200&q=80",
      tags: "Hand-knotted Silk, Stain Extraction, Fringe Restoration",
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
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      tags: "Floor-to-Ceiling Drapes, Zero Shrinkage, Vertical Steam Press",
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
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      tags: "Goose Down, Loft Revival, Ozone Anti-Allergen",
    },
  ],
};

// --- ORDERS METHODS ---
export function getStoredOrders(): AdminOrder[] {
  if (typeof window === "undefined") return seedOrders;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seedOrders));
      return seedOrders;
    }
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seedOrders));
      return seedOrders;
    }

    return parsed.map((o) => {
      const items: AdminOrderItem[] = o.items || (o.serviceSlugs || []).map((slug: string) => ({
        serviceSlug: slug,
        serviceName: slug.replace(/-/g, " ").toUpperCase(),
        quantity: o.itemQuantities?.[slug] || 1,
        unitPrice: 500,
      }));

      const quote = o.quoteAmount || items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) || 1200;
      const distance = o.distanceKm ?? (o.coords ? haversineKm(site.coords, o.coords) : 3.5);

      return {
        reference: o.reference || `SD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        createdAt: o.createdAt || new Date().toISOString(),
        customerName: o.customerName || o.name || "Valued Client",
        phone: o.phone || "+91 98000 00000",
        email: o.email || "client@spinanddry.com",
        customerType: o.customerType || "residential",
        logistics: o.logistics || "pickup-delivery",
        date: o.date || new Date().toISOString().slice(0, 10),
        slot: o.slot || "10:00 – 12:00",
        address: o.address || "Bengaluru Address",
        pincode: o.pincode || "560062",
        coords: o.coords || site.coords,
        distanceKm: distance,
        status: o.status || "Pending Intake",
        paymentStatus: o.paymentStatus || "Pending",
        isExpress: !!o.isExpress,
        notes: o.notes || "",
        cancellationReason: o.cancellationReason || undefined,
        adminAlert: o.adminAlert || undefined,
        items: items.length > 0 ? items : [{ serviceSlug: "curtains-and-drapes", serviceName: "Curtain Cleaning", quantity: 1, unitPrice: 450 }],
        quoteAmount: quote,
        assignedTechnician: o.assignedTechnician || "Studio Care Team",
      };
    });
  } catch {
    return seedOrders;
  }
}

export function saveOrders(orders: AdminOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to save orders to localStorage:", err);
  }
}

export function saveSingleOrder(order: AdminOrder): AdminOrder[] {
  const current = getStoredOrders();
  const index = current.findIndex((o) => o.reference === order.reference);
  let updated: AdminOrder[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = order;
  } else {
    updated = [order, ...current];
  }
  saveOrders(updated);
  return updated;
}

export function updateOrderStatus(reference: string, newStatus: OrderStatus): AdminOrder[] {
  const current = getStoredOrders();
  const updated = current.map((o) => {
    if (o.reference === reference) {
      return { ...o, status: newStatus };
    }
    return o;
  });
  saveOrders(updated);
  return updated;
}

export function deleteOrder(reference: string): AdminOrder[] {
  const current = getStoredOrders();
  const updated = current.filter((o) => o.reference !== reference);
  saveOrders(updated);
  return updated;
}

export function resetToSeedOrders(): AdminOrder[] {
  saveOrders(seedOrders);
  return seedOrders;
}

export function batchUpdateStatus(references: string[], newStatus: OrderStatus): AdminOrder[] {
  const current = getStoredOrders();
  const refSet = new Set(references);
  const updated = current.map((o) => {
    if (refSet.has(o.reference)) {
      return { ...o, status: newStatus };
    }
    return o;
  });
  saveOrders(updated);
  return updated;
}

export function exportOrdersCSV(orders: AdminOrder[]): void {
  if (typeof window === "undefined" || orders.length === 0) return;

  const headers = [
    "Reference",
    "Created Date",
    "Customer Name",
    "Phone",
    "Email",
    "Customer Type",
    "Logistics",
    "Scheduled Date",
    "Slot",
    "Address",
    "Pincode",
    "Distance (km)",
    "Status",
    "Payment Status",
    "24h Express",
    "Quote Amount (INR)",
    "Assigned Tech",
    "Notes",
  ];

  const rows = orders.map((o) => [
    `"${o.reference}"`,
    `"${new Date(o.createdAt).toLocaleDateString()}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.phone}"`,
    `"${o.email}"`,
    `"${o.customerType}"`,
    `"${o.logistics}"`,
    `"${o.date}"`,
    `"${o.slot}"`,
    `"${o.address.replace(/"/g, '""')}"`,
    `"${o.pincode}"`,
    `"${o.distanceKm?.toFixed(1) || ""}"`,
    `"${o.status}"`,
    `"${o.paymentStatus}"`,
    `"${o.isExpress ? "YES" : "NO"}"`,
    `"${o.quoteAmount}"`,
    `"${(o.assignedTechnician || "").replace(/"/g, '""')}"`,
    `"${(o.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `spin_and_dry_orders_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function calculateMetrics(orders: AdminOrder[]) {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;
  const pendingIntake = orders.filter((o) => o.status === "Pending Intake").length;
  const inProcessing = orders.filter((o) => o.status === "In Processing").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPickups = orders.filter((o) => o.date === todayStr && o.status !== "Cancelled").length;
  const grossRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.quoteAmount || 0), 0);
  const expressOrders = orders.filter((o) => o.isExpress && o.status !== "Cancelled").length;

  const residentialCount = orders.filter((o) => o.customerType === "residential").length;
  const commercialCount = orders.filter((o) => o.customerType === "commercial").length;

  const within10kmCount = orders.filter((o) => (o.distanceKm || 0) <= 10).length;
  const outside10kmCount = orders.filter((o) => (o.distanceKm || 0) > 10).length;

  const avgOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

  return {
    totalOrders,
    activeOrders,
    pendingIntake,
    inProcessing,
    completedCount,
    cancelledCount,
    todayPickups,
    grossRevenue,
    expressOrders,
    residentialCount,
    commercialCount,
    within10kmCount,
    outside10kmCount,
    avgOrderValue,
  };
}

// --- CMS METHODS ---
export function getStoredCMS(): CMSData {
  if (typeof window === "undefined") return defaultCMSData;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(defaultCMSData));
      return defaultCMSData;
    }
    const parsed = JSON.parse(raw) as CMSData;
    let modified = false;
    if (!parsed.beforeAfterGallery || !Array.isArray(parsed.beforeAfterGallery) || parsed.beforeAfterGallery.length === 0) {
      parsed.beforeAfterGallery = defaultCMSData.beforeAfterGallery;
      modified = true;
    }
    if (!parsed.heroSlides || !Array.isArray(parsed.heroSlides) || parsed.heroSlides.length === 0) {
      parsed.heroSlides = defaultCMSData.heroSlides;
      modified = true;
    }
    if (!parsed.caseStudies || !Array.isArray(parsed.caseStudies) || parsed.caseStudies.length === 0) {
      parsed.caseStudies = defaultCMSData.caseStudies;
      modified = true;
    }
    if (modified) {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return defaultCMSData;
  }
}

export function saveCMS(cms: CMSData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cms));
  } catch (err) {
    console.error("Failed to save CMS to localStorage:", err);
  }
}

export function resetCMS(): CMSData {
  saveCMS(defaultCMSData);
  return defaultCMSData;
}

// --- LEADS MANAGEMENT ---
export type LeadStatus = "New" | "Contacted" | "Resolved";

export type ContactLead = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: LeadStatus;
};

const LEADS_STORAGE_KEY = "spinanddry.leads";

export function getStoredLeads(): ContactLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContactLead[];
  } catch {
    return [];
  }
}

export function saveLead(lead: Omit<ContactLead, "id" | "createdAt" | "status">): ContactLead[] {
  if (typeof window === "undefined") return [];
  const current = getStoredLeads();
  const newLead: ContactLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "New",
  };
  const updated = [newLead, ...current];
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteLead(id: string): ContactLead[] {
  if (typeof window === "undefined") return [];
  const current = getStoredLeads();
  const updated = current.filter((l) => l.id !== id);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateLeadStatus(id: string, status: LeadStatus): ContactLead[] {
  if (typeof window === "undefined") return [];
  const current = getStoredLeads();
  const updated = current.map((l) => {
    if (l.id === id) {
      return { ...l, status };
    }
    return l;
  });
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function submitReview(review: Omit<TestimonialItem, "id">): CMSData {
  const current = getStoredCMS();
  const newReview: TestimonialItem = {
    ...review,
    id: `test-${Date.now()}`,
    rating: review.rating || 5,
  };
  const updatedCMS = {
    ...current,
    testimonials: [newReview, ...(current.testimonials || [])],
  };
  saveCMS(updatedCMS);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cms-updated"));
  }
  return updatedCMS;
}

export function getGarmentAbbreviation(name: string): string {
  const clean = name.toLowerCase();
  if (clean.includes("shirt")) return "SH";
  if (clean.includes("pant") || clean.includes("trouser") || clean.includes("jeans")) return "PT";
  if (clean.includes("curtain")) return "CU";
  if (clean.includes("carpet") || clean.includes("rug")) return "CP";
  if (clean.includes("blanket") || clean.includes("quilt") || clean.includes("duvet") || clean.includes("comforter")) return "BK";
  if (clean.includes("sofa") || clean.includes("upholstery") || clean.includes("cushion")) return "SF";
  if (clean.includes("bedsheet") || clean.includes("sheet") || clean.includes("linen")) return "BS";
  if (clean.includes("suit") || clean.includes("blazer")) return "ST";
  if (clean.includes("dress") || clean.includes("frock")) return "DR";
  if (clean.includes("towel")) return "TW";
  if (clean.includes("saree") || clean.includes("sari")) return "SR";
  // Fallback: first and last letters of the first word capitalized
  const words = name.trim().split(/\s+/);
  const firstWord = words[0] || "GM";
  if (firstWord.length >= 2) {
    return (firstWord[0] + firstWord[firstWord.length - 1]).toUpperCase();
  }
  return (firstWord + "X").slice(0, 2).toUpperCase();
}

export type UniqueGarment = {
  id: string; // e.g. SD849201-CU-001
  serviceName: string;
  serviceSlug: string;
  index: number;
  totalQuantity: number;
};

export function generateGarmentsForOrder(order: { reference: string; items: { serviceName: string; serviceSlug: string; quantity: number }[] }): UniqueGarment[] {
  const garments: UniqueGarment[] = [];
  const cleanRef = order.reference.replace(/[^a-zA-Z0-9]/g, "");

  order.items.forEach((item) => {
    const abbrev = getGarmentAbbreviation(item.serviceName);
    const qty = item.quantity || 0;
    for (let i = 1; i <= qty; i++) {
      const idxStr = String(i).padStart(3, "0");
      garments.push({
        id: `${cleanRef}-${abbrev}-${idxStr}`,
        serviceName: item.serviceName,
        serviceSlug: item.serviceSlug,
        index: i,
        totalQuantity: qty,
      });
    }
  });

  return garments;
}
