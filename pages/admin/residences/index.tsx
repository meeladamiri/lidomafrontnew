import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetchPaginated } from "@/api/Admin/adminApi";

interface ResidenceRow {
  id: number;
  name: string;
  state: string;
  reference: string;
  host: { name: string | null; phone: string };
  city: { name: string } | null;
  weekPrice: number | null;
}

const STATE_BADGE: Record<string, string> = {
  DRAFT: "gray",
  PENDING: "yellow",
  PUBLISHED: "green",
  REJECTED: "red",
  DEACTIVATED: "gray",
  DELETED: "red",
};

const STATE_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  PUBLISHED: "منتشر شده",
  REJECTED: "رد شده",
  DEACTIVATED: "غیرفعال",
  DELETED: "حذف شده",
};

export default function AdminResidencesPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("");
  const [q, setQ] = useState("");

  const query = new URLSearchParams({ page: String(page), pageSize: "20", ...(state ? { state } : {}), ...(q ? { q } : {}) });
  const { data, isLoading, mutate } = useSWR(
    `/api/admin/residences?${query.toString()}`,
    (path: string) => apiFetchPaginated<ResidenceRow>(path)
  );

  return (
    <AdminLayout>
      <h1>اقامتگاه‌ها</h1>
      <div className="toolbar">
        <input
          placeholder="جستجوی نام اقامتگاه..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 260 }}
        />
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 200 }}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {isLoading && <p>در حال بارگذاری...</p>}
        {data && (
          <table>
            <thead>
              <tr>
                <th>نام</th>
                <th>میزبان</th>
                <th>شهر</th>
                <th>قیمت هفته</th>
                <th>وضعیت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {r.host.name ?? "-"} <span style={{ color: "#9ca3af" }}>({r.host.phone})</span>
                  </td>
                  <td>{r.city?.name ?? "-"}</td>
                  <td>{r.weekPrice?.toLocaleString("fa-IR") ?? "-"}</td>
                  <td>
                    <span className={`badge ${STATE_BADGE[r.state] ?? "gray"}`}>
                      {STATE_LABELS[r.state] ?? r.state}
                    </span>
                  </td>
                  <td>
                    <Link className="btn secondary" href={`/admin/residences/${r.id}`}>
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && (
          <div className="pagination">
            <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </button>
            <span style={{ alignSelf: "center" }}>
              صفحه {page} از {data.meta.pageCount}
            </span>
            <button
              className="btn secondary"
              disabled={page >= data.meta.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </button>
            <button className="btn secondary" onClick={() => mutate()}>
              بروزرسانی
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
