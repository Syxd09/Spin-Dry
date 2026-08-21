import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Truck,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Package,
  Lock,
  LogOut,
  Sliders,
  Sparkles,
  LayoutDashboard,
  Tag,
  MessageCircle,
  Settings,
  Menu,
  Save,
  Check,
  BarChart3,
  Download,
  CheckSquare,
  Square,
  Zap,
  TrendingUp,
  Building2,
  Home,
  Megaphone,
  Navigation,
  ArrowLeftRight,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Inbox,
  Mail,
  PhoneCall,
} from "lucide-react";
import { site } from "@/data/site";
import { services as defaultServices, Service, servicePricingData } from "@/data/services";
import {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  CMSData,
  BeforeAfterItem,
  TestimonialItem,
  JourneyStepItem,
  StudioSettings,
  ContactLead,
  LeadStatus,
  CaseStudy,
  CaseStudyStat,
  calculateMetrics,
  deleteOrder,
  getStoredOrders,
  resetToSeedOrders,
  saveSingleOrder,
  updateOrderStatus,
  batchUpdateStatus,
  exportOrdersCSV,
  getStoredCMS,
  saveCMS,
  resetCMS,
  getStoredLeads,
  deleteLead,
  updateLeadStatus,
  generateGarmentsForOrder,
  UniqueGarment,
} from "@/lib/admin-store";
import { cn } from "@/lib/utils";

const AUTH_KEY = "spinanddry.admin_auth";

const ADMIN_USER_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // SHA-256 of "admin"
const ADMIN_PASS_HASH = "c7bd452a9a4081cf2b717e4f2dd29ecd678e50e9dbea3b32dd8877c3aeb39579"; // SHA-256 of "spinanddry123"

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Spin & Dry" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type SidebarTab = "orders" | "analytics" | "leads" | "services" | "hero" | "gallery" | "casestudies" | "testimonials" | "process" | "settings";

const statusPipeline: OrderStatus[] = [
  "Pending Intake",
  "Inspected & Quoted",
  "In Processing",
  "QC Passed",
  "Out for Delivery",
  "Completed",
];

