import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";

interface DashboardStats {
  usersCount: number;
  hostsCount: number;
  residencesByState: Record<string, number>;
  reservationsByState: Record<string, number>;
  totalRevenue: number;
}

const RESIDENCE_STATE_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  PUBLISHED: "منتشر شده",
  REJECTED: "رد شده",
  DEACTIVATED: "غیرفعال",
  DELETED: "حذف شده",
};

const RESERVATION_STATE_LABELS: Record<string, string> = {
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت نهایی",
  DONE: "تکمیل شده",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardStats>("/api/admin/dashboard/stats", (path: string) =>
    apiFetch<DashboardStats>(path)
  );

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>داشبورد</h1>

      {isLoading && <p>در حال بارگذاری...</p>}
      {error && <p className="error-text">خطا در دریافت آمار</p>}

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="value">{data.usersCount.toLocaleString("fa-IR")}</div>
              <div className="label">تعداد کاربران</div>
            </div>
            <div className="stat-tile">
              <div className="value">{data.hostsCount.toLocaleString("fa-IR")}</div>
              <div className="label">تعداد میزبانان</div>
            </div>
            <div className="stat-tile">
              <div className="value">{(data.residencesByState.PUBLISHED ?? 0).toLocaleString("fa-IR")}</div>
              <div className="label">اقامتگاه‌های منتشر شده</div>
            </div>
            <div className="stat-tile">
              <div className="value">{data.totalRevenue.toLocaleString("fa-IR")}</div>
              <div className="label">درآمد کل (تومان)</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>وضعیت اقامتگاه‌ها</h3>
              <table>
                <tbody>
                  {Object.entries(data.residencesByState).map(([state, count]) => (
                    <tr key={state}>
                      <td>{RESIDENCE_STATE_LABELS[state] ?? state}</td>
                      <td>{count.toLocaleString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>وضعیت رزروها</h3>
              <table>
                <tbody>
                  {Object.entries(data.reservationsByState).map(([state, count]) => (
                    <tr key={state}>
                      <td>{RESERVATION_STATE_LABELS[state] ?? state}</td>
                      <td>{count.toLocaleString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
