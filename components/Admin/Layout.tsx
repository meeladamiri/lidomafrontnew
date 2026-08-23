import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { clearToken, getToken } from "@/api/Admin/adminApi";

// Icon-rail sidebar (matches the redesign): compact icon column with
// tooltips, an active indicator, and a logout pinned to the bottom.
const NAV = [
  { href: "/admin", label: "داشبورد", icon: "🏠" },
  { href: "/admin/users", label: "کاربران", icon: "👤" },
  { href: "/admin/residences", label: "اقامتگاه‌ها", icon: "🏡" },
  { href: "/admin/reservations", label: "رزروها", icon: "📅" },
];

export default function AdminLayout({
  children,
  title,
  breadcrumb,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
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
      <aside className="sticky top-0 h-screen w-64 shrink-0 bg-white border-l border-gray-E5E5E6 flex flex-col items-center py-16 gap-y-8">
        <Link href="/admin" className="mb-8 text-20" aria-label="پنل مدیریت لیدوما">
          <span className="w-40 h-40 rounded-12 bg-primary-light flex items-center justify-center">
            🪷
          </span>
        </Link>
        <nav className="flex flex-col gap-y-6 w-full items-center">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`w-40 h-40 rounded-12 flex items-center justify-center text-18 transition ${
                isActive(item.href)
                  ? "bg-primary-light text-primary-dark"
                  : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          title="خروج"
          aria-label="خروج از پنل"
          className="mt-auto w-40 h-40 rounded-12 flex items-center justify-center text-18 text-[#E53935] hover:bg-[#FFEBEB] transition"
        >
          ⎋
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-E5E5E6 px-24 py-14">
          <div className="flex items-center justify-between gap-x-16 flex-wrap gap-y-8">
            <div className="min-w-0">
              {!!breadcrumb && (
                <nav className="text-12 leading-18 text-gray-6C6A7D mb-4">{breadcrumb}</nav>
              )}
              {!!title && <h1 className="text-18 leading-26 font-m text-black">{title}</h1>}
            </div>
            {!!actions && <div className="flex items-center gap-x-8">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 p-24">{children}</main>
      </div>
    </div>
  );
}