const statusColors: Record<OrderStatus, string> = {
  "Pending Intake": "bg-amber-100 text-amber-900 border-amber-300",
  "Inspected & Quoted": "bg-blue-100 text-blue-900 border-blue-300",
  "In Processing": "bg-indigo-100 text-indigo-900 border-indigo-300",
  "QC Passed": "bg-emerald-100 text-emerald-900 border-emerald-300",
  "Out for Delivery": "bg-purple-100 text-purple-900 border-purple-300",
  Completed: "bg-slate-100 text-slate-800 border-slate-300",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-300",
};

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<SidebarTab>("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);
  const [printStickerOrder, setPrintStickerOrder] = useState<AdminOrder | null>(null);

  // CMS State
  const [cms, setCms] = useState<CMSData>(getStoredCMS());
  const [cmsSaveMsg, setCmsSaveMsg] = useState("");

  // Filters & Batch
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expressOnly, setExpressOnly] = useState(false);
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth === "true") {
        setIsAuthenticated(true);
        setOrders(getStoredOrders());
        setCms(getStoredCMS());
      }
    }
  }, []);

  function handleQuickAdvance(ref: string, currentStatus: OrderStatus) {
    const currentIdx = statusPipeline.indexOf(currentStatus);
    if (currentIdx >= 0 && currentIdx < statusPipeline.length - 1) {
      const nextStatus = statusPipeline[currentIdx + 1];
      if (nextStatus) {
        handleStatusChange(ref, nextStatus);
      }
    }
  }

  function handleBatchAdvance(newStatus: OrderStatus) {
    if (selectedRefs.length === 0) return;
    const updated = batchUpdateStatus(selectedRefs, newStatus);
    setOrders(updated);
    setSelectedRefs([]);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const userHash = await sha256(usernameInput.trim());
    const passHash = await sha256(passwordInput);

    const currentPassHash = localStorage.getItem("spinanddry.admin_pass_hash") || ADMIN_PASS_HASH;

    if (userHash === ADMIN_USER_HASH && passHash === currentPassHash) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setOrders(getStoredOrders());
      setCms(getStoredCMS());
    } else {
      setAuthError("Invalid admin username or password. Please try again.");
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
    setAuthError("");
  }

  function handleSaveCMSData(updated: CMSData) {
    saveCMS(updated);
    setCms(updated);
    window.dispatchEvent(new Event("cms-updated"));
    setCmsSaveMsg("CMS changes saved successfully!");
    setTimeout(() => setCmsSaveMsg(""), 3000);
  }

  function handleResetAllCMS() {
    if (confirm("Reset all CMS content (Services, Testimonials, Process steps, Settings) to default?")) {
      const res = resetCMS();
      setCms(res);
      setCmsSaveMsg("All CMS content restored to default!");
      setTimeout(() => setCmsSaveMsg(""), 3000);
    }
  }

  const metrics = useMemo(() => calculateMetrics(orders), [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryWithoutHash = query.startsWith("#") ? query.slice(1) : query;

    return orders.filter((o) => {
      const matchSearch =
        o.reference.toLowerCase().includes(query) ||
        o.reference.toLowerCase().includes(queryWithoutHash) ||
        o.customerName.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.pincode.includes(query) ||
        o.address.toLowerCase().includes(query);

      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      const matchExpress = !expressOnly || o.isExpress;

      return matchSearch && matchStatus && matchExpress;
    });
  }, [orders, searchQuery, statusFilter, expressOnly]);

  function handleStatusChange(ref: string, newStatus: OrderStatus) {
    const updated = updateOrderStatus(ref, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.reference === ref) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  }

  function handleDelete(ref: string) {
    if (confirm(`Are you sure you want to cancel and delete order ${ref}?`)) {
      const updated = deleteOrder(ref);
      setOrders(updated);
      if (selectedOrder?.reference === ref) setSelectedOrder(null);
    }
  }

  function getWhatsAppUrl(order: AdminOrder) {
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${order.customerName}! 🧺 Update regarding your Spin & Dry Order #${order.reference}:\n\nStatus: ${order.status.toUpperCase()}\nScheduled Date: ${order.date} (${order.slot})\nAmount: ₹${order.quoteAmount}\n\nOur team is managing your fabric care protocol. Thank you for choosing Spin & Dry!`,
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  // -------------------------------------------------------------
  // SECURE AUTH LOCKSCREEN (If not logged in)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-5 py-12 text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 overflow-hidden shadow-inner mb-4">
              <img src="/logo.png" alt="Spin & Dry Logo" className="size-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Studio Admin Authentication</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Restricted Portal · Spin &amp; Dry Konanakunte Operations
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                className="w-full rounded-none border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPass ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-none border border-slate-700 bg-slate-950 p-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-450 hover:text-white focus:outline-none"
                >
                  {showLoginPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 rounded-none border border-rose-800/50 bg-rose-950/60 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-none bg-amber-500 py-3 text-xs font-bold text-slate-950 uppercase tracking-wider shadow-lg hover:bg-amber-400 active:scale-[0.99] transition-all"
            >
              Authenticate &amp; Access Panel
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Default Admin Login: Username <code className="text-amber-400">admin</code> · Password <code className="text-amber-400">spinanddry123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN COMMAND CENTER WITH SIDEBAR
  // -------------------------------------------------------------
  return (
    <div className="h-screen w-screen flex bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={cn(
          "sticky top-0 z-40 h-screen flex flex-col justify-between border-r border-slate-800 bg-slate-950 text-slate-100 transition-all duration-300 shrink-0 overflow-hidden",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        <div>
          {/* Studio Brand Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-3.5">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/logo.png"
                alt="Spin & Dry Logo"
                className="size-9 shrink-0 rounded-full object-cover border-2 border-brass/60 shadow-md"
              />
              {isSidebarOpen && (
                <div className="truncate">
                  <h2 className="font-display font-bold text-sm tracking-tight text-white truncate">Spin &amp; Dry</h2>
                  <p className="text-[10px] font-mono text-brass/80 uppercase tracking-widest">Admin Studio</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="size-4" />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-2 space-y-1">
            {[
              { id: "orders", label: "Orders & Logistics", icon: LayoutDashboard, badge: metrics.activeOrders },
              { id: "analytics", label: "Analytics & Revenue", icon: BarChart3 },
              { id: "leads", label: "Contact Leads", icon: Inbox },
              { id: "services", label: "Services Catalog", icon: Tag, badge: cms.services.length },
              { id: "hero", label: "Hero Slideshow", icon: ImageIcon, badge: (cms.heroSlides || []).length },
              { id: "gallery", label: "Before/After Gallery", icon: ArrowLeftRight, badge: (cms.beforeAfterGallery || []).length },
              { id: "casestudies", label: "Case Studies", icon: Sparkles, badge: (cms.caseStudies || []).length },
              { id: "testimonials", label: "Client Reviews", icon: MessageCircle, badge: cms.testimonials.length },
              { id: "process", label: "Process Steps", icon: Sliders, badge: cms.journey.length },
              { id: "settings", label: "Studio Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SidebarTab)}
                  title={tab.label}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg py-2.5 text-xs font-semibold transition-all",
                    isSidebarOpen ? "px-3" : "px-0 justify-center",
                    isActive
                      ? "bg-slate-800/90 text-white border-l-2 border-brass text-slate-100 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                  )}
                >
                  <div className={cn("flex items-center gap-3 truncate", !isSidebarOpen && "justify-center")}>
                    <Icon className={cn("size-4 shrink-0", isActive ? "text-brass" : "text-slate-400")} />
                    {isSidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {isSidebarOpen && tab.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-mono",
                        isActive
                          ? "bg-slate-950 text-brass border border-brass/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700/60",
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="border-t border-slate-800/80 p-2.5 space-y-2">
          {cmsSaveMsg && isSidebarOpen && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
              <Check className="size-3.5" />
              <span>{cmsSaveMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out Session"
            className={cn(
              "w-full flex items-center rounded-lg py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/80 hover:text-rose-400 transition-colors",
              isSidebarOpen ? "px-3 gap-2.5 justify-start" : "justify-center px-0",
            )}
          >
            <LogOut className="size-4 shrink-0 text-slate-400 group-hover:text-rose-400" />
            {isSidebarOpen && <span>Log Out Session</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Operational Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              {activeTab === "orders" && "Operations & OMS"}
              {activeTab === "analytics" && "Executive Intelligence"}
              {activeTab === "leads" && "Customer Enquiries"}
              {activeTab === "services" && "Catalog Management"}
              {activeTab === "hero" && "Marketing & Brand Visuals"}
              {activeTab === "gallery" && "Visual Proof & Gallery"}
              {activeTab === "casestudies" && "Fabric Restoration Case Studies"}
              {activeTab === "testimonials" && "Social Proof & Reviews"}
              {activeTab === "process" && "Customer Journey Steps"}
              {activeTab === "settings" && "Studio Contact & Hours"}
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 capitalize">
              {activeTab === "orders" && "Orders & Logistics Command"}
              {activeTab === "analytics" && "Revenue & Operations Analytics"}
              {activeTab === "leads" && "Contact Form Leads"}
              {activeTab === "services" && "Fabric Care Services Manager"}
              {activeTab === "hero" && "Homepage Hero Slideshow Manager"}
              {activeTab === "gallery" && "Before & After Restoration Manager"}
              {activeTab === "casestudies" && "Fabric Restoration Case Studies Manager"}
              {activeTab === "testimonials" && "Client Testimonials Manager"}
              {activeTab === "process" && "6-Step Process Journey Manager"}
              {activeTab === "settings" && "Studio Settings & Information"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "orders" ? (
              <>
                <button
                  type="button"
                  onClick={() => exportOrdersCSV(filteredOrders)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  title="Export Filtered Orders as CSV Spreadsheet"
                >
                  <Download className="size-3.5 text-emerald-600" /> Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-400"
                >
                  <Plus className="size-4" /> New Studio Order
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResetAllCMS}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="size-3.5 text-slate-500" /> Reset CMS Defaults
              </button>
            )}
          </div>
        </header>

        {/* TAB CONTENT: ORDERS */}
        {activeTab === "orders" && (
          <main className="p-6 md:p-8 space-y-8">
            {/* KPI Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                    <IndianRupee className="size-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900">
                  ₹{metrics.grossRevenue.toLocaleString()}
                </p>
                <span className="mt-1 block text-[11px] text-slate-500">Confirmed Quotes &amp; Orders</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Orders</span>
                  <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                    <Package className="size-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900">{metrics.activeOrders}</p>
                <span className="mt-1 block text-[11px] text-slate-500">In Pipeline ({metrics.totalOrders} total)</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Pickups</span>
                  <div className="rounded-full bg-amber-50 p-2 text-amber-600">
                    <Clock className="size-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900">{metrics.todayPickups}</p>
                <span className="mt-1 block text-[11px] text-slate-500">Scheduled for today</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Intake</span>
                  <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                    <AlertCircle className="size-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900">{metrics.pendingIntake}</p>
                <span className="mt-1 block text-[11px] text-slate-500">Awaiting studio inspection</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">In Processing</span>
                  <div className="rounded-full bg-indigo-50 p-2 text-indigo-600">
                    <RefreshCw className="size-4 animate-spin-slow" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900">{metrics.inProcessing}</p>
                <span className="mt-1 block text-[11px] text-slate-500">On cleaning cycle</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Express 24h</span>
                  <div className="rounded-full bg-purple-50 p-2 text-purple-600">
                    <Truck className="size-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-purple-900">{metrics.expressOrders}</p>
                <span className="mt-1 block text-[11px] text-purple-600 font-medium">Priority Turnaround</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Order Ref (#SD-...), Customer Name, Phone, Address, or Pincode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-900 select-none hover:bg-purple-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={expressOnly}
                      onChange={(e) => setExpressOnly(e.target.checked)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Zap className="size-3.5 text-purple-600" /> Express 24h Priority
                  </label>

                  <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
                    {["All", ...statusPipeline, "Cancelled"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                          statusFilter === st
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "text-slate-600 hover:text-slate-900",
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Actions Toolbar */}
            {selectedRefs.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <CheckSquare className="size-4 text-amber-600" />
                  <span>{selectedRefs.length} order{selectedRefs.length > 1 ? "s" : ""} selected for batch management</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Advance selected status:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBatchAdvance(e.target.value as OrderStatus);
                        e.target.value = "";
                      }
                    }}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Target Stage...</option>
                    {statusPipeline.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedRefs([])}
                    className="text-xs font-semibold text-amber-800 hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredOrders.length > 0 && selectedRefs.length === filteredOrders.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRefs(filteredOrders.map((o) => o.reference));
                            } else {
                              setSelectedRefs([]);
                            }
                          }}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-5 py-4">Reference</th>
                      <th className="px-5 py-4">Customer &amp; Contact</th>
                      <th className="px-5 py-4">Slot &amp; Logistics</th>
                      <th className="px-5 py-4">Location Distance</th>
                      <th className="px-5 py-4">Stage Status</th>
                      <th className="px-5 py-4 text-right">Confirmed Quote</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          <Package className="mx-auto size-8 text-slate-400 mb-2" />
                          <p className="font-semibold">No orders found matching your search filters.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("All");
                              setExpressOnly(false);
                            }}
                            className="mt-3 text-xs font-bold text-amber-600 hover:underline"
                          >
                            Reset All Filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const isSelected = selectedRefs.includes(o.reference);
                        const stageIndex = statusPipeline.indexOf(o.status);

                        return (
                          <tr
                            key={o.reference}
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsEditOpen(true);
                            }}
                            className={cn(
                              "hover:bg-slate-50/80 transition-colors border-b border-slate-100 cursor-pointer",
                              isSelected && "bg-amber-50/40",
                            )}
                          >
                            <td className="px-3.5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRefs([...selectedRefs, o.reference]);
                                  } else {
                                    setSelectedRefs(selectedRefs.filter((r) => r !== o.reference));
                                  }
                                }}
                                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                            </td>

                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <span>#{o.reference}</span>
                                {o.isExpress && (
                                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-extrabold text-purple-800 uppercase flex items-center gap-0.5">
                                    <Zap className="size-2.5 text-purple-700" /> 24H
                                  </span>
                                )}
                              </div>
                              <span className="mt-1 block text-[11px] font-sans text-slate-400 font-normal">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900">{o.customerName}</div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                <span>{o.phone}</span>
                                <span>·</span>
                                <span className="capitalize text-slate-600 font-medium">{o.customerType}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-900">{o.date}</div>
                              <div className="text-xs text-slate-500 font-mono">{o.slot}</div>
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 capitalize">
                                {o.logistics === "pickup-delivery" ? (
                                  <>
                                    <Truck className="size-3 text-slate-500" /> Doorstep Pickup
                                  </>
                                ) : (
                                  <>
                                    <Building2 className="size-3 text-slate-500" /> Studio Drop-off
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="size-3.5 text-amber-600 shrink-0" />
                                  <span className="font-semibold text-slate-900">
                                    {o.distanceKm !== null ? `${o.distanceKm.toFixed(1)} km` : "Location"}
                                  </span>
                                </div>
                                <a
                                  href={o.coords ? `https://www.google.com/maps?q=${o.coords.lat},${o.coords.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.address)}`}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2 py-0.5 rounded transition-all shadow-xs"
                                  title="Open Doorstep Navigation in Google Maps"
                                >
                                  <Navigation className="size-2.5 text-slate-500" /> Route ↗
                                </a>
                              </div>
                              <span
                                className={cn(
                                  "mt-1 inline-block text-[10px] font-bold uppercase rounded px-1.5 py-0.5",
                                  (o.distanceKm || 0) <= 10 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                                )}
                              >
                                {(o.distanceKm || 0) <= 10 ? "Within 10 km Free Zone" : "Outside Standard Radius"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={o.status}
                                  onChange={(e) => handleStatusChange(o.reference, e.target.value as OrderStatus)}
                                  className={cn(
                                    "rounded-none border px-2.5 py-1 text-xs font-bold transition-all focus:outline-none cursor-pointer shadow-xs",
                                    statusColors[o.status],
                                  )}
                                >
                                  {statusPipeline.map((st) => (
                                    <option key={st} value={st} className="bg-white text-slate-900 font-semibold">
                                      {st}
                                    </option>
                                  ))}
                                  <option value="Cancelled" className="bg-white text-rose-700 font-semibold">
                                    Cancelled
                                  </option>
                                </select>
                                {o.status !== "Completed" && o.status !== "Cancelled" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAdvance(o.reference, o.status)}
                                    className="inline-flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all shadow-xs shrink-0 ml-1.5"
                                    title="1-Click Advance to Next Stage"
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </button>
                                )}
                              </div>
                              {stageIndex >= 0 && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                                    <div
                                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                                      style={{ width: `${((stageIndex + 1) / statusPipeline.length) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                    {stageIndex + 1}/6
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="font-mono text-base font-bold text-slate-900">₹{o.quoteAmount}</div>
                              <span
                                className={cn(
                                  "text-[10px] font-semibold uppercase rounded px-1.5 py-0.5",
                                  o.paymentStatus.startsWith("Paid") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                                )}
                              >
                                {o.paymentStatus}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right min-w-[220px]">
                              <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={getWhatsAppUrl(o)}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                                  title="Send WhatsApp Update"
                                >
                                  <MessageSquare className="size-4" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setPrintOrder(o)}
                                  className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                                  title="Print Receipt"
                                >
                                  <Printer className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrintStickerOrder(o)}
                                  className="rounded p-1.5 text-amber-600 hover:bg-amber-50"
                                  title="Print Garment Stickers"
                                >
                                  <Tag className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    setIsEditOpen(true);
                                  }}
                                  className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                  title="Edit Order Details"
                                >
                                  <Edit3 className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(o.reference)}
                                  className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                                  title="Delete Order"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* TAB CONTENT: ANALYTICS & INSIGHTS */}
        {activeTab === "analytics" && <AnalyticsCMSSection orders={orders} />}

        {/* TAB CONTENT: SERVICES CMS */}
        {activeTab === "services" && (
          <ServicesCMSSection
            services={cms.services}
            onUpdate={(updatedServices) => handleSaveCMSData({ ...cms, services: updatedServices })}
          />
        )}

        {/* TAB CONTENT: TESTIMONIALS CMS */}
        {activeTab === "testimonials" && (
          <TestimonialsCMSSection
            testimonials={cms.testimonials}
            onUpdate={(updatedTestimonials) => handleSaveCMSData({ ...cms, testimonials: updatedTestimonials })}
          />
        )}

        {/* TAB CONTENT: HERO SLIDESHOW CMS */}
        {activeTab === "hero" && (
          <HeroSlideshowCMSSection
            heroSlides={cms.heroSlides || []}
            onUpdate={(updatedSlides) => handleSaveCMSData({ ...cms, heroSlides: updatedSlides })}
          />
        )}

        {/* TAB CONTENT: BEFORE/AFTER GALLERY CMS */}
        {activeTab === "gallery" && (
          <BeforeAfterGalleryCMSSection
            gallery={cms.beforeAfterGallery}
            onUpdate={(updatedGallery) => handleSaveCMSData({ ...cms, beforeAfterGallery: updatedGallery })}
          />
        )}

        {/* TAB CONTENT: PROCESS JOURNEY CMS */}
        {activeTab === "process" && (
          <ProcessCMSSection
            journey={cms.journey}
            onUpdate={(updatedJourney) => handleSaveCMSData({ ...cms, journey: updatedJourney })}
          />
        )}

        {/* TAB CONTENT: STUDIO SETTINGS CMS */}
        {activeTab === "settings" && (
          <StudioSettingsCMSSection
            settings={cms.settings}
            onUpdate={(updatedSettings) => handleSaveCMSData({ ...cms, settings: updatedSettings })}
          />
        )}

        {/* TAB CONTENT: CONTACT LEADS */}
        {activeTab === "leads" && <LeadsSection />}

        {/* TAB CONTENT: CASE STUDIES CMS */}
        {activeTab === "casestudies" && (
          <CaseStudiesCMSSection
            caseStudies={cms.caseStudies || []}
            onUpdate={(updatedStudies) => handleSaveCMSData({ ...cms, caseStudies: updatedStudies })}
          />
        )}
      </div>

      {/* Edit Order Modal */}
      {isEditOpen && selectedOrder && (
        <EditOrderDrawer
          order={selectedOrder}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            const newList = saveSingleOrder(updated);
            setOrders(newList);
            setSelectedOrder(updated);
            setIsEditOpen(false);
          }}
        />
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <CreateOrderModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={(newOrder) => {
            const newList = saveSingleOrder(newOrder);
            setOrders(newList);
            setIsCreateOpen(false);
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {printOrder && (
        <PrintableReceiptModal order={printOrder} onClose={() => setPrintOrder(null)} />
      )}

      {/* Printable Stickers Modal */}
      {printStickerOrder && (
        <PrintStickersModal order={printStickerOrder} onClose={() => setPrintStickerOrder(null)} />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// LEADS SECTION: CONTACT FORM SUBMISSIONS
// -------------------------------------------------------------
const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-amber-100 text-amber-800 border border-amber-300",
  Contacted: "bg-blue-100 text-blue-800 border border-blue-300",
  Resolved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
};

function LeadsSection() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [filterStatus, setFilterStatus] = useState<"All" | LeadStatus>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLeads(getStoredLeads());
  }, []);

  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.topic.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  function handleStatus(id: string, status: LeadStatus) {
    const updated = updateLeadStatus(id, status);
    setLeads(updated);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this lead permanently?")) {
      const updated = deleteLead(id);
      setLeads(updated);
    }
  }

  const newCount = leads.filter((l) => l.status === "New").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Contact Form Leads</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {leads.length} total enquiry{leads.length !== 1 ? "s" : ""} — {newCount} unread
          </p>
        </div>
        {newCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
            <Inbox className="size-3.5" />
            {newCount} New Lead{newCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
          {(["All", "New", "Contacted", "Resolved"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                filterStatus === s
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            {leads.length === 0
              ? "No leads yet — submissions from the Contact page will appear here."
              : "No leads match your filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className={cn(
                "rounded-xl border bg-white p-5 shadow-sm space-y-3 transition-all",
                lead.status === "New" ? "border-amber-200" : "border-slate-200",
              )}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-base font-bold text-slate-900">{lead.name}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", LEAD_STATUS_COLORS[lead.status])}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-amber-700 font-medium">
                      <Mail className="size-3 shrink-0" /> {lead.email}
                    </a>
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 hover:text-amber-700 font-medium">
                      <PhoneCall className="size-3 shrink-0" /> {lead.phone}
                    </a>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Tag className="size-3 shrink-0" /> {lead.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatus(lead.id, e.target.value as LeadStatus)}
                    className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-amber-400"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(lead.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.topic)} — Spin & Dry&body=Hello ${encodeURIComponent(lead.name)},%0D%0A%0D%0AThank you for reaching out to Spin & Dry!`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 hover:bg-slate-700 transition-colors"
                >
                  <Mail className="size-3.5" /> Reply via Email
                </a>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${lead.name}! 👋 Thank you for contacting Spin & Dry regarding "${lead.topic}". We'd love to help you — could you share more details?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 hover:bg-emerald-500 transition-colors"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const serviceFallbackCoverImages: Record<string, string> = {
  "curtain-cleaning": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  "carpet-cleaning": "https://images.unsplash.com/photo-1576016770956-debb63d90029?auto=format&fit=crop&w=600&q=80",
  "blanket-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
  "sofa-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "bedsheet-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "comforter-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "duvet-cleaning": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  "pillow-cleaning": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  "cushion-cover-cleaning": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "quilt-cleaning": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
  "table-linen-cleaning": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "home-linen-cleaning": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "commercial-linen-cleaning": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "hotel-linen-cleaning": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "office-fabric-care": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  "general-laundry": "https://images.unsplash.com/photo-1545173168-9f19472c043a?auto=format&fit=crop&w=600&q=80",
};

const categoryFallbackCovers: Record<string, string> = {
  "Home Fabrics": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  "Bedding & Linen": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  "Upholstery": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
  "Commercial": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
};

// -------------------------------------------------------------
// CMS SECTION: SERVICES MANAGEMENT
// -------------------------------------------------------------
function ServicesCMSSection({
  services,
  onUpdate,
}: {
  services: Service[];
  onUpdate: (services: Service[]) => void;
}) {
  const [list, setList] = useState<Service[]>([...services]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  function handleSaveService(updatedService: Service) {
    const next = list.map((s) => (s.slug === updatedService.slug ? updatedService : s));
    setList(next);
    onUpdate(next);
    setEditingSlug(null);
  }

  function handleDeleteService(slug: string) {
    if (confirm("Delete this service item from catalog?")) {
      const next = list.filter((s) => s.slug !== slug);
      setList(next);
      onUpdate(next);
    }
  }

  function handleAddService() {
    const newSlug = `service-${Date.now()}`;
    const newService: Service = {
      slug: newSlug,
      name: "New Fabric Care Service",
      category: "Home Fabrics",
      summary: "Custom care service description...",
      intro: "Introductory overview...",
      turnaround: "48 hours standard",
      includes: ["Inspection", "Care Wash"],
      materials: ["Cotton"],
      benefits: ["Clean finish"],
      process: [{ title: "Step 1", body: "Initial inspection" }],
      faqs: [],
    };
    const next = [newService, ...list];
    setList(next);
    onUpdate(next);
    setEditingSlug(newSlug);
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Manage 16 Fabric Services</h2>
          <p className="text-xs text-slate-500">Edit service titles, summaries, categories, turnaround times, and protocols.</p>
        </div>
        <button
          type="button"
          onClick={handleAddService}
          className="inline-flex items-center gap-2 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 rounded-lg shadow hover:bg-amber-400"
        >
          <Plus className="size-4" /> Add New Service
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <div key={s.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 mb-3 border border-slate-200">
                <img
                  src={s.image || serviceFallbackCoverImages[s.slug] || categoryFallbackCovers[s.category] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"}
                  alt={s.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                  {s.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">{s.turnaround}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">{s.name}</h3>
              <p className="mt-2 text-xs text-slate-600 line-clamp-3">{s.summary}</p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingSlug(s.slug)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <Edit3 className="size-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteService(s.slug)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Editing Service (Wide Two-Column Layout) */}
      {editingSlug && (() => {
        const editingService = list.find((s) => s.slug === editingSlug);
        if (!editingService) return null;
        return (
          <div
            onClick={() => setEditingSlug(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Edit Service: {editingService.name}
                  </h3>
                  <p className="text-xs text-slate-500">Modify general metadata and starting prices.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSlug(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <ServiceInlineEditor
                  service={editingService}
                  onSave={handleSaveService}
                  onCancel={() => setEditingSlug(null)}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ServiceInlineEditor({
  service,
  onSave,
  onCancel,
}: {
  service: Service;
  onSave: (s: Service) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Service>({ ...service });
  const [pricesList, setPricesList] = useState<{ name: string; prices: Record<string, string> }[]>(
    draft.prices && draft.prices.length > 0 ? draft.prices : (servicePricingData[draft.slug] || [])
  );
  const [newColumnName, setNewColumnName] = useState("");

  const dynamicKeys = useMemo(() => {
    const keysSet = new Set<string>();
    
    // Add default common categories
    const commonDefaults = [
      "Premium Laundry",
      "Dry Clean",
      "Premium Steam Press",
      "Luxe Service"
    ];
    commonDefaults.forEach(k => keysSet.add(k));

    // Add any keys present in the current items list
    pricesList.forEach(item => {
      if (item.prices) {
        Object.keys(item.prices).forEach(k => {
          if (item.prices[k] !== undefined) {
            keysSet.add(k);
          }
        });
      }
    });

    return Array.from(keysSet);
  }, [pricesList]);

  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (dynamicKeys.includes(trimmed)) {
      alert("Column already exists");
      return;
    }
    // Update all items in pricesList to initialize this key
    const updated = pricesList.map(item => ({
      ...item,
      prices: { ...item.prices, [trimmed]: "" }
    }));
    setPricesList(updated);
    setDraft({ ...draft, prices: updated });
    setNewColumnName("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setDraft({ ...draft, image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Service Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full rounded border border-slate-300 p-2 text-xs font-bold text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Turnaround Time</label>
            <input
              type="text"
              value={draft.turnaround}
              onChange={(e) => setDraft({ ...draft, turnaround: e.target.value })}
              className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Cover Image Path / File</label>
            <input
              type="text"
              value={draft.image || ""}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              placeholder="e.g. /assets/curtain_before.jpg or base64 data"
              className="w-full rounded border border-slate-300 p-2 text-xs font-mono text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold py-1.5 px-3 border border-slate-300 rounded shadow-xs transition-colors">
                <ImageIcon className="size-3.5" /> Select Local File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {draft.image && draft.image.startsWith("data:") && (
                <span className="text-[9px] text-emerald-600 font-bold">✓ Custom file loaded</span>
              )}
            </div>
            {(draft.image || serviceFallbackCoverImages[draft.slug] || categoryFallbackCovers[draft.category]) && (
              <div className="mt-3 relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
                <img
                  src={draft.image || serviceFallbackCoverImages[draft.slug] || categoryFallbackCovers[draft.category] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Summary</label>
            <textarea
              rows={4}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Column: Pricing Catalog */}
        <div className="flex flex-col h-full">
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Pricing Catalogue (₹ Starting Rates)</label>
          
          {/* Dynamic Column / Category Adder */}
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-3 rounded-none mb-3 shadow-xs">
            <div className="flex-1">
              <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Add Price Type / Column</label>
              <input
                type="text"
                placeholder="e.g. Standard Wash, Single, 10-Pack"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full rounded-none border border-slate-300 p-1.5 text-xs font-semibold bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColumn}
              className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none shrink-0 shadow-xs transition-colors"
            >
              + Add Column
            </button>
          </div>

          <div className="flex-1 space-y-3 border border-slate-200 rounded-none p-3 bg-slate-100/50 max-h-[480px] overflow-y-auto shadow-inner">
            {pricesList.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-none p-3 bg-white shadow-sm hover:border-slate-300 transition-colors relative">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <input
                    type="text"
                    placeholder="Item Name (e.g. Shirt / Pant)"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...pricesList];
                      if (updated[idx]) {
                        updated[idx].name = e.target.value;
                        setPricesList(updated);
                        setDraft({ ...draft, prices: updated });
                      }
                    }}
                    className="w-full rounded-none border border-slate-300 p-1.5 text-xs font-bold text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = pricesList.filter((_, i) => i !== idx);
                      setPricesList(updated);
                      setDraft({ ...draft, prices: updated });
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold shrink-0 transition-colors"
                  >
                    Remove Row
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-none border border-slate-100">
                  {dynamicKeys.map((k) => (
                    <div key={k} className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                      <span className="text-[10px] text-slate-500 truncate w-24 pr-1" title={k}>{k}:</span>
                      <input
                        type="text"
                        placeholder="—"
                        value={item.prices[k] || ""}
                        onChange={(e) => {
                          const updated = [...pricesList];
                          if (updated[idx]) {
                            updated[idx].prices = { ...updated[idx].prices, [k]: e.target.value };
                            setPricesList(updated);
                            setDraft({ ...draft, prices: updated });
                          }
                        }}
                        className="w-16 rounded-none border border-slate-200 bg-white py-0.5 px-1.5 text-[10px] text-center font-mono text-slate-800 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updated = [...pricesList, { name: "", prices: {} }];
                setPricesList(updated);
                setDraft({ ...draft, prices: updated });
              }}
              className="w-full border border-dashed border-slate-300 rounded-none py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/80 hover:text-slate-800 bg-white shadow-xs transition-all"
            >
              + Add Price Row
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: BEFORE/AFTER GALLERY MANAGEMENT
// -------------------------------------------------------------
function BeforeAfterGalleryCMSSection({
  gallery,
  onUpdate,
}: {
  gallery: BeforeAfterItem[];
  onUpdate: (items: BeforeAfterItem[]) => void;
}) {
  const [list, setList] = useState<BeforeAfterItem[]>([...(gallery || [])]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [description, setDescription] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (type === "before") setBeforeImage(reader.result);
        else setAfterImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  function handleAdd() {
    if (!title || !beforeImage || !afterImage) return;
    if (editingId) {
      const next = list.map((i) => {
        if (i.id === editingId) {
          return {
            ...i,
            title,
            serviceName: serviceName || "Fabric Restoration",
            beforeImage,
            afterImage,
            description,
          };
        }
        return i;
      });
      setList(next);
      onUpdate(next);
      setEditingId(null);
    } else {
      const newItem: BeforeAfterItem = {
        id: `ba-${Date.now()}`,
        title,
        serviceName: serviceName || "Fabric Restoration",
        beforeImage,
        afterImage,
        description,
      };
      const next = [newItem, ...list];
      setList(next);
      onUpdate(next);
    }
    setTitle("");
    setServiceName("");
    setBeforeImage("");
    setAfterImage("");
    setDescription("");
  }

  function handleStartEdit(item: BeforeAfterItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setServiceName(item.serviceName);
    setBeforeImage(item.beforeImage);
    setAfterImage(item.afterImage);
    setDescription(item.description);
    // Smooth scroll to top of panel view
    const mainEl = document.querySelector("main") || window;
    mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setServiceName("");
    setBeforeImage("");
    setAfterImage("");
    setDescription("");
  }

  function handleDelete(id: string) {
    if (confirm("Remove this case study from the Before/After Gallery?")) {
      const next = list.filter((i) => i.id !== id);
      setList(next);
      onUpdate(next);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Before &amp; After Restoration Gallery Manager</h2>
          <p className="text-xs text-slate-500 font-semibold">Manage interactive fabric restoration slider case studies displayed on the homepage.</p>
        </div>
      </div>

      {/* Add / Edit Case Study Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase text-amber-600 tracking-wider">
          {editingId ? "Edit Case Study" : "Add New Case Study"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Case Title *</label>
            <input
              type="text"
              placeholder="e.g. Living Room Blackout Drapes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Service Category</label>
            <input
              type="text"
              placeholder="e.g. Curtain & Drape Care"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Before Image Path / URL *</label>
            <input
              type="text"
              placeholder="/assets/curtain_before.jpg"
              value={beforeImage}
              onChange={(e) => setBeforeImage(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2 text-sm font-mono"
            />
            <div className="mt-2 flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 border border-slate-300 rounded shadow-sm">
                <ImageIcon className="size-3.5" /> Select Local File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "before")}
                  className="hidden"
                />
              </label>
              {beforeImage && beforeImage.startsWith("data:") && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ File loaded</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">After Image Path / URL *</label>
            <input
              type="text"
              placeholder="/assets/curtain_after.jpg"
              value={afterImage}
              onChange={(e) => setAfterImage(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2 text-sm font-mono"
            />
            <div className="mt-2 flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 border border-slate-300 rounded shadow-sm">
                <ImageIcon className="size-3.5" /> Select Local File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "after")}
                  className="hidden"
                />
              </label>
              {afterImage && afterImage.startsWith("data:") && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ File loaded</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase">Restoration Description</label>
          <textarea
            rows={2}
            placeholder="Details on dirt buildup, stains removed, and fabric finish..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="bg-amber-500 text-slate-950 px-6 py-2.5 text-xs font-bold rounded-lg shadow hover:bg-amber-400 transition-colors"
          >
            {editingId ? "Save Case Study Changes" : "Add Case Study to Gallery"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-6 py-2.5 text-xs font-bold rounded-lg transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* List of Case Studies */}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{item.serviceName}</span>
                <h4 className="font-display text-lg font-bold text-slate-900">{item.title}</h4>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="text-slate-400 hover:text-amber-600 p-1 transition-colors"
                  title="Edit Case Study"
                >
                  <Edit3 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Delete Case Study"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600">{item.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-700 block">Before Image:</span>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
                  <img
                    src={item.beforeImage}
                    alt="Before state"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate" title={item.beforeImage}>
                  {item.beforeImage}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-700 block">After Image:</span>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
                  <img
                    src={item.afterImage}
                    alt="After state"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate" title={item.afterImage}>
                  {item.afterImage}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: TESTIMONIALS MANAGEMENT
// -------------------------------------------------------------
function TestimonialsCMSSection({
  testimonials,
  onUpdate,
}: {
  testimonials: TestimonialItem[];
  onUpdate: (items: TestimonialItem[]) => void;
}) {
  const [list, setList] = useState<TestimonialItem[]>([...testimonials]);
  const [newQuote, setNewQuote] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newRating, setNewRating] = useState(5);

  function handleAdd() {
    if (!newQuote || !newName) return;
    const newItem: TestimonialItem = {
      id: `test-${Date.now()}`,
      quote: newQuote,
      name: newName,
      role: newRole || "Bengaluru Resident",
      rating: newRating,
    };
    const next = [newItem, ...list];
    setList(next);
    onUpdate(next);
    setNewQuote("");
    setNewName("");
    setNewRole("");
    setNewRating(5);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this testimonial?")) {
      const next = list.filter((t) => t.id !== id);
      setList(next);
      onUpdate(next);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Manage Client Testimonials</h2>
          <p className="text-xs text-slate-500">Add, edit, or remove client quotes and reviews displayed on homepage.</p>
        </div>
      </div>

      {/* Add New Testimonial Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase text-amber-600 tracking-wider">Add New Testimonial</h3>
        <textarea
          rows={2}
          placeholder="Client quote text..."
          value={newQuote}
          onChange={(e) => setNewQuote(e.target.value)}
          className="w-full rounded border border-slate-300 p-2.5 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Client Name (e.g. Ananya R.)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded border border-slate-300 p-2 text-sm sm:col-span-1"
          />
          <input
            type="text"
            placeholder="Role / Area (e.g. Villa Owner, JP Nagar)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="rounded border border-slate-300 p-2 text-sm sm:col-span-1"
          />
          <div className="flex items-center gap-2 border border-slate-300 rounded px-2.5 bg-white">
            <span className="text-xs font-bold text-slate-500 uppercase">Rating:</span>
            <select
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className="flex-1 text-sm bg-transparent outline-none py-1.5 font-semibold text-slate-800"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n} Star{n !== 1 ? "s" : ""})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-amber-500 text-slate-950 px-5 py-2.5 text-xs font-bold rounded shadow hover:bg-amber-400 transition-colors"
        >
          Add Testimonial
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                {[...Array(t.rating || 5)].map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>
              <blockquote className="font-display text-lg text-slate-900">“{t.quote}”</blockquote>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {t.name} — <span className="text-amber-700">{t.role}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(t.id)}
              className="text-rose-500 hover:text-rose-700 p-1 transition-colors shrink-0"
              title="Delete Testimonial"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: PROCESS JOURNEY MANAGEMENT
// -------------------------------------------------------------
function ProcessCMSSection({
  journey,
  onUpdate,
}: {
  journey: JourneyStepItem[];
  onUpdate: (steps: JourneyStepItem[]) => void;
}) {
  const [list, setList] = useState<JourneyStepItem[]>([...journey]);

  function handleChange(idx: number, field: keyof JourneyStepItem, val: string) {
    const next = [...list];
    next[idx] = { ...next[idx], [field]: val } as JourneyStepItem;
    setList(next);
    onUpdate(next);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Manage 6-Step Customer Process</h2>
        <p className="text-xs text-slate-500">Edit the step titles and descriptions displayed on homepage and process pages.</p>
      </div>

      <div className="space-y-4">
        {list.map((j, idx) => (
          <div key={j.step} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex gap-4">
            <span className="font-display text-3xl font-bold text-amber-500 shrink-0">{j.step}</span>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={j.title}
                onChange={(e) => handleChange(idx, "title", e.target.value)}
                className="w-full rounded border border-slate-300 p-2 text-sm font-bold"
              />
              <textarea
                rows={2}
                value={j.body}
                onChange={(e) => handleChange(idx, "body", e.target.value)}
                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-700"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: STUDIO SETTINGS MANAGEMENT
// -------------------------------------------------------------
function StudioSettingsCMSSection({
  settings,
  onUpdate,
}: {
  settings: StudioSettings;
  onUpdate: (settings: StudioSettings) => void;
}) {
  const [draft, setDraft] = useState<StudioSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [passMsg, setPassMsg] = useState({ text: "", isError: false });

  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  // Sync draft if parent settings change (e.g. after CMS reset)
  useEffect(() => {
    setDraft({ ...settings });
  }, [settings]);

  function handleSave() {
    // Auto-derive phoneHref and whatsapp from the phone number
    const digits = draft.phone.replace(/[^0-9]/g, "");
    const updated: StudioSettings = {
      ...draft,
      phoneHref: digits ? `tel:+${digits}` : draft.phoneHref,
      whatsapp: digits ? `https://wa.me/${digits}` : draft.whatsapp,
    };
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg({ text: "", isError: false });

    if (!currPass || !newPass || !confPass) {
      setPassMsg({ text: "All fields are required.", isError: true });
      return;
    }

    if (newPass !== confPass) {
      setPassMsg({ text: "New passwords do not match.", isError: true });
      return;
    }

    const storedHash = localStorage.getItem("spinanddry.admin_pass_hash") || ADMIN_PASS_HASH;
    const enteredCurrHash = await sha256(currPass);

    if (enteredCurrHash !== storedHash) {
      setPassMsg({ text: "Incorrect current password.", isError: true });
      return;
    }

    // Save new hash
    const newHash = await sha256(newPass);
    localStorage.setItem("spinanddry.admin_pass_hash", newHash);

    setPassMsg({ text: "Password changed successfully!", isError: false });
    setCurrPass("");
    setNewPass("");
    setConfPass("");
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Studio Settings &amp; Info</h2>
        <p className="text-xs text-slate-500">Update studio phone, address, operating hours, and service radius settings.</p>
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Studio Phone Number</label>
            <input
              type="text"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              className="mt-1 w-full rounded-none border border-slate-300 p-2.5 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Studio Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="mt-1 w-full rounded-none border border-slate-300 p-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700">Studio Hub Address</label>
          <textarea
            rows={2}
            value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            className="mt-1 w-full rounded-none border border-slate-300 p-2.5 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Free Pickup Radius (km)</label>
            <input
              type="number"
              value={draft.pickupRadiusKm}
              onChange={(e) => setDraft({ ...draft, pickupRadiusKm: Number(e.target.value) })}
              className="mt-1 w-full rounded-none border border-slate-300 p-2.5 text-sm font-bold text-amber-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Founding Year</label>
            <input
              type="number"
              value={draft.founded}
              onChange={(e) => setDraft({ ...draft, founded: Number(e.target.value) })}
              className="mt-1 w-full rounded-none border border-slate-300 p-2.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase text-slate-700">Operating Studio Hours</label>
          {(draft.hours || []).map((h, idx) => (
            <div key={idx} className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={h.days}
                onChange={(e) => {
                  const updated = [...(draft.hours || [])];
                  updated[idx] = { ...updated[idx]!, days: e.target.value };
                  setDraft({ ...draft, hours: updated });
                }}
                className="rounded-none border border-slate-300 p-2 text-sm font-semibold"
              />
              <input
                type="text"
                value={h.time}
                onChange={(e) => {
                  const updated = [...(draft.hours || [])];
                  updated[idx] = { ...updated[idx]!, time: e.target.value };
                  setDraft({ ...draft, hours: updated });
                }}
                className="rounded-none border border-slate-300 p-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-none px-3 py-1.5">
              <Check className="size-3.5" /> Settings saved — site updated!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto bg-amber-500 text-slate-950 px-7 py-3 text-xs font-bold rounded-none shadow hover:bg-amber-400 transition-colors"
          >
            Save Studio Settings
          </button>
        </div>
      </div>

      {/* Change Password Box */}
      <form onSubmit={handlePasswordChange} className="rounded-none border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">Change Admin Password</h3>
          <p className="text-xs text-slate-500">Update the credentials used to access the administrator panel.</p>
        </div>

        {passMsg.text && (
          <div className={cn(
            "p-3 text-xs font-semibold rounded-none border",
            passMsg.isError 
              ? "bg-rose-50 border-rose-200 text-rose-800" 
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          )}>
            {passMsg.text}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrPass ? "text" : "password"}
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                className="w-full rounded-none border border-slate-300 p-2.5 pr-12 text-sm focus:outline-none focus:border-amber-500 bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowCurrPass(!showCurrPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 focus:outline-none"
              >
                {showCurrPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full rounded-none border border-slate-300 p-2.5 pr-12 text-sm focus:outline-none focus:border-amber-500 bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 focus:outline-none"
              >
                {showNewPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfPass ? "text" : "password"}
                required
                value={confPass}
                onChange={(e) => setConfPass(e.target.value)}
                className="w-full rounded-none border border-slate-300 p-2.5 pr-12 text-sm focus:outline-none focus:border-amber-500 bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfPass(!showConfPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 focus:outline-none"
              >
                {showConfPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-slate-900 text-white px-7 py-3 text-xs font-bold rounded-none shadow hover:bg-slate-800 transition-colors uppercase tracking-wider"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: CASE STUDIES MANAGEMENT
// -------------------------------------------------------------
function CaseStudiesCMSSection({
  caseStudies,
  onUpdate,
}: {
  caseStudies: CaseStudy[];
  onUpdate: (updated: CaseStudy[]) => void;
}) {
  const [list, setList] = useState<CaseStudy[]>(caseStudies);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [result, setResult] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  
  // Stats states (3 stats limit)
  const [stat1Label, setStat1Label] = useState("Stain Lift Rate");
  const [stat1Value, setStat1Value] = useState("99.8%");
  const [stat2Label, setStat2Label] = useState("Dye Retention");
  const [stat2Value, setStat2Value] = useState("100%");
  const [stat3Label, setStat3Label] = useState("Processing Time");
  const [stat3Value, setStat3Value] = useState("72 Hours");

  useEffect(() => {
    setList(caseStudies);
  }, [caseStudies]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleStartEdit(item: CaseStudy) {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setChallenge(item.challenge);
    setSolution(item.solution);
    setResult(item.result);
    setImage(item.image);
    setTags(item.tags || "");

    // Load stats safely
    setStat1Label(item.stats?.[0]?.label || "");
    setStat1Value(item.stats?.[0]?.value || "");
    setStat2Label(item.stats?.[1]?.label || "");
    setStat2Value(item.stats?.[1]?.value || "");
    setStat3Label(item.stats?.[2]?.label || "");
    setStat3Value(item.stats?.[2]?.value || "");

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setCategory("");
    setChallenge("");
    setSolution("");
    setResult("");
    setImage("");
    setTags("");
    setStat1Label("Stain Lift Rate");
    setStat1Value("99.8%");
    setStat2Label("Dye Retention");
    setStat2Value("100%");
    setStat3Label("Processing Time");
    setStat3Value("72 Hours");
  }

  function handleAdd() {
    if (!title || !category || !challenge || !solution || !result || !image) {
      alert("Please fill in all required fields marked with * (including selecting or inputting an image).");
      return;
    }

    const compiledStats = [
      { label: stat1Label, value: stat1Value },
      { label: stat2Label, value: stat2Value },
      { label: stat3Label, value: stat3Value },
    ].filter((s) => s.label && s.value);

    if (editingId) {
      // Edit
      const next = list.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            title,
            category,
            challenge,
            solution,
            result,
            image,
            tags,
            stats: compiledStats,
          };
        }
        return item;
      });
      setList(next);
      onUpdate(next);
      handleCancelEdit();
    } else {
      // Add
      const newItem: CaseStudy = {
        id: `cs-${Date.now()}`,
        title,
        category,
        challenge,
        solution,
        result,
        image,
        tags,
        stats: compiledStats,
      };
      const next = [...list, newItem];
      setList(next);
      onUpdate(next);
      handleCancelEdit();
    }
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this case study?")) {
      const next = list.filter((item) => item.id !== id);
      setList(next);
      onUpdate(next);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Restoration Case Studies Manager</h2>
          <p className="text-xs text-slate-500 font-semibold">Manage detailed craftsmanship restoration stories displayed on the homepage.</p>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase text-amber-600 tracking-wider">
          {editingId ? "Edit Case Study" : "Add New Case Study"}
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Case Title *</label>
            <input
              type="text"
              placeholder="e.g. 10x14 ft Hand-Knotted Silk & Wool Persian Rug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Category *</label>
            <input
              type="text"
              placeholder="e.g. Rugs & Carpets"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Image Path / URL *</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/... or base64"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-mono"
            />
            <div className="mt-2 flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 border border-slate-300 rounded shadow-sm">
                <ImageIcon className="size-3.5" /> Select Local File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {image && image.startsWith("data:") && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ File loaded</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Goose Down, Loft Revival"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Initial Condition / Challenge *</label>
            <input
              type="text"
              placeholder="e.g. Deep aged red wine stain, dust compaction, matted silk fringe."
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Solution / Spin & Dry Protocol *</label>
            <input
              type="text"
              placeholder="e.g. Controlled pH solvent extraction, hand-brushed fringe revival & low-heat air drying."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Verified Result *</label>
            <input
              type="text"
              placeholder="e.g. 100% stain removal, restored silk lustre, 0% dye bleed."
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-semibold text-emerald-700"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Metrics/KPIs (Max 3)</label>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Metric 1</span>
              <input
                type="text"
                placeholder="Label (e.g. Stain Lift Rate)"
                value={stat1Label}
                onChange={(e) => setStat1Label(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="Value (e.g. 99.8%)"
                value={stat1Value}
                onChange={(e) => setStat1Value(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-bold"
              />
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Metric 2</span>
              <input
                type="text"
                placeholder="Label (e.g. Dye Retention)"
                value={stat2Label}
                onChange={(e) => setStat2Label(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="Value (e.g. 100%)"
                value={stat2Value}
                onChange={(e) => setStat2Value(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-bold"
              />
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Metric 3</span>
              <input
                type="text"
                placeholder="Label (e.g. Processing Time)"
                value={stat3Label}
                onChange={(e) => setStat3Label(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="Value (e.g. 72 Hours)"
                value={stat3Value}
                onChange={(e) => setStat3Value(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAdd}
            className="bg-amber-500 text-slate-950 px-6 py-2.5 text-xs font-bold rounded-lg shadow hover:bg-amber-400 transition-colors"
          >
            {editingId ? "Save Case Study Changes" : "Add Case Study to Showcase"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-6 py-2.5 text-xs font-bold rounded-lg transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* List Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {list.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{item.category}</span>
                  <h4 className="font-display text-lg font-bold text-slate-900 leading-tight">{item.title}</h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="text-slate-400 hover:text-amber-600 p-1 transition-colors"
                    title="Edit Case Study"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Delete Case Study"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 border border-slate-100 relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                {item.tags && (
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {item.tags.split(",").slice(0, 2).map((t) => (
                      <span key={t} className="bg-slate-900/90 text-white rounded text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Intake:</strong> {item.challenge}</p>
                <p><strong>Result:</strong> {item.result}</p>
              </div>
            </div>

            {item.stats && item.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                {item.stats.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="bg-white p-1 text-center rounded border border-slate-100">
                    <span className="block text-[11px] font-bold text-amber-600 font-mono truncate">{s.value}</span>
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest truncate">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Edit Order Drawer Component
function EditOrderDrawer({
  order,
  onClose,
  onSave,
}: {
  order: AdminOrder;
  onClose: () => void;
  onSave: (order: AdminOrder) => void;
}) {
  const [draft, setDraft] = useState<AdminOrder>({ ...order });
  const [isStickersModalOpen, setIsStickersModalOpen] = useState(false);
  const [singlePrintGarment, setSinglePrintGarment] = useState<any | null>(null);

  function updateField<K extends keyof AdminOrder>(key: K, val: AdminOrder[K]) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="flex h-full w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Order Management Drawer</span>
            <h2 className="font-display text-xl font-bold">Order #{draft.reference}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Advance Stage Status</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {statusPipeline.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateField("status", st)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-bold transition-all text-left flex items-center justify-between",
                    draft.status === st
                      ? "border-amber-500 bg-amber-500 text-slate-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                  )}
                >
                  <span>{st}</span>
                  {draft.status === st && <CheckCircle2 className="size-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Customer Name</label>
              <input
                type="text"
                value={draft.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Phone Number</label>
              <input
                type="text"
                value={draft.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Doorstep Address</label>
            <textarea
              rows={2}
              value={draft.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Logistics Method</label>
              <select
                value={draft.logistics}
                onChange={(e) => updateField("logistics", e.target.value as any)}
                className="mt-1 w-full rounded-none border border-slate-300 p-2 text-sm font-semibold bg-white"
              >
                <option value="pickup-delivery">Doorstep Pickup</option>
                <option value="drop-off">Studio Drop-off</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Date</label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="mt-1 w-full rounded-none border border-slate-300 p-2 text-sm font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Time Slot</label>
              <input
                type="text"
                value={draft.slot}
                onChange={(e) => updateField("slot", e.target.value)}
                className="mt-1 w-full rounded-none border border-slate-300 p-2 text-sm font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Payment Status</label>
              <select
                value={draft.paymentStatus}
                onChange={(e) => updateField("paymentStatus", e.target.value as PaymentStatus)}
                className="mt-1 w-full rounded-none border border-slate-300 p-2 text-sm font-semibold bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Paid - UPI">Paid - UPI</option>
                <option value="Paid - Card">Paid - Card</option>
                <option value="Paid - Cash">Paid - Cash</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Confirmed Quote Amount (₹)</label>
              <input
                type="number"
                value={draft.quoteAmount}
                onChange={(e) => updateField("quoteAmount", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-mono text-lg font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Assigned Studio Technician</label>
              <input
                type="text"
                value={draft.assignedTechnician || ""}
                onChange={(e) => updateField("assignedTechnician", e.target.value)}
                placeholder="e.g. Master Tech Ramesh V."
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Fabric Notes &amp; Internal Handling</label>
            <textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="e.g. Blackout curtain lining - laser measured intake 14.2 ft."
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>

          {/* Live Customer Alert / Announcement */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Megaphone className="size-3.5 text-amber-600" /> Live Customer Alert / Studio Announcement
            </label>
            <p className="text-[11px] text-amber-800">This message will be highlighted directly on the client's order tracking page.</p>
            <input
              type="text"
              value={draft.adminAlert || ""}
              onChange={(e) => updateField("adminAlert", e.target.value)}
              placeholder="e.g. Heavy rain near Konanakunte may delay delivery slot by 20 mins."
              className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Cancellation Reason (especially relevant if Cancelled) */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase tracking-wider">
              <AlertCircle className="size-3.5 text-rose-600" /> Cancellation Reason (Shown to client if Cancelled)
            </label>
            <textarea
              rows={2}
              value={draft.cancellationReason || ""}
              onChange={(e) => updateField("cancellationReason", e.target.value)}
              placeholder="e.g. Client requested cancellation due to travel schedule. Full refund processed."
              className="w-full rounded-lg border border-rose-300 bg-white p-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Driver Doorstep GPS Route</span>
              </div>
              <a
                href={draft.coords ? `https://www.google.com/maps/dir/?api=1&destination=${draft.coords.lat},${draft.coords.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(draft.address)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow"
              >
                <Navigation className="size-3" /> Start Driver Google Maps Route <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="mt-2 text-xs text-slate-300">{draft.address}</p>
            {draft.coords && (
              <p className="mt-1 text-[11px] font-mono text-amber-300">
                Exact Device GPS: {draft.coords.lat.toFixed(5)}, {draft.coords.lng.toFixed(5)} · {draft.distanceKm?.toFixed(1) || "2.1"} km from Konanakunte Studio
              </p>
            )}
          </div>

          {/* UNIQUE GARMENT IDENTIFICATION SYSTEM */}
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="size-5 text-amber-500" /> Garment-Level Identification
                </h3>
                <p className="text-xs text-slate-500">Every item in this order has a unique laundry tag code.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSinglePrintGarment(null);
                  setIsStickersModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none shadow-sm transition-colors focus:outline-none"
              >
                <Printer className="size-3.5" /> Print All Stickers
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                    <th className="py-2 text-left">Garment Programme</th>
                    <th className="py-2 text-center">Unit / Index</th>
                    <th className="py-2 text-right">Unique Garment ID</th>
                    <th className="py-2 text-right w-24">Sticker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {generateGarmentsForOrder(draft).map((garment) => (
                    <tr key={garment.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-900">{garment.serviceName}</td>
                      <td className="py-2.5 text-center text-slate-500">
                        {garment.index} of {garment.totalQuantity}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-amber-650">{garment.id}</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSinglePrintGarment(garment);
                            setIsStickersModalOpen(true);
                          }}
                          className="text-[10px] font-bold uppercase text-amber-600 hover:text-amber-700 underline focus:outline-none"
                        >
                          Print Sticker
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Printable Garment Stickers */}
        {isStickersModalOpen && (
          <div
            onClick={() => {
              setIsStickersModalOpen(false);
              setSinglePrintGarment(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-none border border-slate-200 shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 flex flex-col animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Garment Tag Stickers</h3>
                  <p className="text-xs text-slate-500">Optimized layout for 2 in × 1 in (approx. 50.8 × 25.4 mm) thermal sticky labels.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsStickersModalOpen(false);
                    setSinglePrintGarment(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Selection Summary */}
              <div className="bg-slate-50 p-4 border border-slate-200 text-xs flex justify-between items-center text-slate-700">
                <div>
                  <span>Printing Target: </span>
                  <span className="font-bold text-slate-900">
                    {singlePrintGarment 
                      ? `Single Garment (${singlePrintGarment.id})` 
                      : `All Garments (${generateGarmentsForOrder(draft).length} labels)`
                    }
                  </span>
                </div>
                <div>
                  <span>Client: </span>
                  <span className="font-bold text-slate-900">{draft.customerName}</span>
                </div>
              </div>

              {/* Printable Stickers Sheet */}
              <div className="border border-slate-200 p-4 bg-slate-100 flex flex-wrap gap-4 justify-center overflow-y-auto max-h-[45vh]">
                <div id="printable-sticker-sheet" className="flex flex-wrap gap-4 justify-center bg-white p-6 shadow-inner border border-dashed border-slate-350">
                  {/* Inline Print Stylesheets to override everything else during window.print() */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #printable-sticker-sheet, #printable-sticker-sheet * {
                        visibility: visible !important;
                      }
                      #printable-sticker-sheet {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 0.15in !important;
                      }
                      .sticker-card-print {
                        width: 2in !important;
                        height: 1in !important;
                        border: 1px solid #000 !important;
                        padding: 0.08in !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        font-family: monospace !important;
                        font-size: 7.5pt !important;
                        line-height: 1.25 !important;
                        background: white !important;
                        color: black !important;
                      }
                    }
                  `}} />

                  {(singlePrintGarment ? [singlePrintGarment] : generateGarmentsForOrder(draft)).map((garment) => (
                    <div 
                      key={garment.id}
                      className="sticker-card-print w-[2in] h-[1in] border border-slate-300 bg-white p-2 text-[10px] leading-tight font-mono flex flex-col justify-between shadow-xs select-all text-slate-800"
                      title="Sticker dimensions: 2 in x 1 in"
                    >
                      <div className="border-b border-slate-100 pb-0.5 flex justify-between font-bold text-[8px] uppercase tracking-wider text-slate-500">
                        <span>SPIN &amp; DRY</span>
                        <span>#{draft.reference.replace(/[^0-9]/g, "").slice(-4)}</span>
                      </div>
                      <div className="space-y-0.5 my-1 text-[9px]">
                        <div><strong>CUST:</strong> {draft.customerName.slice(0, 16)}</div>
                        <div className="truncate"><strong>ITEM:</strong> {garment.serviceName} ({garment.index}/{garment.totalQuantity})</div>
                        <div><strong>CONT:</strong> {draft.phone}</div>
                      </div>
                      <div className="bg-slate-900 text-white font-bold text-center py-0.5 text-[9px] tracking-wider uppercase">
                        {garment.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsStickersModalOpen(false);
                    setSinglePrintGarment(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-none uppercase hover:bg-slate-50"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-7 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none shadow-md transition-colors"
                >
                  Print Label Sticker Sheets
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 uppercase"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-lg bg-amber-500 px-7 py-2.5 text-xs font-bold text-slate-950 uppercase shadow-md hover:bg-amber-400"
          >
            Save Order Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Order Modal Component
function CreateOrderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (order: AdminOrder) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("560062");
  const [serviceSlug, setServiceSlug] = useState("curtain-cleaning");
  const [quantity, setQuantity] = useState(2);
  const [unitPrice, setUnitPrice] = useState(450);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Please provide Customer Name, Phone, and Address.");
      return;
    }

    const selectedService = defaultServices.find((s) => s.slug === serviceSlug);
    const serviceName = selectedService ? selectedService.name : "Fabric Cleaning";

    const newOrder: AdminOrder = {
      reference: `SD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      customerName: name,
      phone,
      email: "client@spinanddry.com",
      customerType: "residential",
      logistics: "pickup-delivery",
      date: new Date().toISOString().slice(0, 10),
      slot: "10:00 – 12:00",
      address,
      pincode,
      coords: site.coords,
      distanceKm: 2.5,
      status: "Pending Intake",
      paymentStatus: "Pending",
      isExpress: false,
      notes,
      items: [{ serviceSlug, serviceName, quantity, unitPrice }],
      quoteAmount: quantity * unitPrice,
      assignedTechnician: "Studio Intake Team",
    };

    onCreate(newOrder);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Manual Entry Form</span>
            <h2 className="font-display text-lg font-bold">Register Studio Order</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Customer Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Pickup Address *</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address and landmark..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Primary Service</label>
              <select
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                {defaultServices.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Est. Unit Price (₹)</label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Fabric Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Silk drapery - delicate handling"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-7 py-2.5 text-xs font-bold text-slate-950 uppercase shadow-md hover:bg-amber-400"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Printable Receipt Modal Component
function PrintableReceiptModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white print:hidden">
          <span className="font-display font-bold">Digital Receipt Preview</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 rounded hover:bg-amber-400"
            >
              <Printer className="size-3.5" /> Print Manifest
            </button>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 font-sans text-slate-900 bg-white">
          <div className="flex items-start justify-between border-b border-slate-300 pb-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">{site.name}</h1>
              <p className="text-xs text-slate-600">{site.tagline}</p>
              <p className="mt-1 text-xs text-slate-500">{site.address}</p>
              <p className="text-xs text-slate-500">Phone: {site.phone} · GST: 29AAAAA0000A1Z5</p>
            </div>
            <div className="text-right">
              <span className="rounded bg-slate-900 px-3 py-1 text-xs font-bold text-white uppercase font-mono">
                #{order.reference}
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-emerald-600 font-bold uppercase">{order.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-6">
            <div>
              <span className="font-bold text-slate-500 uppercase">Customer Details</span>
              <p className="mt-1 font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.phone}</p>
              <p className="mt-1 text-slate-600">{order.address}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Service Schedule</span>
              <p className="mt-1 text-slate-900 font-semibold">Slot: {order.date} ({order.slot})</p>
              <p className="text-slate-600">Type: {order.logistics === "pickup-delivery" ? "Doorstep Collection" : "Studio Drop-off"}</p>
              <p className="text-slate-600 font-medium">Tech Assigned: {order.assignedTechnician || "Studio Team"}</p>
            </div>
          </div>

          <div>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-3 border-b border-slate-200">Service Description</th>
                  <th className="p-3 border-b border-slate-200 text-center">Qty</th>
                  <th className="p-3 border-b border-slate-200 text-right">Rate</th>
                  <th className="p-3 border-b border-slate-200 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3">{item.serviceName}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">₹{item.unitPrice}</td>
                    <td className="p-3 text-right font-mono font-bold">₹{item.quantity * item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                <tr>
                  <td colSpan={3} className="p-3 text-right">Total Confirmed Investment:</td>
                  <td className="p-3 text-right font-mono text-sm text-emerald-700">₹{order.quoteAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-4 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Spin &amp; Dry Guarantee: Zero dimensional shrinkage · Eco-solvent technology</span>
            <span className="font-mono">Payment: {order.paymentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintStickersModal({
  order,
  onClose,
}: {
  order: AdminOrder;
  onClose: () => void;
}) {
  const [singlePrintGarment, setSinglePrintGarment] = useState<any | null>(null);
  
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-none border border-slate-200 shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-display text-2xl font-bold text-slate-900">Garment Tag Stickers</h3>
            <p className="text-xs text-slate-500">Optimized layout for 2 in × 1 in (approx. 50.8 × 25.4 mm) thermal sticky labels.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Selection Summary */}
        <div className="bg-slate-50 p-4 border border-slate-200 text-xs flex justify-between items-center text-slate-700">
          <div>
            <span>Printing Target: </span>
            <span className="font-bold text-slate-900">
              {singlePrintGarment 
                ? `Single Garment (${singlePrintGarment.id})` 
                : `All Garments (${generateGarmentsForOrder(order).length} labels)`
              }
            </span>
          </div>
          <div>
            <span>Client: </span>
            <span className="font-bold text-slate-900">{order.customerName}</span>
          </div>
        </div>

        {/* List of garments to pick individual from if desired */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSinglePrintGarment(null)}
            className={cn(
              "px-3 py-1.5 border font-bold uppercase tracking-wider rounded-none transition-colors",
              singlePrintGarment === null 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            All Garments
          </button>
          {generateGarmentsForOrder(order).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSinglePrintGarment(g)}
              className={cn(
                "px-3 py-1.5 border font-mono text-[10px] rounded-none transition-colors",
                singlePrintGarment?.id === g.id
                  ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              {g.id.split("-").slice(-2).join("-")}
            </button>
          ))}
        </div>

        {/* Printable Stickers Sheet */}
        <div className="border border-slate-200 p-4 bg-slate-100 flex flex-wrap gap-4 justify-center overflow-y-auto max-h-[40vh]">
          <div id="printable-sticker-sheet" className="flex flex-wrap gap-4 justify-center bg-white p-6 shadow-inner border border-dashed border-slate-350">
            {/* Inline Print Stylesheets to override everything else during window.print() */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-sticker-sheet, #printable-sticker-sheet * {
                  visibility: visible !important;
                }
                #printable-sticker-sheet {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  display: flex !important;
                  flex-wrap: wrap !important;
                  gap: 0.15in !important;
                }
                .sticker-card-print {
                  width: 2in !important;
                  height: 1in !important;
                  border: 1px solid #000 !important;
                  padding: 0.08in !important;
                  box-sizing: border-box !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                  font-family: monospace !important;
                  font-size: 7.5pt !important;
                  line-height: 1.25 !important;
                  background: white !important;
                  color: black !important;
                }
              }
            `}} />

            {(singlePrintGarment ? [singlePrintGarment] : generateGarmentsForOrder(order)).map((garment) => (
              <div 
                key={garment.id}
                className="sticker-card-print w-[2in] h-[1in] border border-slate-300 bg-white p-2 text-[10px] leading-tight font-mono flex flex-col justify-between shadow-xs select-all text-slate-800"
                title="Sticker dimensions: 2 in x 1 in"
              >
                <div className="border-b border-slate-100 pb-0.5 flex justify-between font-bold text-[8px] uppercase tracking-wider text-slate-500">
                  <span>SPIN &amp; DRY</span>
                  <span>#{order.reference.replace(/[^0-9]/g, "").slice(-4)}</span>
                </div>
                <div className="space-y-0.5 my-1 text-[9px]">
                  <div><strong>CUST:</strong> {order.customerName.slice(0, 16)}</div>
                  <div className="truncate"><strong>ITEM:</strong> {garment.serviceName} ({garment.index}/{garment.totalQuantity})</div>
                  <div><strong>CONT:</strong> {order.phone}</div>
                </div>
                <div className="bg-slate-900 text-white font-bold text-center py-0.5 text-[9px] tracking-wider uppercase">
                  {garment.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-none uppercase hover:bg-slate-50"
          >
            Close Preview
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-7 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none shadow-md transition-colors"
          >
            Print Label Sticker Sheets
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: ANALYTICS & INSIGHTS
// -------------------------------------------------------------
function AnalyticsCMSSection({ orders }: { orders: AdminOrder[] }) {
  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d" | "today">("all");

  const filteredOrders = useMemo(() => {
    if (timeframe === "all") return orders;
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (timeframe === "30d") return diffDays <= 30;
      if (timeframe === "7d") return diffDays <= 7;
      if (timeframe === "today") {
        const todayStr = now.toISOString().slice(0, 10);
        return o.createdAt.startsWith(todayStr);
      }
      return true;
    });
  }, [orders, timeframe]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const activeOrders = filteredOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;
    const pendingIntake = filteredOrders.filter((o) => o.status === "Pending Intake").length;
    const grossRevenue = filteredOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.quoteAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    const within10kmCount = filteredOrders.filter((o) => (o.distanceKm || 0) <= 10).length;
    const outside10kmCount = totalOrders - within10kmCount;

    const commercialCount = filteredOrders.filter((o) => o.customerType === "commercial").length;
    const residentialCount = totalOrders - commercialCount;

    const expressCount = filteredOrders.filter((o) => o.isExpress).length;

    // Payment metrics
    const paymentUPI = filteredOrders.filter((o) => o.paymentStatus === "Paid - UPI").length;
    const paymentCard = filteredOrders.filter((o) => o.paymentStatus === "Paid - Card").length;
    const paymentCash = filteredOrders.filter((o) => o.paymentStatus === "Paid - Cash").length;
    const paymentPending = filteredOrders.filter((o) => o.paymentStatus === "Pending").length;

    // Calculate service distribution
    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      if (o.status === "Cancelled") return;
      o.items.forEach((item) => {
        const key = item.serviceName || "Other Care";
        if (!serviceMap[key]) {
          serviceMap[key] = { count: 0, revenue: 0 };
        }
        serviceMap[key].count += item.quantity;
        serviceMap[key].revenue += (item.quantity * item.unitPrice);
      });
    });

    const serviceStats = Object.entries(serviceMap).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      totalOrders,
      activeOrders,
      pendingIntake,
      grossRevenue,
      avgOrderValue,
      within10kmCount,
      outside10kmCount,
      commercialCount,
      residentialCount,
      expressCount,
      paymentUPI,
      paymentCard,
      paymentCash,
      paymentPending,
      serviceStats,
    };
  }, [filteredOrders]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Executive Intelligence</span>
          <h2 className="font-display text-2xl font-bold text-slate-900">Revenue &amp; Operations Analytics</h2>
          <p className="text-xs text-slate-500">Live operational metrics, service statistics, and transaction analyses.</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200">
          {(["all", "30d", "7d", "today"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-none",
                timeframe === t
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {t === "all" && "All Time"}
              {t === "30d" && "Last 30 Days"}
              {t === "7d" && "Last 7 Days"}
              {t === "today" && "Today"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Gross Portfolio Revenue</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-slate-900">₹{metrics.grossRevenue.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">Live</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Quotes &amp; Bookings in scope</p>
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Average Order Value (AOV)</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-slate-900">₹{metrics.avgOrderValue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-mono">per booking</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Across {metrics.totalOrders} filter matched bookings</p>
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Express Turnaround Ratio</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-purple-700">
              {metrics.totalOrders > 0 ? Math.round((metrics.expressCount / metrics.totalOrders) * 100) : 0}%
            </span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 border border-purple-200">24h Express</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{metrics.expressCount} express care requests</p>
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">B2B Commercial Accounts</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-indigo-900">
              {metrics.totalOrders > 0 ? Math.round((metrics.commercialCount / metrics.totalOrders) * 100) : 0}%
            </span>
            <span className="text-[10px] font-bold text-indigo-850 bg-indigo-50 px-2 py-0.5 border border-indigo-200">Commercial</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{metrics.commercialCount} corporate clients</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Service stats card (2/3 width) */}
        <div className="lg:col-span-2 rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Fabric Programme Demand &amp; Revenue Share
          </h3>
          <p className="text-xs text-slate-500">Detailed overview of order volumes and gross returns categorized by care program.</p>
          
          {metrics.serviceStats.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No service item metrics found for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                    <th className="py-2.5">Fabric Care Service</th>
                    <th className="py-2.5 text-center">Volume</th>
                    <th className="py-2.5 text-right">Revenue</th>
                    <th className="py-2.5 text-right w-1/3">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.serviceStats.map((item) => {
                    const share = metrics.grossRevenue > 0 ? Math.round((item.revenue / metrics.grossRevenue) * 100) : 0;
                    return (
                      <tr key={item.name} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-3 text-center text-slate-600 font-bold">{item.count} items</td>
                        <td className="py-3 text-right font-semibold text-slate-900">₹{item.revenue.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold font-mono text-[10px] text-slate-500">{share}%</span>
                            <div className="h-1.5 w-16 bg-slate-100 overflow-hidden rounded-none hidden sm:block">
                              <div
                                className="h-full bg-amber-500"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side columns: Payment channels and logistics */}
        <div className="space-y-6 lg:col-span-1">
          {/* Payment breakdown card */}
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Payment Status Share
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Pending / Unpaid ({metrics.paymentPending})</span>
                  <span>{metrics.totalOrders > 0 ? Math.round((metrics.paymentPending / metrics.totalOrders) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${metrics.totalOrders > 0 ? (metrics.paymentPending / metrics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Paid via UPI ({metrics.paymentUPI})</span>
                  <span>{metrics.totalOrders > 0 ? Math.round((metrics.paymentUPI / metrics.totalOrders) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${metrics.totalOrders > 0 ? (metrics.paymentUPI / metrics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Paid via Credit Card ({metrics.paymentCard})</span>
                  <span>{metrics.totalOrders > 0 ? Math.round((metrics.paymentCard / metrics.totalOrders) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${metrics.totalOrders > 0 ? (metrics.paymentCard / metrics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Paid via Cash ({metrics.paymentCash})</span>
                  <span>{metrics.totalOrders > 0 ? Math.round((metrics.paymentCash / metrics.totalOrders) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-none bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-500"
                    style={{ width: `${metrics.totalOrders > 0 ? (metrics.paymentCash / metrics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logistics & radius coverage */}
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Logistics &amp; Range Coverage
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Free Studio Zone (Within 10 km)</span>
                <span className="font-bold text-slate-800">{metrics.within10kmCount} orders</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Extended Service Area</span>
                <span className="font-bold text-slate-800">{metrics.outside10kmCount} orders</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Residential Clients</span>
                <span className="font-bold text-slate-800">{metrics.residentialCount} accounts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial / Corporate</span>
                <span className="font-bold text-slate-800">{metrics.commercialCount} accounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CMS SECTION: HERO SLIDESHOW IMAGES
// -------------------------------------------------------------
function HeroSlideshowCMSSection({
  heroSlides,
  onUpdate,
}: {
  heroSlides: string[];
  onUpdate: (slides: string[]) => void;
}) {
  const [slides, setSlides] = useState<string[]>([...heroSlides]);
  const [inputUrl, setInputUrl] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const updated = [...slides, reader.result];
        setSlides(updated);
        onUpdate(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrl = () => {
    if (!inputUrl.trim()) return;
    const updated = [...slides, inputUrl.trim()];
    setSlides(updated);
    onUpdate(updated);
    setInputUrl("");
  };

  const handleDelete = (index: number) => {
    const updated = slides.filter((_, idx) => idx !== index);
    setSlides(updated);
    onUpdate(updated);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index]!;
    updated[index] = updated[targetIdx]!;
    updated[targetIdx] = temp;
    setSlides(updated);
    onUpdate(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="font-display text-lg font-bold text-slate-900">Manage Slideshow Images</h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload fabric care photos or paste Unsplash image URLs to create a rotating hero background.
        </p>

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Paste Image URL</label>
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none bg-slate-50"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>

          <div className="shrink-0">
            <label className="block text-xs font-bold text-slate-700 uppercase">Upload Local Photo</label>
            <div className="mt-2 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="border border-dashed border-slate-300 rounded-lg px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors">
                <ImageIcon className="size-4 text-slate-400" />
                <span>Upload Image file</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {slides.map((slide, idx) => (
          <div key={slide + idx} className="group relative border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-200">
              <img src={slide} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                Slide {idx + 1}
              </div>
            </div>

            <div className="p-3 flex items-center justify-between gap-2 bg-slate-50/50 mt-auto">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveSlide(idx, "up")}
                  className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  title="Move Slide Up"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === slides.length - 1}
                  onClick={() => moveSlide(idx, "down")}
                  className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  title="Move Slide Down"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                title="Delete Slide"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="col-span-full border border-dashed border-slate-300 rounded-xl p-12 text-center bg-white shadow-xs">
            <ImageIcon className="size-10 text-slate-300 mx-auto" />
            <h4 className="mt-3 text-sm font-bold text-slate-900">No slideshow images defined</h4>
            <p className="mt-1 text-xs text-slate-500">Add slides using the controls above to start showing a sliding hero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
