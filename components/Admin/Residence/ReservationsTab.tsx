import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetchPaginated } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  type Tone,
  faDateTime,
  faMoney,
  faNum,
} from "@/components/Admin/ui";
import { jalaliLong } from "@/components/Admin/JalaliDate";

/**
 * «رزروها» — this listing's bookings, the same rows the reservations page
 * shows.
 *
 * Two columns from that page are dropped rather than repeated: the host and
 * the city are the same on every row here, and a column whose every cell is
 * identical is a column that costs width and answers nothing.
 *
 * The four totals across the top are the questions a listing gets asked —
 * how much has it sold, how much of that is settled, how much did the site
 * take — and they are for the filtered set, so switching to «لغو شده» shows
 * what the cancellations cost rather than a constant.
 */

interface Row {
  id: number;
  reference: string;
  state: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  totalAmount: number;
  paidAmount: number;
  websiteShare: number | null;
  guestPreviousCount: number;
  guest: { id?: number; name: string | null; phone: string };
}

const STATES: { key: string; label: string; tone: Tone }[] = [
  { key: "HOST_APPROVAL", label: "در انتظار تایید میزبان", tone: "yellow" },
  { key: "SECOND_PAYMENT", label: "در انتظار پرداخت نهایی", tone: "yellow" },
  { key: "DONE", label: "تکمیل شده", tone: "green" },
  { key: "CANCEL", label: "لغو شده", tone: "red" },
  { key: "EXPIRED", label: "منقضی شده", tone: "gray" },
];

const STATE_BY_KEY = Object.fromEntries(STATES.map((s) => [s.key, s]));

const COLUMNS = [
  "کد رزرو",
  "ثبت رزرو",
  "تاریخ شروع",
  "مهمان",
  "شب",
  "مبلغ کل (تومان)",
  "پرداختی (تومان)",
  "سود سایت (تومان)",
  "وضعیت",
  "رزرو قبلی مهمان",
];

export default function ReservationsTab({ residenceId }: { residenceId: number }) {
  const [state, setState] = useState<string>("");
  const [page, setPage] = useState(1);

  const query = new URLSearchParams({
    residenceId: String(residenceId),
    page: String(page),
    pageSize: "20",
    ...(state ? { state } : {}),
  });

  const { data, isLoading } = useSWR(
    `/api/admin/reservations?${query.toString()}`,
    (p: string) => apiFetchPaginated<Row>(p)
  );

  const rows = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const pages = Math.max(data?.meta.pageCount ?? 1, 1);

  const sum = (pick: (r: Row) => number) => rows.reduce((s, r) => s + pick(r), 0);

  return (
    <div className="flex flex-col gap-y-16">
      <Card className="p-16">
        <div className="flex items-center gap-x-6 flex-wrap gap-y-6">
          <Pill active={state === ""} onClick={() => { setState(""); setPage(1); }}>
            همه
          </Pill>
          {STATES.map((s) => (
            <Pill
              key={s.key}
              active={state === s.key}
              onClick={() => { setState(s.key); setPage(1); }}
            >
              {s.label}
            </Pill>
          ))}
          <span className="mr-auto text-12 leading-20 text-gray-9B9BAA">
            {faNum(total)} رزرو
          </span>
        </div>
      </Card>

      {/* Totals for the rows on screen, not for all 29,659 — said plainly
          below, because a figure that silently means "this page only" is a
          figure someone will quote in a meeting. */}
      {rows.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <Tile label="مبلغ کل" value={faMoney(sum((r) => r.totalAmount))} />
          <Tile label="پرداختی مهمان" value={faMoney(sum((r) => r.paidAmount))} />
          <Tile label="سود سایت" value={faMoney(sum((r) => r.websiteShare ?? 0))} />
          <Tile label="شب‌های فروخته‌شده" value={`${faNum(sum((r) => r.daysCount))} شب`} />
        </section>
      )}

      <Card className="overflow-x-auto">
        {isLoading ? (
          <Skeleton className="h-[240px]" />
        ) : rows.length === 0 ? (
          <EmptyState text={state ? "در این وضعیت رزروی نیست" : "برای این اقامتگاه رزروی ثبت نشده"} />
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-F7F7F7">
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    className="px-12 py-10 text-12 leading-18 font-m text-gray-6C6A7D whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const badge = STATE_BY_KEY[r.state];
                const [d, t] = faDateTime(r.createdAt);
                return (
                  <tr
                    key={r.id}
                    className="border-t border-gray-F0F0F0 hover:bg-gray-F7F7F7 transition"
                  >
                    <td className="px-12 py-12 whitespace-nowrap">
                      <Link
                        href={`/admin/reservations/${r.id}`}
                        className="text-13 font-m text-primary-dark hover:text-primary-main"
                      >
                        {r.reference}
                      </Link>
                    </td>
                    <td className="px-12 py-12 whitespace-nowrap">
                      <div className="text-13 leading-20 text-black">{d}</div>
                      <div className="text-12 leading-18 text-gray-6C6A7D">{t}</div>
                    </td>
                    <td className="px-12 py-12 text-13 whitespace-nowrap">
                      {jalaliLong(r.startDate)}
                    </td>
                    <td className="px-12 py-12">
                      <div className="text-14 leading-20 text-black">
                        {r.guest.name || "بدون نام"}
                      </div>
                      <div className="text-12 leading-18 text-gray-6C6A7D" dir="ltr">
                        {r.guest.phone}
                      </div>
                    </td>
                    <td className="px-12 py-12 text-14">{faNum(r.daysCount)}</td>
                    <td className="px-12 py-12 text-14 font-m whitespace-nowrap">
                      {faNum(r.totalAmount)}
                    </td>
                    <td className="px-12 py-12 text-14 whitespace-nowrap">
                      {faNum(r.paidAmount)}
                      {r.paidAmount < r.totalAmount && (
                        <div className="text-11 leading-16 text-gray-6C6A7D">
                          مانده {faNum(r.totalAmount - r.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-12 py-12 text-14 whitespace-nowrap">
                      {/* A dash says "not recorded", which a zero would not. */}
                      {r.websiteShare == null ? (
                        <span className="text-gray-9B9BAA">—</span>
                      ) : (
                        faNum(r.websiteShare)
                      )}
                    </td>
                    <td className="px-12 py-12 whitespace-nowrap">
                      <Badge tone={badge?.tone ?? "gray"}>{badge?.label ?? r.state}</Badge>
                    </td>
                    <td className="px-12 py-12 text-14">
                      {r.guestPreviousCount > 0 ? (
                        faNum(r.guestPreviousCount)
                      ) : (
                        <span className="text-gray-9B9BAA">۰</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8">
          <span className="text-11 leading-18 text-gray-9B9BAA">
            جمع‌های بالا مربوط به همین صفحه است، نه کل {faNum(total)} رزرو.
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-x-8">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                قبلی
              </Button>
              <span className="text-13 text-gray-6C6A7D">
                صفحه {faNum(page)} از {faNum(pages)}
              </span>
              <Button
                variant="secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                بعدی
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-12 py-6 rounded-10 text-12 leading-20 border transition ${
        active
          ? "border-primary-main bg-primary-light text-primary-dark font-m"
          : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
      }`}
    >
      {children}
    </button>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-12 border border-gray-E5E5E6 p-12">
      <span className="block text-11 leading-18 text-gray-9B9BAA mb-4">{label}</span>
      <strong className="block text-14 leading-22 font-m text-black">{value}</strong>
    </div>
  );
}
