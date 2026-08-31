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

interface Bucket {
  key: string;
  label: string;
  nights: number;
  unit_price: number;
  total: number;
}

interface Quote {
  reservation: { id: number; reference: string; state: string; nights: number };
  before: Money;
  after: Money;
  difference: { total_amount: number; host_share: number; clear_remainder: number };
  nights: { date: string; unitPrice: number; isWeekend: boolean; isPeak: boolean; isSpecial: boolean }[];
  buckets: Bucket[];
  totals: {
    subtotal: number;
    extra_guests_total: number;
    discount_percent: number;
    discount_amount: number;
    reservation_amount: number;
  };
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
  residenceId,
  open,
  onClose,
  onDone,
}: {
  reservationId: number | null;
  reference?: string;
  /** Enables the hand-off to the calendar when the scope is "all bookings". */
  residenceId?: number;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [scope, setScope] = useState<"reservation" | "all">("reservation");
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
          {/* The rate table, one row per kind of night. This is the shape the
              price is actually argued about in — «سه شب وسط هفته» — while a
              list of fifteen dates is something the reader has to add up
              before they can agree with it. The dates are still there, one
              click away, for when a specific night is in dispute. */}
          <div className="mb-14">
            <div className="flex flex-col gap-y-8">
              {data.buckets.map((b) => (
                <div
                  key={b.key}
                  className={`grid grid-cols-[minmax(96px,1fr)_1fr_auto_1fr_auto_1.2fr] items-center gap-x-8 ${
                    b.nights === 0 ? "opacity-45" : ""
                  }`}
                >
                  <span className="text-13 leading-22 text-gray-6C6A7D">{b.label} :</span>
                  <Cell>{b.nights ? `${faNum(b.nights)} روز` : "۰"}</Cell>
                  <span className="text-gray-9B9BAA text-12">×</span>
                  <Cell>{faNum(b.unit_price)}</Cell>
                  <span className="text-gray-9B9BAA text-12">=</span>
                  <Cell strong>{b.total ? `${faNum(b.total)} تومان` : "۰"}</Cell>
                </div>
              ))}
            </div>

            {data.totals.discount_amount > 0 && (
              <div className="flex items-center justify-between mt-10 px-14 text-13 leading-22">
                <span className="text-gray-6C6A7D">
                  تخفیف اقامت بلندمدت · {faNum(data.totals.discount_percent)}٪
                </span>
                <span className="text-[#C62828]">− {faNum(data.totals.discount_amount)} تومان</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-x-12 mt-10 rounded-10 bg-gray-F5F5F7 px-14 py-10">
              <span className="text-13 leading-22 text-gray-6C6A7D">مبلغ رزرو :</span>
              <b className="text-14 leading-24 font-m text-black">
                {faNum(data.totals.reservation_amount)} تومان
              </b>
            </div>

            <details className="mt-10">
              <summary className="cursor-pointer text-12 leading-20 text-gray-9B9BAA hover:text-gray-6C6A7D">
                نمایش شب‌به‌شب ({faNum(data.nights.length)} شب)
              </summary>
              <div className="mt-8 rounded-10 border border-gray-E5E5E6 divide-y divide-gray-F0F0F0">
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
            </details>
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

          {/* Two genuinely different operations, named as one choice because
              that is how it gets asked: is this booking wrong, or is the
              listing's rate wrong? Only the first is applied here — the
              second changes what every future booking costs and belongs on
              the calendar, so it hands over rather than pretending. */}
          <div className="flex flex-wrap gap-x-24 gap-y-8 mb-12">
            <Scope
              checked={scope === "reservation"}
              onSelect={() => setScope("reservation")}
              label="تغییر قیمت فقط برای این رزرو"
            />
            <Scope
              checked={scope === "all"}
              onSelect={() => setScope("all")}
              label="تغییر قیمت برای همه رزروها"
            />
          </div>

          {scope === "all" ? (
            <div className="rounded-10 bg-gray-F5F5F7 p-12">
              <p className="text-12 leading-20 text-gray-6C6A7D">
                نرخ همه‌ی رزروها از تقویم اقامتگاه تغییر می‌کند — آنجا نرخ شب‌ها را ویرایش
                می‌کنید و بعد برای هر رزروی که لازم است همین پیش‌نمایش را می‌بینید. تغییر نرخ یک
                رزرو گذشته از اینجا انجام نمی‌شود.
              </p>
              {residenceId && (
                <a href={`/admin/residences/${residenceId}/calendar`} className="inline-block mt-10">
                  <Button variant="secondary">رفتن به تقویم اقامتگاه</Button>
                </a>
              )}
            </div>
          ) : (
            <>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="یادداشت قیمت‌گذاری — چرا نرخ این رزرو عوض می‌شود؟"
                className="w-full rounded-8 border border-gray-E5E5E6 p-10 text-13 leading-22 outline-none focus:border-primary-main"
              />
              <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                این توضیح با نام شما در تاریخچه‌ی رزرو ثبت می‌شود.
              </p>
            </>
          )}

          {error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}
        </>
      )}

      <div className="flex justify-end gap-x-10 mt-16">
        <Button variant="secondary" onClick={onClose}>
          {unchanged ? "بستن" : "انصراف"}
        </Button>
        {!unchanged && scope === "reservation" && (
          <Button disabled={busy || !data || note.trim().length < 3} onClick={apply}>
            {busy ? "در حال اعمال..." : "اعمال نرخ جدید"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

/** A boxed figure in the rate table — reads as a field without being one. */
function Cell({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`block rounded-10 bg-gray-F5F5F7 px-12 py-8 text-13 leading-22 text-center truncate ${
        strong ? "text-black font-m" : "text-gray-6C6A7D"
      }`}
    >
      {children}
    </span>
  );
}

function Scope({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-x-8 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="w-16 h-16 accent-[#03D6BB]"
      />
      <span className="text-13 leading-22 text-gray-6C6A7D">{label}</span>
    </label>
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
