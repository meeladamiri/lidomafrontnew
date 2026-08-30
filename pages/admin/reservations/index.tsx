import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetchPaginated } from "@/api/Admin/adminApi";
import {
  Badge,
  Card,
  EmptyState,
  Skeleton,
  TabPills,
  Toolbar,
  ToolbarIconButton,
  ToolbarPager,
  faDate,
  faDateTime,
  faNum,
  type Tone,
} from "@/components/Admin/ui";

/**
 * The reservation ledger.
 *
 * Columns are fixed and in one order, because this table is read by scanning
 * down a column rather than across a row: every money figure sits in the same
 * place on every line. Amounts are plain numbers with the unit named once in
 * the header — repeating "تومان" on three columns of twenty rows buries the
 * digits that are actually being compared.
 */

const PAGE_SIZE = 20;

interface ReservationRow {
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
  city: string | null;
  guestPreviousCount: number;
  residence: { id: number; name: string };
  guest: { name: string | null; phone: string };
  host: { name: string | null; phone: string };
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
  "ردیف",
  "کد رزرو",
  "ثبت رزرو",
  "شروع اقامت",
  "مهمان",
  "میزبان",
  "شب",
  "مبلغ کل (تومان)",
  "پرداختی (تومان)",
  "سود سایت (تومان)",
  "شهر",
  "وضعیت",
  "رزرو قبلی",
];

function Person({ name, phone }: { name: string | null; phone: string }) {
  return (
    <>
      <div className="text-14 leading-20 text-black">{name || "بدون نام"}</div>
      <div className="text-12 leading-18 text-gray-6C6A7D" dir="ltr">
        {phone}
      </div>
    </>
  );
}

export default function AdminReservationsPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("");

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    ...(state ? { state } : {}),
  });
  const { data, isLoading, mutate } = useSWR(`/api/admin/reservations?${query.toString()}`, (path: string) =>
    apiFetchPaginated<ReservationRow>(path)
  );

  function switchState(next: string) {
    setState(next);
    setPage(1);
  }

  return (
    <AdminLayout
      title="رزروها"
      breadcrumb={<Link href="/admin">داشبورد</Link>}
      actions={
        <TabPills
          tabs={[{ key: "", label: "همه" }, ...STATES.map((s) => ({ key: s.key, label: s.label }))]}
          value={state}
          onChange={switchState}
        />
      }
      toolbar={
        <Toolbar>
          <span className="text-13 leading-20 text-gray-6C6A7D">
            {data ? `${faNum(data.meta.total)} رزرو` : "…"}
          </span>
          <div className="flex items-center gap-x-8">
            <ToolbarIconButton icon="icon-Refresh" label="بارگذاری مجدد" onClick={() => mutate()} />
            {data && (
              <ToolbarPager
                page={page}
                pageSize={PAGE_SIZE}
                total={data.meta.total}
                pageCount={data.meta.pageCount}
                onPage={setPage}
              />
            )}
          </div>
        </Toolbar>
      }
    >
      {isLoading && (
        <div className="grid gap-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[56px]" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <Card>
          <EmptyState text="رزروی با این فیلتر پیدا نشد" />
        </Card>
      )}

      {data && data.items.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[1360px] text-right border-collapse">
            <thead>
              <tr className="bg-gray-F5F5F7 text-12 leading-18 text-gray-6C6A7D">
                {COLUMNS.map((label) => (
                  <th key={label} className="px-12 py-12 font-m whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-F0F0F0">
              {data.items.map((r, i) => {
                const [createdDate, createdTime] = faDateTime(r.createdAt);
                const badge = STATE_BY_KEY[r.state];
                return (
                  <tr key={r.id} className="hover:bg-gray-F5F5F7 transition">
                    <td className="px-12 py-12 text-13 text-gray-6C6A7D">
                      {faNum((page - 1) * PAGE_SIZE + i + 1)}
                    </td>
                    <td className="px-12 py-12 whitespace-nowrap">
                      <Link
                        href={`/admin/reservations/${r.id}`}
                        className="text-14 font-m text-primary-dark"
                        title={r.residence.name}
                      >
                        {r.reference}
                      </Link>
                    </td>
                    <td className="px-12 py-12 whitespace-nowrap">
                      <div className="text-13 leading-20 text-black">{createdDate}</div>
                      <div className="text-12 leading-18 text-gray-6C6A7D">{createdTime}</div>
                    </td>
                    <td className="px-12 py-12 text-13 whitespace-nowrap">{faDate(r.startDate)}</td>
                    <td className="px-12 py-12">
                      <Person {...r.guest} />
                    </td>
                    <td className="px-12 py-12">
                      <Person {...r.host} />
                    </td>
                    <td className="px-12 py-12 text-14">{faNum(r.daysCount)}</td>
                    <td className="px-12 py-12 text-14 font-m whitespace-nowrap">
                      {faNum(r.totalAmount)}
                    </td>
                    <td className="px-12 py-12 text-14 whitespace-nowrap">
                      {faNum(r.paidAmount)}
                      {/* An unpaid remainder is the reason an admin opens this
                          page at all, so it is stated rather than left to be
                          worked out from two columns. */}
                      {r.paidAmount < r.totalAmount && (
                        <div className="text-11 leading-16 text-gray-6C6A7D">
                          مانده {faNum(r.totalAmount - r.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-12 py-12 text-14 whitespace-nowrap">
                      {/* Odoo left this empty on some rows; a dash says "not
                          recorded", which a zero would not. */}
                      {r.websiteShare == null ? (
                        <span className="text-gray-9B9BAA">—</span>
                      ) : (
                        faNum(r.websiteShare)
                      )}
                    </td>
                    <td className="px-12 py-12 text-13 whitespace-nowrap">
                      {r.city || <span className="text-gray-9B9BAA">—</span>}
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
        </Card>
      )}
    </AdminLayout>
  );
}
