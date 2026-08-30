import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, Skeleton, faDate, faNum } from "@/components/Admin/ui";

/**
 * «نرخ این رزرو هم به‌روز شود؟»
 *
 * Two steps, deliberately. Saving a calendar change asks the question; only
 * after yes does it fetch and show what would actually happen. Merging them
 * would mean the price of a booking moves as a side effect of editing a
 * month — and the person editing the month is usually not thinking about a
 * booking made three weeks ago.
 *
 * The preview leads with the nights, not the total. "The total goes up by
 * 555,000" is not something anyone can approve; "the first night went from
 * 1,445,000 to 2,000,000" is.
 */

interface Quote {
  reservation: { id: number; reference: string; state: string; nights: number };
  before: Money;
  after: Money;
  difference: { total_amount: number; host_share: number; clear_remainder: number };
  nights: { date: string; unitPrice: number; isWeekend: boolean; isPeak: boolean; isSpecial: boolean }[];
  settled_amount: number;
  warnings: string[];
}

interface Money {
  total_amount: number;
  website_share: number;
  vat_amount: number;
  guest_commission: number;
  host_share: number;
  clear_remainder: number;
  paid_amount: number;
}

export default function RepriceModal({
  reservationId,
  reference,
  open,
  onClose,
  onDone,
}: {
  reservationId: number | null;
  reference?: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useSWR<Quote>(
    open && reservationId ? `/api/admin/reservations/${reservationId}/reprice` : null,
    (p: string) => apiFetch<Quote>(p)
  );

  async function apply() {
    if (!reservationId) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/reprice`, {
        method: "POST",
        body: JSON.stringify({ note: note.trim() }),
      });
      setNote("");
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "اعمال نشد");
    } finally {
      setBusy(false);
    }
  }

  const unchanged = data && Math.abs(data.difference.total_amount) < 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`به‌روزرسانی نرخ رزرو${reference ? ` ${reference}` : ""}`}
      width="max-w-[720px]"
    >
      {isLoading || !data ? (
        <Skeleton className="h-[280px]" />
      ) : unchanged ? (
        <p className="text-13 leading-22 text-gray-6C6A7D">
          نرخ این رزرو با تقویم فعلی تفاوتی ندارد — تغییری لازم نیست.
        </p>
      ) : (
        <>
          <div className="mb-14">
            <p className="text-13 leading-20 font-m text-black mb-6">شب‌های این رزرو با نرخ جدید</p>
            <div className="rounded-10 border border-gray-E5E5E6 divide-y divide-gray-F0F0F0">
              {data.nights.map((n) => (
                <div key={n.date} className="flex items-center justify-between px-12 py-8 text-13">
                  <span className="text-gray-6C6A7D">
                    {faDate(n.date)}
                    {n.isSpecial && <span className="text-primary-dark"> · نرخ ویژه</span>}
                    {n.isPeak && <span className="text-[#C62828]"> · پیک</span>}
                    {!n.isSpecial && !n.isPeak && n.isWeekend && (
                      <span className="text-[#B26A00]"> · آخر هفته</span>
                    )}
                  </span>
                  <span className="text-black">{faNum(n.unitPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-10 bg-gray-F5F5F7 p-12 mb-14">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-12 text-12 leading-24">
              <span className="text-gray-9B9BAA" />
              <span className="text-gray-9B9BAA text-left">فعلی</span>
              <span className="text-gray-9B9BAA text-left">جدید</span>

              <Row label="مبلغ کل اجاره" a={data.before.total_amount} b={data.after.total_amount} strong />
              <Row label="کارمزد سایت" a={data.before.website_share} b={data.after.website_share} />
              <Row label="ارزش افزوده" a={data.before.vat_amount} b={data.after.vat_amount} />
              <Row label="سهم میزبان" a={data.before.host_share} b={data.after.host_share} strong />
              <Row label="مانده واریز" a={data.before.clear_remainder} b={data.after.clear_remainder} />
            </div>
          </div>

          {data.warnings.length > 0 && (
            <div className="mb-14 flex flex-col gap-y-6">
              {data.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-x-8">
                  <Badge tone="yellow">توجه</Badge>
                  <span className="text-12 leading-20 text-gray-6C6A7D">{w}</span>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="دلیل تغییر نرخ این رزرو"
            className="w-full rounded-8 border border-gray-E5E5E6 p-10 text-13 leading-22 outline-none focus:border-primary-main"
          />
          <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
            این توضیح با نام شما در تاریخچه‌ی رزرو ثبت می‌شود.
          </p>

          {error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}
        </>
      )}

      <div className="flex justify-end gap-x-10 mt-16">
        <Button variant="secondary" onClick={onClose}>
          {unchanged ? "بستن" : "انصراف"}
        </Button>
        {!unchanged && (
          <Button disabled={busy || !data || note.trim().length < 3} onClick={apply}>
            {busy ? "در حال اعمال..." : "اعمال نرخ جدید"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, a, b, strong }: { label: string; a: number; b: number; strong?: boolean }) {
  const moved = Math.abs(a - b) >= 1;
  return (
    <>
      <span className={strong ? "text-black" : "text-gray-6C6A7D"}>{label}</span>
      <span className="text-left text-gray-6C6A7D whitespace-nowrap">{faNum(a)}</span>
      <span
        className={`text-left whitespace-nowrap ${strong ? "font-m" : ""} ${
          moved ? (b > a ? "text-[#2E7D32]" : "text-[#C62828]") : "text-gray-9B9BAA"
        }`}
      >
        {faNum(b)}
      </span>
    </>
  );
}
