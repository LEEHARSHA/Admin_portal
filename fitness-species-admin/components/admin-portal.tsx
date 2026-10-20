"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  FileText,
  Filter,
  HelpCircle,
  LayoutGrid,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminAuth } from "@/components/admin-auth";
import { categories, dashboardStats, notifications, products, sellers, type Product } from "@/lib/mock-data";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Products", href: "/products/pending", icon: ShoppingBag },
  { label: "Pending Review", href: "/products/pending", icon: FileText },
  { label: "Approved", href: "/products/approved", icon: PackageCheck },
  { label: "Rejected", href: "/products/rejected", icon: AlertTriangle },
  { label: "Sellers", href: "/sellers", icon: Users },
  { label: "Categories", href: "/categories", icon: Tag },
  { label: "Reports", href: "/reports", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: Product["status"] | "approved" | "pending" | "rejected" | "suspended" }) {
  const stylingMap = {
    pending: "bg-[#FFF3DC] text-[#B76B00] border-[#F7D998]",
    approved: "bg-[#EAF6F2] text-[#067D62] border-[#BDE2D5]",
    rejected: "bg-[#FCE7E3] text-[#C7511F] border-[#F3B7A1]",
    suspended: "bg-[#F1F3F6] text-[#5F6B7A] border-[#D5D9D9]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        stylingMap[status as keyof typeof stylingMap] ?? stylingMap.pending,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PageIntro({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">{title}</h1>
        <p className="mt-1 text-sm text-[#5F6B7A]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminLayout({
  activeNav,
  children,
}: {
  activeNav: string;
  children: React.ReactNode;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { user, signOut } = useAdminAuth();
  const router = useRouter();
  const accountLabel = user?.displayName || user?.email || "Signed-in user";
  const avatarLabel = accountLabel
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setSignOutError(null);
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#172033]">
      <header className="sticky top-0 z-40 border-b border-[#D5D9D9] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D5D9D9] text-[#172033] lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9900] text-sm font-bold text-white shadow-sm">
              FS
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#5F6B7A]">Fitness Species</div>
              <div className="text-sm font-semibold text-[#172033]">Powered by ALK</div>
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-center px-4 md:flex">
            <label className="relative block w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7A]" />
              <input
                placeholder="Search products, sellers, SKU..."
                className="h-11 w-full rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] pl-10 pr-4 text-sm text-[#172033] placeholder:text-[#5F6B7A] outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20"
              />
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((value) => !value)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D5D9D9] bg-white text-[#172033]"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#FF9900] ring-2 ring-white" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="absolute right-0 top-12 w-[340px] rounded-xl border border-[#D5D9D9] bg-white p-3 shadow-lg"
                  >
                    <div className="mb-2 flex items-center justify-between px-2 py-1">
                      <span className="text-sm font-semibold text-[#172033]">Notifications</span>
                      <span className="text-xs text-[#5F6B7A]">5 new</span>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((item) => (
                        <div key={item.title} className="rounded-lg border border-[#F1F3F6] p-2.5">
                          <div className="flex items-start gap-2">
                            <span className={cn("mt-1 h-2 w-2 rounded-full", item.unread ? "bg-[#FF9900]" : "bg-[#D5D9D9]")} />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[#172033]">{item.title}</div>
                              <div className="mt-1 text-xs text-[#5F6B7A]">{item.details}</div>
                              <div className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[#5F6B7A]">{item.time}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="button" className="hidden items-center gap-2 rounded-lg border border-[#D5D9D9] bg-white px-2 py-2 text-sm text-[#172033] md:inline-flex">
              <HelpCircle className="h-4 w-4" />
              Help
            </button>

            <div className="flex items-center gap-2 rounded-lg border border-[#D5D9D9] bg-white p-1.5">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#146EB4] text-sm font-semibold text-white"
              >
                {avatarLabel || "U"}
              </div>
              <div className="hidden max-w-48 text-left sm:block">
                <div className="truncate text-sm font-semibold text-[#172033]">{accountLabel}</div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#5F6B7A]">Firebase account</div>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-md px-2 py-2 text-xs font-medium text-[#5F6B7A] hover:bg-[#F7F7F7] hover:text-[#172033]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {signOutError && (
        <p role="alert" className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-700 sm:px-6 lg:px-8">
          {signOutError}
        </p>
      )}
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className={cn("w-full max-w-[260px] shrink-0 lg:block", mobileOpen ? "block" : "hidden")}>
          <div className="rounded-xl border border-[#D5D9D9] bg-white p-3 shadow-sm">
            <nav className="space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = activeNav === label || (label === "Products" && activeNav === "Pending Review");
                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-[#F7F7F7] text-[#172033] shadow-[inset_2px_0_0_#FF9900]"
                        : "text-[#5F6B7A] hover:bg-[#F7F7F7] hover:text-[#172033]",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro
        title="Good morning, Admin"
        subtitle="Here's what needs your attention today."
        action={
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#FF9900] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e98800]">
            Review Products
            <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-[#5F6B7A]">{stat.label}</div>
              <div
                className={cn(
                  "inline-flex h-2.5 w-2.5 rounded-full",
                  stat.tone === "warning" && "bg-[#F08804]",
                  stat.tone === "success" && "bg-[#067D62]",
                  stat.tone === "danger" && "bg-[#C7511F]",
                  stat.tone === "info" && "bg-[#146EB4]",
                )}
              />
            </div>
            <div className="text-[2rem] font-semibold tracking-[-0.06em] text-[#172033]">{stat.value}</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#5F6B7A]">{stat.action}</span>
              <ArrowRight className="h-4 w-4 text-[#5F6B7A]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172033]">Operational Overview</h2>
              <p className="text-sm text-[#5F6B7A]">Marketplace health and moderation flow</p>
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#D5D9D9] px-3 py-2 text-sm text-[#172033]">
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#F7F7F7] p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-[#5F6B7A]">Approval rate</div>
              <div className="mt-3 text-3xl font-semibold text-[#172033]">88%</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-[#067D62]">
                <TrendingUp className="h-4 w-4" />
                +3.4% this week
              </div>
            </div>
            <div className="rounded-xl bg-[#F7F7F7] p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-[#5F6B7A]">Products submitted</div>
              <div className="mt-3 text-3xl font-semibold text-[#172033]">186</div>
              <div className="mt-2 text-sm text-[#5F6B7A]">Last 7 days</div>
            </div>
            <div className="rounded-xl bg-[#F7F7F7] p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-[#5F6B7A]">Avg review time</div>
              <div className="mt-3 text-3xl font-semibold text-[#172033]">4.2h</div>
              <div className="mt-2 text-sm text-[#5F6B7A]">Across active queue</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#172033]">Priority queue</h3>
              <p className="text-sm text-[#5F6B7A]">Most needed action</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3DC] text-[#F08804]">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-3">
            {products.slice(0, 3).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-3 rounded-xl border border-[#D5D9D9] p-3 transition hover:bg-[#F7F7F7]">
                <Image src={product.image} alt={product.name} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#172033]">{product.name}</div>
                  <div className="text-xs text-[#5F6B7A]">{product.seller}</div>
                </div>
                <StatusBadge status={product.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PendingQueuePage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return product.status === "pending" && matchesQuery && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, query, statusFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro
        title="Pending Reviews"
        subtitle="Review new product submissions from sellers before they reach the catalog."
        action={
          <Link href="/products/pending" className="inline-flex items-center gap-2 rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium text-[#172033]">
            <SlidersHorizontal className="h-4 w-4" />
            Filter Queue
          </Link>
        }
      />

      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or SKU"
              className="h-11 w-full rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] pl-10 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-[#D5D9D9] bg-white px-3 text-sm text-[#172033]">
              <option value="all">Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-11 rounded-xl border border-[#D5D9D9] bg-white px-3 text-sm text-[#172033]">
              <option value="all">Category</option>
              <option value="Supplements">Supplements</option>
              <option value="Fitness Equipment">Fitness Equipment</option>
            </select>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#D5D9D9] bg-white px-3 py-2 text-sm text-[#172033]">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[#D5D9D9]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E8ECEC] text-left text-sm">
              <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Seller</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECEC] bg-white">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-[#F7F7F7]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Image src={product.image} alt={product.name} width={48} height={48} className="h-12 w-12 rounded-lg border border-[#D5D9D9] bg-white object-cover" />
                          <div>
                            <div className="font-medium text-[#172033]">{product.name}</div>
                            <div className="text-xs text-[#5F6B7A]">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#172033]">{product.seller}</td>
                      <td className="px-4 py-3 text-[#172033]">{product.category}</td>
                      <td className="px-4 py-3 text-[#172033]">₹{product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[#172033]">{product.stock}</td>
                      <td className="px-4 py-3 text-[#172033]">{product.submitted}</td>
                      <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                      <td className="px-4 py-3">
                        <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-sm font-medium text-[#172033] hover:bg-[#F7F7F7]">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F7F7] text-[#5F6B7A]">
                          <Search className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-[#172033]">No products awaiting approval</div>
                          <p className="mt-1 text-sm text-[#5F6B7A]">Try adjusting your search or filters to find other submissions.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductReviewPage({ productId }: { productId: string }) {
  const product = products.find((item) => item.id === productId) ?? products[0];
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Incorrect information");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  const handleApprove = () => {
    setCurrentProduct((previous) => ({
      ...previous,
      status: "approved",
      approvedDate: new Date().toISOString().slice(0, 10),
      rejectionReason: undefined,
    }));
    setApproveOpen(false);
    setToast("Product approved successfully");
    setTimeout(() => setToast(null), 2500);
  };

  const handleReject = () => {
    setCurrentProduct((previous) => ({
      ...previous,
      status: "rejected",
      rejectedDate: new Date().toISOString().slice(0, 10),
      rejectionReason: selectedReason,
    }));
    setRejectOpen(false);
    setToast("Product rejected");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro
        title={currentProduct.name}
        subtitle={`SKU ${currentProduct.sku} • ${currentProduct.category}`}
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => setApproveOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#FF9900] px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Approve Product
            </button>
            <button type="button" onClick={() => setRejectOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#C7511F] bg-[#FFF7F3] px-4 py-2 text-sm font-semibold text-[#C7511F]">
              <X className="h-4 w-4" />
              Reject Product
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] p-3">
                <Image src={currentProduct.image} alt={currentProduct.name} width={1200} height={900} className="h-[420px] w-full rounded-xl object-cover" />
              </div>
              <div className="grid gap-3">
                {currentProduct.gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] p-2">
                    <Image src={image} alt={`${currentProduct.name} view ${index + 1}`} width={280} height={112} className="h-28 w-full rounded-lg object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#172033]">Product Details</h2>
              <StatusBadge status={currentProduct.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B7A]">Description</p>
                <p className="mt-2 text-sm leading-6 text-[#172033]">{currentProduct.description}</p>
              </div>
              <div className="rounded-xl bg-[#F7F7F7] p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-[#5F6B7A]">Brand</div><div className="mt-1 font-medium text-[#172033]">{currentProduct.brand}</div></div>
                  <div><div className="text-[#5F6B7A]">Category</div><div className="mt-1 font-medium text-[#172033]">{currentProduct.category}</div></div>
                  <div><div className="text-[#5F6B7A]">SKU</div><div className="mt-1 font-medium text-[#172033]">{currentProduct.sku}</div></div>
                  <div><div className="text-[#5F6B7A]">Price</div><div className="mt-1 font-medium text-[#172033]">₹{currentProduct.price.toFixed(2)}</div></div>
                  <div><div className="text-[#5F6B7A]">Stock</div><div className="mt-1 font-medium text-[#172033]">{currentProduct.stock}</div></div>
                  <div><div className="text-[#5F6B7A]">Status</div><div className="mt-1 font-medium text-[#172033]">{currentProduct.status}</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#172033]">Specifications</h3>
              <div className="mt-4 space-y-3">
                {Object.entries(currentProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b border-[#EEF1F2] pb-2 text-sm">
                    <span className="text-[#5F6B7A]">{key}</span>
                    <span className="font-medium text-[#172033]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#172033]">Variants</h3>
              <div className="mt-4 space-y-3">
                {currentProduct.variants.map((variant) => (
                  <div key={variant.label} className="flex items-center justify-between border-b border-[#EEF1F2] pb-2 text-sm">
                    <span className="text-[#5F6B7A]">{variant.label}</span>
                    <span className="font-medium text-[#172033]">{variant.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#172033]">Seller Information</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div><span className="text-[#5F6B7A]">Business</span><div className="font-medium text-[#172033]">{currentProduct.sellerInfo.business}</div></div>
                <div><span className="text-[#5F6B7A]">Seller Email</span><div className="font-medium text-[#172033]">{currentProduct.sellerEmail}</div></div>
                <div><span className="text-[#5F6B7A]">Seller Status</span><div className="mt-1"><StatusBadge status={currentProduct.sellerStatus} /></div></div>
              </div>
            </div>

            <div className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#172033]">Submission Information</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div><span className="text-[#5F6B7A]">Submitted Date</span><div className="font-medium text-[#172033]">{currentProduct.submitted}</div></div>
                <div><span className="text-[#5F6B7A]">Current Status</span><div className="mt-1"><StatusBadge status={currentProduct.status} /></div></div>
                {currentProduct.approvedDate && <div><span className="text-[#5F6B7A]">Approved Date</span><div className="font-medium text-[#172033]">{currentProduct.approvedDate}</div></div>}
                {currentProduct.rejectedDate && <div><span className="text-[#5F6B7A]">Rejected Date</span><div className="font-medium text-[#172033]">{currentProduct.rejectedDate}</div></div>}
                {currentProduct.rejectionReason && <div><span className="text-[#5F6B7A]">Rejection Reason</span><div className="font-medium text-[#172033]">{currentProduct.rejectionReason}</div></div>}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:pt-2">
          <div className="sticky top-28 rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
            <div className="mb-5 border-b border-[#EEF1F2] pb-4">
              <div className="text-xs uppercase tracking-[0.12em] text-[#5F6B7A]">Marketplace Review</div>
              <div className="mt-2 text-2xl font-semibold text-[#172033]">₹{currentProduct.price.toFixed(2)}</div>
            </div>

            <div className="space-y-3 text-sm text-[#5F6B7A]">
              <div className="flex items-center justify-between"><span>Seller</span><span className="font-medium text-[#172033]">{currentProduct.seller}</span></div>
              <div className="flex items-center justify-between"><span>Brand</span><span className="font-medium text-[#172033]">{currentProduct.brand}</span></div>
              <div className="flex items-center justify-between"><span>Stock</span><span className="font-medium text-[#172033]">{currentProduct.stock}</span></div>
              <div className="flex items-center justify-between"><span>Category</span><span className="font-medium text-[#172033]">{currentProduct.category}</span></div>
            </div>

            <div className="mt-6 space-y-3">
              <button type="button" onClick={() => setApproveOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e98800]">
                <CheckCircle2 className="h-4 w-4" />
                Approve Product
              </button>
              <button type="button" onClick={() => setRejectOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C7511F] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#C7511F]">
                <X className="h-4 w-4" />
                Reject Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {approveOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/40 p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-md rounded-xl border border-[#D5D9D9] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#5F6B7A]">Confirmation</div>
                  <h3 className="mt-2 text-xl font-semibold text-[#172033]">Approve this product?</h3>
                </div>
                <button type="button" onClick={() => setApproveOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D5D9D9] text-[#172033]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4 rounded-xl bg-[#F7F7F7] p-4 text-sm">
                <div><span className="text-[#5F6B7A]">Product:</span> <span className="font-semibold text-[#172033]">{currentProduct.name}</span></div>
                <div><span className="text-[#5F6B7A]">Seller:</span> <span className="font-semibold text-[#172033]">{currentProduct.seller}</span></div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setApproveOpen(false)} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2.5 text-sm font-medium text-[#172033]">Cancel</button>
                <button type="button" onClick={handleApprove} className="rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-semibold text-white">Approve</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/40 p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-lg rounded-xl border border-[#D5D9D9] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#5F6B7A]">Moderation</div>
                  <h3 className="mt-2 text-xl font-semibold text-[#172033]">Reject Product</h3>
                </div>
                <button type="button" onClick={() => setRejectOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D5D9D9] text-[#172033]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Incorrect information",
                    "Wrong category",
                    "Duplicate product",
                    "Poor image quality",
                    "Incomplete details",
                    "Policy issue",
                    "Other",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition",
                        selectedReason === reason
                          ? "border-[#C7511F] bg-[#FFF7F3] text-[#C7511F]"
                          : "border-[#D5D9D9] bg-white text-[#172033]",
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#172033]">Additional explanation</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    placeholder="Add more context on why this product does not meet marketplace standards."
                    className="w-full rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#C7511F] focus:ring-2 focus:ring-[#C7511F]/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setRejectOpen(false)} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2.5 text-sm font-medium text-[#172033]">Cancel</button>
                <button type="button" onClick={handleReject} className="rounded-lg bg-[#C7511F] px-4 py-2.5 text-sm font-semibold text-white">Reject Product</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[60] rounded-xl border border-[#BDE2D5] bg-[#EAF6F2] px-4 py-3 text-sm font-medium text-[#067D62] shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ApprovedProductsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro title="Approved Products" subtitle="Catalog items currently available to the Fitness Species app." />
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8ECEC] text-sm">
            <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Seller</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Approved Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((product) => product.status === "approved").map((product) => (
                <tr key={product.id} className="border-t border-[#E8ECEC] hover:bg-[#F7F7F7]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image src={product.image} alt={product.name} width={44} height={44} className="h-11 w-11 rounded-lg border border-[#D5D9D9] bg-white object-cover" />
                      <div>
                        <div className="font-medium text-[#172033]">{product.name}</div>
                        <div className="text-xs text-[#5F6B7A]">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#172033]">{product.seller}</td>
                  <td className="px-4 py-3 text-[#172033]">{product.category}</td>
                  <td className="px-4 py-3 text-[#172033]">₹{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#172033]">{product.stock}</td>
                  <td className="px-4 py-3 text-[#172033]">{product.approvedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.id}`} className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 text-sm font-medium text-[#172033]">View</Link>
                      <button type="button" className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 text-sm font-medium text-[#172033]">Manage</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export function RejectedProductsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro title="Rejected Products" subtitle="Review not approved submissions and their rejection reasons." />
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8ECEC] text-sm">
            <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Seller</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-left font-medium">Rejected Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((product) => product.status === "rejected").map((product) => (
                <tr key={product.id} className="border-t border-[#E8ECEC] hover:bg-[#F7F7F7]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image src={product.image} alt={product.name} width={44} height={44} className="h-11 w-11 rounded-lg border border-[#D5D9D9] bg-white object-cover" />
                      <div>
                        <div className="font-medium text-[#172033]">{product.name}</div>
                        <div className="text-xs text-[#5F6B7A]">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#172033]">{product.seller}</td>
                  <td className="px-4 py-3 text-[#172033]">{product.rejectionReason}</td>
                  <td className="px-4 py-3 text-[#172033]">{product.rejectedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export function SellersPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro title="Sellers" subtitle="Manage seller approvals, onboarding, and marketplace performance." />
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7A]" />
            <input placeholder="Business, seller, email" className="h-11 w-full rounded-xl border border-[#D5D9D9] bg-[#F7F7F7] pl-10 pr-4 text-sm text-[#172033] outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20" />
          </label>
          <div className="flex flex-wrap gap-2">
            {['Approved', 'Pending', 'Rejected', 'Suspended'].map((filter) => (
              <button key={filter} type="button" className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-sm text-[#172033]">{filter}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8ECEC] text-sm">
            <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Seller</th>
                <th className="px-4 py-3 text-left font-medium">Business</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Products</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-t border-[#E8ECEC] hover:bg-[#F7F7F7]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#146EB4] text-xs font-semibold text-white">{seller.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="font-medium text-[#172033]">{seller.name}</div>
                        <div className="text-xs text-[#5F6B7A]">{seller.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#172033]">{seller.business}</td>
                  <td className="px-4 py-3 text-[#172033]">{seller.email}</td>
                  <td className="px-4 py-3 text-[#172033]">{seller.products}</td>
                  <td className="px-4 py-3"><StatusBadge status={seller.status} /></td>
                  <td className="px-4 py-3 text-[#172033]">{seller.joined}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 text-sm font-medium text-[#172033]">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoriesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PageIntro title="Categories" subtitle="Manage the catalog taxonomy and status of your storefront categories." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#172033]">{category.name}</h3>
                <div className="mt-2 text-sm text-[#5F6B7A]">{category.count} products</div>
              </div>
              <StatusBadge status={category.status === "active" ? "approved" : category.status === "review" ? "pending" : "suspended"} />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#EEF1F2] pt-4 text-sm">
              <span className="text-[#5F6B7A]">Status</span>
              <span className="font-medium text-[#172033]">{category.status}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
