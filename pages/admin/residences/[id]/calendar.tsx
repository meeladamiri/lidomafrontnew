import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Admin/Layout";
import CalendarRates, { type AffectedReservation } from "@/components/Admin/CalendarRates";
import RepriceModal from "@/components/Admin/RepriceModal";
import { Badge, Button, Card, faDate, faNum } from "@/components/Admin/ui";

/**
 * تقویم و نرخ for one listing.
 *
 * After a save that touched nights a booking is sitting on, the page asks
 * about each of them rather than repricing anything. The calendar is the
 * listing's price going forward; a booking's price was agreed when it was
 * made, and changing that is a separate decision with its own confirmation.
 */
export default function ResidenceCalendarPage() {
  const router = useRouter();
  const id = Number(router.query.id);

  const [affected, setAffected] = useState<AffectedReservation[]>([]);
  const [repricing, setRepricing] = useState<AffectedReservation | null>(null);

  return (
    <AdminLayout
      title="تقویم و نرخ"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/residences">اقامتگاه‌ها</Link>
          {" / "}
          <Link href={`/admin/residences/${id}`}>اقامتگاه</Link>
        </>
      }
    >
      <div className="flex flex-col gap-y-16">
        {Number.isFinite(id) && (
          <CalendarRates residenceId={id} onAffected={(rows) => setAffected(rows)} />
        )}

        {affected.length > 0 && (
          <Card className="p-20">
            <div className="flex items-center gap-x-10 mb-10">
              <Badge tone="yellow">{faNum(affected.length)} رزرو</Badge>
              <h3 className="text-15 leading-24 font-m text-black">
                این تغییر روی شب‌های رزروهای زیر بود
              </h3>
            </div>
            <p className="text-12 leading-20 text-gray-9B9BAA mb-12">
              نرخ این رزروها <b>خودبه‌خود عوض نشده</b> — قیمت هر رزرو در لحظه‌ی ثبتش توافق شده است.
              اگر لازم است به‌روز شود، پیش‌نمایشش را ببینید و تایید کنید.
            </p>

            <div className="flex flex-col gap-y-8">
              {affected.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 rounded-10 border border-gray-E5E5E6 px-12 py-10"
                >
                  <div>
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="text-14 font-m text-primary-dark"
                    >
                      {r.reference}
                    </Link>
                    <p className="text-12 leading-18 text-gray-6C6A7D">
                      {r.guest ?? "—"} · {faDate(r.start_date)} تا {faDate(r.end_date)} ·{" "}
                      {faNum(r.total_amount)} تومان
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setRepricing(r)}>
                    بررسی و به‌روزرسانی نرخ
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Button variant="secondary" onClick={() => setAffected([])}>
                بستن این فهرست
              </Button>
            </div>
          </Card>
        )}
      </div>

      <RepriceModal
        reservationId={repricing?.id ?? null}
        reference={repricing?.reference}
        open={!!repricing}
        onClose={() => setRepricing(null)}
        onDone={() => setAffected((rows) => rows.filter((r) => r.id !== repricing?.id))}
      />
    </AdminLayout>
  );
}
