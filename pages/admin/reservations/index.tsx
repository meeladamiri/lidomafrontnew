import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetchPaginated } from "@/api/Admin/adminApi";

interface ReservationRow {
  id: number;
  reference: string;
  state: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  residence: { name: string };
  guest: { name: string | null; phone: string };
  host: { name: string | null; phone: string };
}

const STATE_LABELS: Record<string, string> = {
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت نهایی",
  DONE: "تکمیل شده",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};

const STATE_BADGE: Record<string, string> = {
  HOST_APPROVAL: "yellow",
  SECOND_PAYMENT: "yellow",
  DONE: "green",
  CANCEL: "red",
  EXPIRED: "gray",
};

export default function AdminReservationsPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("");

  const query = new URLSearchParams({ page: String(page), pageSize: "20", ...(state ? { state } : {}) });
  const { data, isLoading } = useSWR(`/api/admin/reservations?${query.toString()}`, (path: string) =>
    apiFetchPaginated<ReservationRow>(path)
  );

  return (
    <AdminLayout>
      <h1>رزروها</h1>
      <div className="toolbar">
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 220 }}
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
                <th>کد رزرو</th>
                <th>اقامتگاه</th>
                <th>مهمان</th>
                <th>میزبان</th>
                <th>تاریخ</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.reference}</td>
                  <td>{r.residence.name}</td>
                  <td>
                    {r.guest.name ?? "-"} ({r.guest.phone})
                  </td>
                  <td>
                    {r.host.name ?? "-"} ({r.host.phone})
                  </td>
                  <td>
                    {r.startDate.slice(0, 10)} تا {r.endDate.slice(0, 10)}
                  </td>
                  <td>{r.totalAmount.toLocaleString("fa-IR")}</td>
                  <td>
                    <span className={`badge ${STATE_BADGE[r.state] ?? "gray"}`}>
                      {STATE_LABELS[r.state] ?? r.state}
                    </span>
                  </td>
                  <td>
                    <Link className="btn secondary" href={`/admin/reservations/${r.id}`}>
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
