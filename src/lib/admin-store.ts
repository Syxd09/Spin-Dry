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

export type CMSData = {
  services: Service[];
  testimonials: TestimonialItem[];
  journey: JourneyStepItem[];
  settings: StudioSettings;
};

const ORDERS_STORAGE_KEY = "spinanddry.bookings";
const CMS_STORAGE_KEY = "spinanddry.cms_data";

// Initial seed orders for immediate out-of-the-box demo
const seedOrders: AdminOrder[] = [
  {
    reference: "SD-849201",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Ananya Rao",
    phone: "+91 98450 12345",
    email: "ananya.rao@gmail.com",
    customerType: "residential",
    logistics: "pickup-delivery",
    date: new Date().toISOString().slice(0, 10),
    slot: "10:00 – 12:00",
    address: "Villa 14, Prestige Park Grove, Kanakapura Road, JP Nagar 9th Phase, Bengaluru",
    pincode: "560078",
    coords: { lat: 12.8821, lng: 77.5752 },
    distanceKm: 2.1,
    status: "Inspected & Quoted",
    paymentStatus: "Pending",
    isExpress: true,
    notes: "Living room velvet blackout drapes (14 ft) - handle pleats carefully, no water.",
    items: [
      { serviceSlug: "curtains-and-drapes", serviceName: "Curtain & Drape Cleaning", quantity: 6, unitPrice: 450 },
      { serviceSlug: "carpets-and-area-rugs", serviceName: "Carpet & Area Rug Restoration", quantity: 100, unitPrice: 45 },
    ],
    quoteAmount: 7200,
    assignedTechnician: "Master Tech Ramesh V.",
  },
  {
    reference: "SD-739102",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    customerName: "The Olive Boutique Hotel",
    phone: "+91 98860 99887",
    email: "housekeeping@olivehotel.in",
    customerType: "commercial",
    logistics: "pickup-delivery",
    date: new Date().toISOString().slice(0, 10),
    slot: "08:00 – 10:00",
    address: "Block A, 14th Cross Rd, JP Nagar 2nd Phase, Bengaluru",
    pincode: "560078",
    coords: { lat: 12.9092, lng: 77.5921 },
    distanceKm: 4.8,
    status: "In Processing",
    paymentStatus: "Pending",
    isExpress: false,
    notes: "Commercial bed linen & plush bath towels batch 4B.",
    items: [
      { serviceSlug: "hotel-and-commercial-linen", serviceName: "Commercial & Hotel Linen", quantity: 150, unitPrice: 80 },
    ],
    quoteAmount: 12000,
    assignedTechnician: "Logistics Specialist Suresh K.",
  },
  {
    reference: "SD-950311",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customerName: "Sandeep Varma",
    phone: "+91 99001 88223",
    email: "sandeep.v@outlook.com",
    customerType: "residential",
    logistics: "pickup-delivery",
    date: new Date().toISOString().slice(0, 10),
    slot: "14:00 – 16:00",
    address: "Flat 402, Royal Palms Apartments, Narayana Nagar 1st Block, Konanakunte, Bengaluru",
    pincode: "560062",
    coords: { lat: 12.8761, lng: 77.5652 },
    distanceKm: 0.3,
    status: "QC Passed",
    paymentStatus: "Paid - UPI",
    isExpress: false,
    notes: "Goose down king comforter & 4 silk cushion covers.",
    items: [
      { serviceSlug: "comforters-and-duvets", serviceName: "Comforter & Duvet Cleaning", quantity: 2, unitPrice: 550 },
      { serviceSlug: "sofa-and-cushion-covers", serviceName: "Sofa & Cushion Cover Cleaning", quantity: 4, unitPrice: 250 },
    ],
    quoteAmount: 2100,
    assignedTechnician: "Senior Tech Vikram P.",
  },
  {
    reference: "SD-441299",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    customerName: "Priya Kulkarni",
    phone: "+91 97412 33445",
    email: "priya.designs@gmail.com",
    customerType: "residential",
    logistics: "drop-off",
    date: new Date().toISOString().slice(0, 10),
    slot: "16:00 – 18:00",
    address: "Studio Direct Drop-off - Jayanagar 4th Block, Bengaluru",
    pincode: "560041",
    coords: { lat: 12.9250, lng: 77.5838 },
    distanceKm: 5.9,
    status: "Completed",
    paymentStatus: "Paid - Card",
    isExpress: true,
    notes: "Hand-knotted Silk Persian Rug (10x14 ft) - wine stain lift.",
    items: [
      { serviceSlug: "carpets-and-area-rugs", serviceName: "Carpet & Area Rug Restoration", quantity: 140, unitPrice: 45 },
    ],
    quoteAmount: 6300,
    assignedTechnician: "Master Tech Ramesh V.",
  },
];

const defaultCMSData: CMSData = {
  services: initialServices,
  testimonials: initialTestimonials.map((t, idx) => ({ id: `test-${idx + 1}`, ...t })),
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
    return JSON.parse(raw) as CMSData;
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
