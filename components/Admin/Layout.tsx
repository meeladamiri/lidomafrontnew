import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import { apiFetch, clearToken, getToken } from "@/api/Admin/adminApi";

// Icons come from the project's own icomoon font (styles/icomoon.css, loaded
// globally) — same visual language as the rest of the site, no extra bundle.
/**
 * `badge` marks the links with a queue behind them. Only queues get a number:
 * "9,574 residences" never goes down, so a count beside it trains the eye to
 * skip counts — which costs you the one badge that did mean something.
 */
const NAV: { href: string; label: string; icon: string; badge?: SidebarCountKey }[] = [
  { href: "/admin", label: "داشبورد", icon: "icon-Home" },
  { href: "/admin/users", label: "کاربران", icon: "icon-Profile" },
  { href: "/admin/residences", label: "اقامتگاه‌ها", icon: "icon-Homes", badge: "residences" },
  { href: "/admin/reservations", label: "رزروها", icon: "icon-Reserve", badge: "reservations" },
  { href: "/admin/comments", label: "نظرات", icon: "icon-message", badge: "comments" },
  { href: "/admin/conversations", label: "گفتگوها", icon: "icon-Comments", badge: "conversations" },
  { href: "/admin/statistics", label: "گزارش‌ها", icon: "icon-Amaar" },
  { href: "/admin/wallet", label: "کیف پول و تسویه", icon: "icon-Cash" },
  { href: "/admin/settings", label: "تنظیمات", icon: "icon-Setting" },
];

type SidebarCountKey = "residences" | "reservations" | "comments" | "conversations";

export default function AdminLayout({
  children,
  title,
  breadcrumb,
  actions,
  toolbar,
}: {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: React.ReactNode;
  /** buttons rendered at the start of the toolbar row (e.g. "ایجاد کاربر جدید") */
  actions?: React.ReactNode;
  /** the page's own toolbar row: tabs, search, filters, pagination, view switch */
  toolbar?: React.ReactNode;
}) {
  const router = useRouter();
  // Refreshed on focus, so a badge cleared in another tab does not sit there
  // claiming work that is already done.
  const { data: counts } = useSWR<Record<SidebarCountKey, number>>(
    "/api/admin/sidebar-counts",
    (path: string) => apiFetch<Record<SidebarCountKey, number>>(path),
    { refreshInterval: 120000 }
  );

  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
    // header identity — best-effort, the panel works without it
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((j) => setAdminName(j?.data?.name || j?.data?.phone || ""))
      .catch(() => {});
  }, [router]);

  if (!ready) return null;

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  const isActive = (href: string) =>
    href === "/admin" ? router.pathname === "/admin" : router.pathname.startsWith(href);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-F5F5F7 flex">
      {/* Icon rail that expands on hover (group/peer-driven, no JS state so it
          stays responsive and keyboard/focus friendly). */}
      <aside className="group sticky top-0 h-screen shrink-0 w-64 hover:w-[220px] focus-within:w-[220px] transition-[width] duration-200 bg-white border-l border-gray-E5E5E6 flex flex-col py-16 overflow-hidden z-20">
        <Link
          href="/admin"
          className="flex items-center gap-x-12 px-12 mb-16 shrink-0"
          aria-label="پنل مدیریت لیدوما"
        >
          <span className="w-40 h-40 shrink-0 rounded-12 bg-primary-light text-primary-dark flex items-center justify-center">
            <i className="icon-LidomaTrip text-22" />
          </span>
          <span className="text-14 leading-20 font-m text-black whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            پنل مدیریت
          </span>
        </Link>

        <nav className="flex flex-col gap-y-4 px-12">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`h-40 rounded-12 flex items-center gap-x-12 px-0 group-hover:px-10 group-focus-within:px-10 transition-all ${
                isActive(item.href)
                  ? "bg-primary-main text-white"
                  : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
              }`}
            >
              <span className="relative w-40 group-hover:w-20 group-focus-within:w-20 shrink-0 flex items-center justify-center transition-all">
                <i className={`${item.icon} text-20`} />
                {/* On the icon while the rail is collapsed, so the number is
                    still visible when the labels are not. */}
                {!!item.badge && !!counts?.[item.badge] && (
                  <span className="absolute -top-4 -left-2 min-w-16 h-16 px-4 rounded-full bg-[#E53935] text-white text-10 leading-16 font-m flex items-center justify-center">
                    {counts[item.badge]! > 99 ? "+۹۹" : counts[item.badge]!.toLocaleString("fa-IR")}
                  </span>
                )}
              </span>
              <span className="text-14 leading-20 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          title="خروج"
          className="mt-auto mx-12 h-40 rounded-12 flex items-center gap-x-12 px-0 group-hover:px-10 group-focus-within:px-10 text-[#E53935] hover:bg-[#FFEBEB] transition-all"
        >
          <span className="w-40 group-hover:w-20 group-focus-within:w-20 shrink-0 flex items-center justify-center transition-all">
            <i className="icon-Exit text-20" />
          </span>
          <span className="text-14 leading-20 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            خروج
          </span>
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopBar adminName={adminName} breadcrumb={breadcrumb} title={title} />

        {(actions || toolbar) && (
          <div className="px-24 pt-16 flex flex-col gap-y-12">
            {!!actions && <div className="flex items-center gap-x-12 flex-wrap gap-y-8">{actions}</div>}
            {toolbar}
          </div>
        )}

        <main className="flex-1 p-24">{children}</main>
      </div>
    </div>
  );
}

// Shared page chrome: admin identity on the left, breadcrumb on the right —
// the pattern used across every admin screen.
function AdminTopBar({
  adminName,
  breadcrumb,
  title,
}: {
  adminName: string;
  breadcrumb?: React.ReactNode;
  title?: string;
}) {
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-E5E5E6 px-24 py-10">
      <div className="flex items-center justify-between gap-x-16">
        <div className="flex items-center gap-x-6">
          <button className="flex items-center gap-x-8 px-8 py-6 rounded-10 hover:bg-gray-F0F0F0 transition">
            <span className="w-32 h-32 rounded-full bg-gray-F0F0F0 flex items-center justify-center text-12 shrink-0">
              {adminName?.[0] ?? "؟"}
            </span>
            <span className="text-14 leading-20 text-black whitespace-nowrap">
              {adminName || "مدیر"}
            </span>
            <i className="icon-FlashDown text-14 text-gray-6C6A7D" />
          </button>

          <TopIcon icon="icon-Timer" label="تاریخچه" />
          <TopIcon icon="icon-Bell" label="اعلان‌ها" />
          <TopIcon icon="icon-EmailSign" label="پیام‌ها" />
          <TopIcon icon="icon-FullScreen" label="تمام‌صفحه" onClick={toggleFullscreen} />
          <TopIcon icon="icon-Search" label="جستجو" />
        </div>

        <nav className="text-13 leading-20 text-gray-6C6A7D flex items-center gap-x-6 min-w-0">
          {!!breadcrumb && <span className="truncate">{breadcrumb}</span>}
          {!!breadcrumb && !!title && <span>/</span>}
          {!!title && <span className="text-black font-m truncate">{title}</span>}
          <i className="icon-Home text-16" />
        </nav>
      </div>
    </header>
  );
}

function TopIcon({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-32 h-32 rounded-10 flex items-center justify-center text-gray-6C6A7D hover:bg-gray-F0F0F0 transition"
    >
      <i className={`${icon} text-18`} />
    </button>
  );
}
