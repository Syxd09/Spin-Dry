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
} from "lucide-react";
import { site } from "@/data/site";
import { services as defaultServices, Service } from "@/data/services";
import {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  CMSData,
  TestimonialItem,
  JourneyStepItem,
  StudioSettings,
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

type SidebarTab = "orders" | "analytics" | "services" | "testimonials" | "process" | "settings";

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
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<SidebarTab>("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);

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

    if (userHash === ADMIN_USER_HASH && passHash === ADMIN_PASS_HASH) {
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
    return orders.filter((o) => {
      const matchSearch =
        o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery) ||
        o.pincode.includes(searchQuery) ||
        o.address.toLowerCase().includes(searchQuery.toLowerCase());

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

  function handleResetSeed() {
    if (confirm("Reset all orders to initial sample demonstration data?")) {
      const reset = resetToSeedOrders();
      setOrders(reset);
      setSelectedOrder(null);
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-800/50 bg-rose-950/60 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-amber-500 py-3 text-xs font-bold text-slate-950 uppercase tracking-wider shadow-lg hover:bg-amber-400 active:scale-[0.99] transition-all"
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
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
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
              { id: "services", label: "Services Catalog", icon: Tag, badge: cms.services.length },
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
              {activeTab === "services" && "Catalog Management"}
              {activeTab === "testimonials" && "Social Proof & Reviews"}
              {activeTab === "process" && "Customer Journey Steps"}
              {activeTab === "settings" && "Studio Contact & Hours"}
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 capitalize">
              {activeTab === "orders" && "Orders & Logistics Command"}
              {activeTab === "analytics" && "Revenue & Operations Analytics"}
              {activeTab === "services" && "Fabric Care Services Manager"}
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
                  onClick={handleResetSeed}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <RefreshCw className="size-3.5 text-amber-600" /> Reset Demo Orders
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
                            className={cn(
                              "hover:bg-slate-50/80 transition-colors border-b border-slate-100",
                              isSelected && "bg-amber-50/40",
                            )}
                          >
                            <td className="px-3.5 py-4 text-center">
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
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleStatusChange(o.reference, e.target.value as OrderStatus)}
                                  className={cn(
                                    "rounded-full border px-3 py-1 text-xs font-bold transition-all focus:outline-none cursor-pointer shadow-xs",
                                    statusColors[o.status],
                                  )}
                                >
                                  {statusPipeline.map((st) => (
                                    <option key={st} value={st} className="bg-white text-slate-900">
                                      {st}
                                    </option>
                                  ))}
                                  <option value="Cancelled" className="bg-white text-rose-700">
                                    Cancelled
                                  </option>
                                </select>
                                {o.status !== "Completed" && o.status !== "Cancelled" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAdvance(o.reference, o.status)}
                                    className="rounded-full bg-slate-100 p-1 text-slate-600 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-xs"
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

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
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
    </div>
  );
}

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
            {editingSlug === s.slug ? (
              <ServiceInlineEditor
                service={s}
                onSave={handleSaveService}
                onCancel={() => setEditingSlug(null)}
              />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                    {s.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{s.turnaround}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">{s.name}</h3>
                <p className="mt-2 text-xs text-slate-600 line-clamp-3">{s.summary}</p>
              </div>
            )}

            {!editingSlug && (
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
            )}
          </div>
        ))}
      </div>
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

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-bold uppercase text-slate-500">Service Name</label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="w-full rounded border border-slate-300 p-1.5 text-xs font-bold"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase text-slate-500">Turnaround Time</label>
        <input
          type="text"
          value={draft.turnaround}
          onChange={(e) => setDraft({ ...draft, turnaround: e.target.value })}
          className="w-full rounded border border-slate-300 p-1.5 text-xs"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase text-slate-500">Summary</label>
        <textarea
          rows={3}
          value={draft.summary}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          className="w-full rounded border border-slate-300 p-1.5 text-xs"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="text-xs text-slate-500 hover:underline">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950"
        >
          Save
        </button>
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

  function handleAdd() {
    if (!newQuote || !newName) return;
    const newItem: TestimonialItem = {
      id: `test-${Date.now()}`,
      quote: newQuote,
      name: newName,
      role: newRole || "Bengaluru Resident",
    };
    const next = [newItem, ...list];
    setList(next);
    onUpdate(next);
    setNewQuote("");
    setNewName("");
    setNewRole("");
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
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Client Name (e.g. Ananya R.)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded border border-slate-300 p-2 text-sm"
          />
          <input
            type="text"
            placeholder="Role / Area (e.g. Villa Owner, JP Nagar)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="rounded border border-slate-300 p-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-amber-500 text-slate-950 px-5 py-2 text-xs font-bold rounded shadow hover:bg-amber-400"
        >
          Add Testimonial
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between gap-4">
            <div>
              <blockquote className="font-display text-lg text-slate-900">“{t.quote}”</blockquote>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {t.name} — <span className="text-amber-700">{t.role}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(t.id)}
              className="text-rose-500 hover:text-rose-700 p-1"
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

  function handleSave() {
    onUpdate(draft);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Studio Settings &amp; Info</h2>
        <p className="text-xs text-slate-500">Update studio phone, address, operating hours, and service radius settings.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Studio Phone Number</label>
            <input
              type="text"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Studio Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700">Studio Hub Address</label>
          <textarea
            rows={2}
            value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Free Pickup Radius (km)</label>
            <input
              type="number"
              value={draft.pickupRadiusKm}
              onChange={(e) => setDraft({ ...draft, pickupRadiusKm: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm font-bold text-amber-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Founding Year</label>
            <input
              type="number"
              value={draft.founded}
              onChange={(e) => setDraft({ ...draft, founded: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="bg-amber-500 text-slate-950 px-7 py-3 text-xs font-bold rounded-lg shadow hover:bg-amber-400"
          >
            Save Studio Settings
          </button>
        </div>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Date</label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Time Slot</label>
              <input
                type="text"
                value={draft.slot}
                onChange={(e) => updateField("slot", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Payment Status</label>
              <select
                value={draft.paymentStatus}
                onChange={(e) => updateField("paymentStatus", e.target.value as PaymentStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold"
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
        </div>

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

// -------------------------------------------------------------
// CMS SECTION: ANALYTICS & INSIGHTS
// -------------------------------------------------------------
function AnalyticsCMSSection({ orders }: { orders: AdminOrder[] }) {
  const metrics = calculateMetrics(orders);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Executive Intelligence</span>
        <h2 className="font-display text-2xl font-bold text-slate-900">Revenue &amp; Operations Analytics</h2>
        <p className="text-xs text-slate-500">Live operational metrics, order distribution, customer ratios, and revenue insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Gross Portfolio Revenue</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-slate-900">₹{metrics.grossRevenue.toLocaleString()}</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Live</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Confirmed Quotes &amp; Bookings</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Average Order Value (AOV)</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-slate-900">₹{metrics.avgOrderValue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-mono">per booking</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Across {metrics.totalOrders} total registered orders</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Free Pickup Zone Coverage</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-emerald-700">
              {metrics.totalOrders > 0 ? Math.round((metrics.within10kmCount / metrics.totalOrders) * 100) : 0}%
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Within 10 km</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{metrics.within10kmCount} orders within studio radius</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Commercial Account Ratio</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-indigo-900">
              {metrics.totalOrders > 0 ? Math.round((metrics.commercialCount / metrics.totalOrders) * 100) : 0}%
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Hotels &amp; Offices</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{metrics.commercialCount} B2B commercial accounts</p>
        </div>
      </div>

      {/* Customer Segments & Logistics Progress Bars */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="size-5 text-amber-500" /> Customer Account Distribution
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Residential Households ({metrics.residentialCount})</span>
                <span>{metrics.totalOrders > 0 ? Math.round((metrics.residentialCount / metrics.totalOrders) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${metrics.totalOrders > 0 ? (metrics.residentialCount / metrics.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Commercial Hotels &amp; Offices ({metrics.commercialCount})</span>
                <span>{metrics.totalOrders > 0 ? Math.round((metrics.commercialCount / metrics.totalOrders) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${metrics.totalOrders > 0 ? (metrics.commercialCount / metrics.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="size-5 text-emerald-600" /> Logistics Distance Radius Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Within 10 km Free Studio Radius ({metrics.within10kmCount})</span>
                <span>{metrics.totalOrders > 0 ? Math.round((metrics.within10kmCount / metrics.totalOrders) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${metrics.totalOrders > 0 ? (metrics.within10kmCount / metrics.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Extended Service Area ({metrics.outside10kmCount})</span>
                <span>{metrics.totalOrders > 0 ? Math.round((metrics.outside10kmCount / metrics.totalOrders) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${metrics.totalOrders > 0 ? (metrics.outside10kmCount / metrics.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
