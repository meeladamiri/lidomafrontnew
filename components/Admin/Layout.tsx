import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { clearToken, getToken } from "@/api/Admin/adminApi";

const NAV = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/residences", label: "اقامتگاه‌ها" },
  { href: "/admin/reservations", label: "رزروها" },
  { href: "/admin/users", label: "کاربران" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="admin-panel">
      <div className="layout">
        <aside className="sidebar">
          <h1>پنل مدیریت لیدوما</h1>
          <nav>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={router.pathname === item.href ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="btn secondary" style={{ marginTop: 24, width: "100%" }} onClick={logout}>
            خروج
          </button>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
