import useSWR from "swr";
import Link from "next/link";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Card,
  EmptyState,
  Skeleton,
  StatTile,
  faDate,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

interface TrendPoint {
  month: string;
  reservations: number;
  revenue: number;
}

interface DashboardOverview {
  usersCount: number;
  hostsCount: number;
  residencesByState: Record<string, number>;
  reservationsByState: Record<string, number>;
  totalRevenue: number;
  newUsersThisMonth: number;
  newUsersChangePct: number;
  reservationsThisMonth: number;
  reservationsChangePct: number;
  revenueThisMonth: number;
  pendingResidences: number;
  pendingReservations: number;
  trend: TrendPoint[];
  recentUsers: {
    id: number;
    name: string | null;
    phone: string;
    avatarUrl: string | null;
    isHost: boolean;
    createdAt: string;
  }[];
  recentReservations: {
    id: number;
    reference: string;
    state: string;
    totalAmount: number;
    createdAt: string;
    guest: { name: string | null; phone: string } | null;
    residence: { name: string } | null;
  }[];
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

const RESERVATION_STATE_TONE: Record<string, "green" | "yellow" | "red" | "gray" | "blue"> = {
  DONE: "green",
  HOST_APPROVAL: "yellow",
  SECOND_PAYMENT: "blue",
  CANCEL: "red",
  EXPIRED: "gray",
};

function ChangeHint({ pct }: { pct: number }) {
  if (pct === 0) return <>بدون تغییر نسبت به ماه قبل</>;
  const up = pct > 0;
  return (
    <>
      {up ? "▲" : "▼"} {faNum(Math.abs(pct))}٪ نسبت به ماه قبل
    </>
  );
}

// Inline SVG bar chart — no chart library in the bundle for one view.
function TrendChart({ points }: { points: TrendPoint[] }) {
  if (!points.length) return <EmptyState text="داده‌ای برای نمایش نیست" />;
  const max = Math.max(...points.map((p) => p.reservations), 1);

  return (
    <div className="flex items-end gap-x-8 h-[180px] px-4" role="img" aria-label="نمودار رزروهای ۱۲ ماه گذشته">
      {points.map((p) => (
        <div key={p.month} className="flex-1 flex flex-col items-center gap-y-6 min-w-0">
          <span className="text-11 leading-16 text-gray-6C6A7D">{faNum(p.reservations)}</span>
          <div
            className="w-full bg-primary-main rounded-t-8 min-h-[4px] transition-all"
            style={{ height: `${(p.reservations / max) * 130}px` }}
            title={`${p.month}: ${p.reservations} رزرو`}
          />
          <span className="text-10 leading-14 text-gray-9B9BAA truncate w-full text-center">
            {p.month.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardOverview>(
    "/api/admin/dashboard/overview",
    (path: string) => apiFetch<DashboardOverview>(path)
  );

  return (
    <AdminLayout title="داشبورد" breadcrumb="مدیریت لیدوما">
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px]" />
          ))}
        </div>
      )}
      {error && <p className="text-14 text-[#C62828]">خطا در دریافت آمار</p>}

      {data && (
        <div className="flex flex-col gap-y-16">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-16">
            <StatTile
              tone="blue"
              label="کاربران"
              value={faNum(data.usersCount)}
              hint={`${faNum(data.newUsersThisMonth)} کاربر جدید این ماه`}
              icon={<i className="icon-groupPeople text-18" />}
            />
            <StatTile
              tone="purple"
              label="میزبان‌ها"
              value={faNum(data.hostsCount)}
              hint={`${faNum(data.residencesByState.PUBLISHED ?? 0)} اقامتگاه منتشرشده`}
              icon={<i className="icon-Homes text-18" />}
            />
            <StatTile
              tone="orange"
              label="رزروهای این ماه"
              value={faNum(data.reservationsThisMonth)}
              hint={<ChangeHint pct={data.reservationsChangePct} />}
              icon={<i className="icon-Calendar text-18" />}
            />
            <StatTile
              tone="green"
              label="درآمد این ماه"
              value={faMoney(data.revenueThisMonth)}
              hint={`مجموع کل: ${faMoney(data.totalRevenue)}`}
              icon={<i className="icon-Cash text-18" />}
            />
          </section>

          {(data.pendingResidences > 0 || data.pendingReservations > 0) && (
            <section className="grid sm:grid-cols-2 gap-16">
              {data.pendingResidences > 0 && (
                <Card className="p-16 flex items-center justify-between">
                  <div>
                    <p className="text-14 leading-22 font-m text-black">اقامتگاه در انتظار بررسی</p>
                    <p className="text-12 leading-18 text-gray-6C6A7D">نیازمند تایید یا رد</p>
                  </div>
                  <Link
                    href="/admin/residences?state=PENDING"
                    className="text-14 font-m text-primary-dark"
                  >
                    {faNum(data.pendingResidences)} مورد ←
                  </Link>
                </Card>
              )}
              {data.pendingReservations > 0 && (
                <Card className="p-16 flex items-center justify-between">
                  <div>
                    <p className="text-14 leading-22 font-m text-black">رزرو در انتظار تایید میزبان</p>
                    <p className="text-12 leading-18 text-gray-6C6A7D">ممکن است نیاز به پیگیری داشته باشد</p>
                  </div>
                  <Link
                    href="/admin/reservations?state=HOST_APPROVAL"
                    className="text-14 font-m text-primary-dark"
                  >
                    {faNum(data.pendingReservations)} مورد ←
                  </Link>
                </Card>
              )}
            </section>
          )}

          <Card className="p-20">
            <header className="mb-16">
              <h2 className="text-16 leading-24 font-m text-black">روند رزروها (۱۲ ماه گذشته)</h2>
            </header>
            <TrendChart points={data.trend} />
          </Card>

          <section className="grid lg:grid-cols-2 gap-16">
            <Card className="p-20">
              <header className="flex items-center justify-between mb-12">
                <h2 className="text-16 leading-24 font-m text-black">آخرین کاربران</h2>
                <Link href="/admin/users" className="text-12 font-m text-primary-dark">
                  همه ←
                </Link>
              </header>
              {data.recentUsers.length === 0 ? (
                <EmptyState text="کاربری ثبت نشده" />
              ) : (
                <ul className="divide-y divide-gray-F0F0F0">
                  {data.recentUsers.map((u) => (
                    <li key={u.id} className="py-10 flex items-center gap-x-10">
                      <span className="w-32 h-32 rounded-full bg-gray-F0F0F0 flex items-center justify-center text-12 shrink-0">
                        {u.name?.[0] ?? "؟"}
                      </span>
                      <Link href={`/admin/users/${u.id}`} className="min-w-0 flex-1">
                        <p className="text-14 leading-20 text-black truncate">{u.name ?? "بدون نام"}</p>
                        <p className="text-12 leading-18 text-gray-6C6A7D">{u.phone}</p>
                      </Link>
                      <Badge tone={u.isHost ? "green" : "gray"}>{u.isHost ? "میزبان" : "مهمان"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-20">
              <header className="flex items-center justify-between mb-12">
                <h2 className="text-16 leading-24 font-m text-black">آخرین رزروها</h2>
                <Link href="/admin/reservations" className="text-12 font-m text-primary-dark">
                  همه ←
                </Link>
              </header>
              {data.recentReservations.length === 0 ? (
                <EmptyState text="رزروی ثبت نشده" />
              ) : (
                <ul className="divide-y divide-gray-F0F0F0">
                  {data.recentReservations.map((r) => (
                    <li key={r.id} className="py-10 flex items-center gap-x-10">
                      <Link href={`/admin/reservations/${r.id}`} className="min-w-0 flex-1">
                        <p className="text-14 leading-20 text-black truncate">
                          {r.residence?.name ?? "—"}
                        </p>
                        <p className="text-12 leading-18 text-gray-6C6A7D truncate">
                          {r.guest?.name ?? r.guest?.phone ?? "—"} · {faDate(r.createdAt)}
                        </p>
                      </Link>
                      <div className="text-left shrink-0">
                        <Badge tone={RESERVATION_STATE_TONE[r.state] ?? "gray"}>
                          {RESERVATION_STATE_LABELS[r.state] ?? r.state}
                        </Badge>
                        <p className="text-11 leading-16 text-gray-6C6A7D mt-4">
                          {faMoney(r.totalAmount)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section className="grid lg:grid-cols-2 gap-16">
            <Card className="p-20">
              <h2 className="text-16 leading-24 font-m text-black mb-12">اقامتگاه‌ها بر اساس وضعیت</h2>
              <ul className="flex flex-col gap-y-8">
                {Object.entries(data.residencesByState).map(([state, count]) => (
                  <li key={state} className="flex items-center justify-between text-14 leading-22">
                    <span className="text-gray-6C6A7D">
                      {RESIDENCE_STATE_LABELS[state] ?? state}
                    </span>
                    <span className="font-m text-black">{faNum(count)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-20">
              <h2 className="text-16 leading-24 font-m text-black mb-12">رزروها بر اساس وضعیت</h2>
              <ul className="flex flex-col gap-y-8">
                {Object.entries(data.reservationsByState).map(([state, count]) => (
                  <li key={state} className="flex items-center justify-between text-14 leading-22">
                    <span className="text-gray-6C6A7D">
                      {RESERVATION_STATE_LABELS[state] ?? state}
                    </span>
                    <span className="font-m text-black">{faNum(count)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
