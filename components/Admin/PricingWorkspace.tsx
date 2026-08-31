import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, Skeleton, faMoney, faNum } from "@/components/Admin/ui";

/**
 * ویرایش قیمت رزرو — three panes over one draft.
 *
 * The same price can be reached two ways, because two different questions
 * lead here. «شب‌های آخر هفته گران‌اند» is a question about a *kind* of night
 * and is answered on the right, in one field, for all of them at once.
 * «چهارشنبه را توافق کردیم نیم‌بها» is a question about a *date* and is
 * answered in the middle, on the calendar. Both write into the same draft, so
 * neither is a lesser path.
 *
 * Nothing is saved until the left pane says so. Until then the draft is a
 * proposal: the totals recompute on every keystroke, on the server, with the
 * same pricing code that will write the invoice — the browser never adds up
 * money it might get subtly wrong.
 *
 * The scope question is asked at the end rather than the start because it
 * only makes sense once there is something to scope. Its three answers are
 * genuinely different operations:
 *
 *   - این رزرو: the booking is repriced; the listing keeps its rates, so every
 *     other guest and every future booking is untouched.
 *   - تقویم: the listing's nights change; this booking keeps the price it was
 *     agreed at, which is the default because a price already quoted to a
 *     guest is a promise.
 *   - هر دو: both, for the ordinary "we mispriced these nights" case.
 */

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

/** Persian digits without grouping — for days, years, and anything counted. */
const faDigits = (v: string | number) =>
  String(v).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/**
 * A Jalali date, spelled out.
 *
 * `format("jD jMMMM")` returns Latin digits and an English month name unless
 * the fa locale is loaded globally — and loading a locale globally from a
 * component changes how every other date on the site renders. So the digits
 * are converted and the month is taken from the table above.
 */
function jalaliDay(iso: string) {
  return faDigits(moment(iso, "YYYY-MM-DD").format("jD"));
}

function jalaliDayMonth(iso: string) {
  const m = moment(iso, "YYYY-MM-DD");
  return `${faDigits(m.format("jD"))} ${JALALI_MONTHS[m.jMonth()]}`;
}

interface Bucket {
  key: string;
  label: string;
  nights: number;
  unit_price: number;
  total: number;
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

interface Night {
  date: string;
  unitPrice: number;
  isWeekend: boolean;
  isPeak: boolean;
  isSpecial: boolean;
}

interface Quote {
  reservation: { id: number; reference: string; state: string; nights: number };
  before: Money;
  after: Money;
  difference: { total_amount: number; host_share: number; clear_remainder: number };
  nights: Night[];
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

interface CalendarDay {
  date: string;
  is_blocked: boolean;
  is_peak: boolean;
  special_price: number | null;
  effective_price: number;
  is_weekend: boolean;
  source: "special" | "peak" | "weekend" | "base";
  reservation: { id: number; reference: string } | null;
}

type Scope = "reservation" | "calendar" | "both";

export default function PricingWorkspace({
  open,
  onClose,
  reservationId,
  reference,
  residenceId,
  startDate,
  endDate,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: number;
  reference: string;
  residenceId: number;
  startDate: string;
  endDate: string;
  onSaved: () => void;
}) {
  /** date → new nightly price. The single source of "what has been changed". */
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [monthOffset, setMonthOffset] = useState(0);
  const [dayPrice, setDayPrice] = useState("");
  const [scope, setScope] = useState<Scope>("both");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stayStart = startDate.slice(0, 10);
  const stayEnd = endDate.slice(0, 10);

  // Opening on the stay's own month, not today's: the nights being priced are
  // the reason the screen was opened.
  useEffect(() => {
    if (!open) return;
    const diff = moment(stayStart, "YYYY-MM-DD").diff(moment().startOf("jMonth"), "months");
    setMonthOffset(diff);
    setDraft({});
    setSelected(new Set());
    setNote("");
    setError(null);
    setScope("both");
  }, [open, stayStart]);

  const draftKey = JSON.stringify(draft);

  /**
   * The stay as it stands, fetched once.
   *
   * The right pane is built from this rather than from the live preview,
   * because a draft price becomes an override on that night — so repricing
   * «وسط هفته» would move all its nights into «قیمت خاص» and empty the row
   * the agent was typing in. The buckets are the shape of the stay, not a
   * re-derivation of whatever was last typed.
   */
  const { data: baseline } = useSWR<Quote>(
    open ? `/api/admin/reservations/${reservationId}/reprice` : null,
    (p: string) => apiFetch<Quote>(p)
  );

  const { data: quote, isLoading } = useSWR<Quote>(
    open ? [`/api/admin/reservations/${reservationId}/reprice/preview`, draftKey] : null,
    ([path, body]: [string, string]) =>
      apiFetch<Quote>(path, { method: "POST", body: JSON.stringify({ draft: JSON.parse(body) }) }),
    { keepPreviousData: true }
  );

  const anchor = useMemo(() => moment().add(monthOffset, "jMonth"), [monthOffset]);
  const from = anchor.clone().startOf("jMonth").format("YYYY-MM-DD");
  const to = anchor.clone().endOf("jMonth").format("YYYY-MM-DD");

  const { data: calendar } = useSWR<{ days: CalendarDay[] }>(
    open ? `/api/admin/residences/${residenceId}/calendar?from=${from}&to=${to}` : null,
    (p: string) => apiFetch<{ days: CalendarDay[] }>(p)
  );

  const days = calendar?.days ?? [];
  const leading = (anchor.clone().startOf("jMonth").day() + 1) % 7;

  const changed = Object.entries(draft).sort(([a], [b]) => a.localeCompare(b));
  const dirty = changed.length > 0;

  /** What a night cost before anything was typed. */
  const currentOf = (date: string) =>
    baseline?.nights.find((n) => n.date === date)?.unitPrice ??
    days.find((d) => d.date === date)?.effective_price ??
    0;

  function setBucketPrice(bucket: Bucket, price: number) {
    if (!baseline) return;
    const next = { ...draft };
    for (const n of baseline.nights) {
      if (nightInBucket(n, bucket)) next[n.date] = price;
    }
    setDraft(next);
  }

  function applyToSelection() {
    const price = Number(dayPrice.replace(/[^\d]/g, ""));
    if (!price || selected.size === 0) return;
    const next = { ...draft };
    selected.forEach((d) => (next[d] = price));
    setDraft(next);
    setSelected(new Set());
    setDayPrice("");
  }

  function revert() {
    setDraft({});
    setSelected(new Set());
    setDayPrice("");
    setError(null);
  }

  async function save() {
    if (!dirty || note.trim().length < 3) return;
    setBusy(true);
    setError(null);

    try {
      if (scope === "calendar" || scope === "both") {
        // One request per distinct price: the calendar endpoint sets one rate
        // for a set of dates, which is the shape it should keep — a per-date
        // map would make a bulk "whole month at 5m" write far noisier.
        const byPrice = new Map<number, string[]>();
        for (const [date, price] of changed) {
          byPrice.set(price, [...(byPrice.get(price) ?? []), date]);
        }
        for (const [price, dates] of byPrice) {
          await apiFetch(`/api/admin/residences/${residenceId}/calendar`, {
            method: "PATCH",
            body: JSON.stringify({ dates, specialPrice: price }),
          });
        }
      }

      if (scope === "reservation" || scope === "both") {
        // With "both" the calendar now holds these rates, so the booking is
        // repriced from the calendar and the draft is redundant. With
        // "reservation" the draft is the only place they exist.
        await apiFetch(`/api/admin/reservations/${reservationId}/reprice`, {
          method: "POST",
          body: JSON.stringify({
            note: note.trim(),
            ...(scope === "reservation" ? { draft } : {}),
          }),
        });
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  const priceValue = Number(dayPrice.replace(/[^\d]/g, "")) || 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`ویرایش قیمت رزرو ${reference}`}
      width="max-w-[1180px]"
    >
      {isLoading && !quote ? (
        <Skeleton className="h-[420px]" />
      ) : !quote ? (
        <p className="text-13 text-[#C62828]">نرخ این رزرو خوانده نشد.</p>
      ) : (
        <div className="grid lg:grid-cols-14 gap-16 items-start">
          {/* ── راست: نرخ‌های محاسبه‌شده ─────────────────────────── */}
          <section className="lg:col-span-4 rounded-16 border border-gray-E5E5E6 p-16 min-w-0">
            <h4 className="text-14 leading-22 font-m text-black mb-2">نرخ‌های محاسبه‌شده</h4>
            <p className="text-11 leading-18 text-gray-9B9BAA mb-12">
              همان چیزی که مهمان در فرم رزرو دید. تغییر هر نرخ روی همه‌ی شب‌های آن نوع اعمال
              می‌شود.
            </p>

            <div className="flex flex-col gap-y-10">
              {(baseline?.buckets ?? quote.buckets).map((b) => (
                <BucketRow
                  key={b.key}
                  bucket={b}
                  draftPrice={draftPriceFor(b, baseline?.nights ?? [], draft)}
                  onChange={(price) => setBucketPrice(b, price)}
                  /* Locked until the stay's own nights have arrived. Typing a
                     rate before then used to change nothing at all, silently,
                     which reads as a broken field rather than a slow one. */
                  editable={!!baseline && b.key !== "extra-guests"}
                />
              ))}
            </div>

            {quote.totals.discount_amount > 0 && (
              <div className="flex items-center justify-between mt-12 text-12 leading-20">
                <span className="text-gray-6C6A7D">
                  تخفیف اقامت بلندمدت · {faNum(quote.totals.discount_percent)}٪
                </span>
                <span className="text-[#C62828]">
                  − {faNum(quote.totals.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-x-12 mt-12 rounded-10 bg-gray-F5F5F7 px-12 py-10">
              <span className="text-12 leading-20 text-gray-6C6A7D">مبلغ رزرو</span>
              <b className="text-14 leading-24 font-m text-black">
                {faMoney(quote.totals.reservation_amount)}
              </b>
            </div>

            {/* «نرخ هر نفر اضافه» is the listing's own per-person rate, not a
                night, so it cannot be typed over here — it belongs to the
                residence and is edited there. Said, rather than left as a
                field that mysteriously refuses to change anything. */}
            <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
              نرخ نفر اضافه از تنظیمات خود اقامتگاه می‌آید و از اینجا تغییر نمی‌کند.
            </p>
          </section>

          {/* ── وسط: تقویم ────────────────────────────────────── */}
          <section className="lg:col-span-6 rounded-16 border border-gray-E5E5E6 p-16 min-w-0">
            <div className="flex items-center justify-between gap-x-10 mb-12">
              <Button variant="secondary" onClick={() => setMonthOffset((m) => m - 1)}>
                ماه قبل
              </Button>
              <span className="text-14 font-m text-black">
                {JALALI_MONTHS[anchor.jMonth()]} {faDigits(anchor.jYear())}
              </span>
              <Button variant="secondary" onClick={() => setMonthOffset((m) => m + 1)}>
                ماه بعد
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => (
                <div key={d} className="text-center text-11 text-gray-9B9BAA py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: leading }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {days.map((d) => {
                const inStay = d.date >= stayStart && d.date < stayEnd;
                const isSelected = selected.has(d.date);
                const edited = draft[d.date] !== undefined;
                const price = edited ? draft[d.date] : d.effective_price;

                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(d.date)) next.delete(d.date);
                        else next.add(d.date);
                        return next;
                      })
                    }
                    title={inStay ? "شب این رزرو" : d.reservation?.reference ?? ""}
                    className={`relative rounded-10 border p-6 text-right transition min-h-[58px] ${
                      isSelected
                        ? "border-primary-main bg-primary-light"
                        : edited
                          ? "border-[#B26A00] bg-[#FFF4E0]"
                          : "border-gray-E5E5E6 bg-white hover:border-gray-C4CAD3"
                    } ${inStay ? "ring-2 ring-primary-main ring-offset-1" : ""}`}
                  >
                    <span className="block text-12 leading-18 text-black">
                      {jalaliDay(d.date)}
                    </span>
                    <span
                      className={`block text-10 leading-14 ${
                        edited ? "text-[#B26A00] font-m" : "text-gray-6C6A7D"
                      }`}
                    >
                      {faNum(Math.round(price / 1000))}k
                    </span>
                    {d.reservation && !inStay && (
                      <span className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gray-C4CAD3" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-x-8 flex-wrap gap-y-8 mt-12">
              <span className="text-12 leading-20 text-gray-6C6A7D">
                {selected.size > 0 ? (
                  <>
                    <b>{faNum(selected.size)}</b> روز انتخاب شده
                  </>
                ) : (
                  "روزها را انتخاب کنید"
                )}
              </span>
              <Button
                variant="secondary"
                onClick={() => setSelected(new Set(days.filter((d) => d.date >= stayStart && d.date < stayEnd).map((d) => d.date)))}
              >
                شب‌های این رزرو
              </Button>
              {selected.size > 0 && (
                <Button variant="secondary" onClick={() => setSelected(new Set())}>
                  پاک کردن
                </Button>
              )}
            </div>

            <div className="flex items-end gap-x-8 mt-10">
              <label className="flex-1 min-w-0">
                <span className="block mb-4 text-11 leading-18 text-gray-6C6A7D">
                  نرخ روزهای انتخاب‌شده (تومان)
                </span>
                <input
                  inputMode="numeric"
                  value={priceValue ? priceValue.toLocaleString("fa-IR") : ""}
                  onChange={(e) => setDayPrice(e.target.value)}
                  placeholder="مثلاً ۵٬۰۰۰٬۰۰۰"
                  className="w-full px-12 py-8 rounded-10 border border-gray-E5E5E6 text-13 leading-22 outline-none focus:border-primary-main"
                />
              </label>
              <Button disabled={selected.size === 0 || priceValue <= 0} onClick={applyToSelection}>
                اعمال
              </Button>
            </div>

            <p className="mt-8 text-11 leading-18 text-gray-9B9BAA">
              حلقه‌ی رنگی = شب‌های این رزرو · زرد = تغییر ذخیره‌نشده
            </p>
          </section>

          {/* ── چپ: تغییرات ───────────────────────────────────── */}
          <section className="lg:col-span-4 rounded-16 border border-gray-E5E5E6 p-16 min-w-0 flex flex-col">
            <h4 className="text-14 leading-22 font-m text-black mb-2">تغییرات</h4>

            {!dirty ? (
              <p className="text-12 leading-20 text-gray-9B9BAA">
                هنوز چیزی تغییر نکرده. نرخی را از ستون راست یا روی تقویم عوض کنید.
              </p>
            ) : (
              <>
                <div className="max-h-[132px] overflow-y-auto rounded-10 border border-gray-F0F0F0 divide-y divide-gray-F0F0F0 mb-12">
                  {changed.map(([date, price]) => {
                    const before = currentOf(date);
                    return (
                      <div
                        key={date}
                        className="flex items-center justify-between px-10 py-6 text-12 leading-20"
                      >
                        <span className="text-gray-6C6A7D">
                          {jalaliDayMonth(date)}
                        </span>
                        <span className="text-black whitespace-nowrap">
                          <span className="text-gray-9B9BAA line-through">{faNum(before)}</span>
                          {" → "}
                          <b className="font-m">{faNum(price)}</b>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-10 bg-gray-F5F5F7 p-12 mb-12">
                  <Delta label="مبلغ کل اجاره" a={quote.before.total_amount} b={quote.after.total_amount} />
                  <Delta label="سهم میزبان" a={quote.before.host_share} b={quote.after.host_share} />
                  <Delta label="سود سایت" a={quote.before.website_share} b={quote.after.website_share} />
                  <Delta label="مانده واریز" a={quote.before.clear_remainder} b={quote.after.clear_remainder} />
                </div>

                {quote.warnings.length > 0 && (
                  <div className="flex flex-col gap-y-6 mb-12">
                    {quote.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-x-8">
                        <Badge tone="yellow">توجه</Badge>
                        <span className="text-11 leading-18 text-gray-6C6A7D">{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-12 leading-20 text-gray-6C6A7D mb-8">این نرخ‌ها کجا اعمال شود؟</p>
                <div className="flex flex-col gap-y-8 mb-12">
                  <ScopeOption
                    checked={scope === "both"}
                    onSelect={() => setScope("both")}
                    label="هم روی تقویم، هم روی این رزرو"
                    hint="حالت معمول: نرخ اشتباه بوده و باید همه‌جا درست شود."
                  />
                  <ScopeOption
                    checked={scope === "reservation"}
                    onSelect={() => setScope("reservation")}
                    label="فقط این رزرو"
                    hint="تقویم اقامتگاه دست‌نخورده می‌ماند؛ فقط قیمت همین رزرو عوض می‌شود."
                  />
                  <ScopeOption
                    checked={scope === "calendar"}
                    onSelect={() => setScope("calendar")}
                    label="فقط تقویم — این رزرو تغییر نکند"
                    hint="قیمتی که به این مهمان گفته شده سر جایش می‌ماند."
                  />
                </div>

                {scope !== "calendar" && (
                  <>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="یادداشت قیمت‌گذاری — چرا این نرخ عوض می‌شود؟"
                      className="w-full rounded-10 border border-gray-E5E5E6 p-10 text-12 leading-20 outline-none focus:border-primary-main"
                    />
                    <p className="mt-4 mb-12 text-11 leading-18 text-gray-9B9BAA">
                      با نام شما در تاریخچه‌ی رزرو ثبت می‌شود.
                    </p>
                  </>
                )}

                {error && <p className="mb-8 text-12 text-[#C62828]">{error}</p>}
              </>
            )}

            <div className="flex items-center gap-x-8 mt-auto pt-4">
              <Button
                className="flex-1"
                disabled={busy || !dirty || (scope !== "calendar" && note.trim().length < 3)}
                onClick={save}
              >
                {busy ? "در حال ذخیره..." : "ذخیره کردن تغییرات"}
              </Button>
              <Button variant="secondary" disabled={busy || !dirty} onClick={revert}>
                بازگردانی
              </Button>
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}

/**
 * Whether a night belongs to a bucket — the same precedence the server used
 * to build them, matched on the bucket's own rate so the two cannot drift.
 */
function nightInBucket(n: Night, b: Bucket) {
  if (b.key.startsWith("special")) return n.isSpecial && n.unitPrice === b.unit_price;
  if (b.key === "peak") return !n.isSpecial && n.isPeak;
  if (b.key === "weekend") return !n.isSpecial && !n.isPeak && n.isWeekend;
  if (b.key === "week") return !n.isSpecial && !n.isPeak && !n.isWeekend;
  return false;
}

/**
 * The rate a bucket's nights now carry, or null when they disagree.
 *
 * They disagree when someone has priced one night of the bucket on the
 * calendar; showing one of the two would be picking a winner silently, so the
 * field says «چند نرخ» instead and typing over it sets them all again.
 */
function draftPriceFor(bucket: Bucket, nights: Night[], draft: Record<string, number>) {
  const prices = new Set<number>();
  for (const n of nights) {
    if (nightInBucket(n, bucket)) prices.add(draft[n.date] ?? n.unitPrice);
  }
  if (prices.size === 0) return bucket.unit_price;
  if (prices.size > 1) return null;
  return [...prices][0];
}

function BucketRow({
  bucket,
  draftPrice,
  onChange,
  editable,
}: {
  bucket: Bucket;
  draftPrice: number | null;
  onChange: (price: number) => void;
  editable: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  const empty = bucket.nights === 0;
  const changed = draftPrice !== null && draftPrice !== bucket.unit_price;

  // While a field is being typed in it shows what was typed; the moment it is
  // left alone it goes back to mirroring the draft, so an edit made on the
  // calendar is reflected here too.
  const shown =
    text !== null
      ? text
      : draftPrice === null
        ? ""
        : draftPrice
          ? draftPrice.toLocaleString("fa-IR")
          : "";

  function commit(raw: string) {
    setText(raw);
    const n = Number(raw.replace(/[^\d]/g, ""));
    if (n > 0) onChange(n);
  }

  return (
    <div className={`grid grid-cols-[1fr_auto] gap-x-8 items-center ${empty ? "opacity-45" : ""}`}>
      <div className="min-w-0">
        <span className="block text-12 leading-20 text-gray-6C6A7D truncate">{bucket.label}</span>
        <span className="block text-11 leading-18 text-gray-9B9BAA">
          {empty ? "بدون شب" : `${faNum(bucket.nights)} شب`}
          {changed && <span className="text-[#B26A00]"> · تغییر کرده</span>}
        </span>
      </div>
      <input
        inputMode="numeric"
        disabled={!editable || empty}
        value={shown}
        placeholder={draftPrice === null ? "چند نرخ" : ""}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setText(null)}
        className={`w-[122px] px-10 py-8 rounded-10 border text-12 leading-20 text-center outline-none transition focus:border-primary-main disabled:bg-gray-F5F5F7 disabled:text-gray-9B9BAA ${
          changed ? "border-[#B26A00] bg-[#FFF4E0]" : "border-gray-E5E5E6"
        }`}
      />
    </div>
  );
}

function Delta({ label, a, b }: { label: string; a: number; b: number }) {
  const moved = Math.abs(a - b) >= 1;
  return (
    <div className="flex items-baseline justify-between gap-x-10 py-2 text-12 leading-20">
      <span className="text-gray-6C6A7D">{label}</span>
      <span className="whitespace-nowrap">
        <span className="text-gray-9B9BAA">{faNum(a)}</span>
        {" → "}
        <b className={`font-m ${moved ? (b > a ? "text-[#2E7D32]" : "text-[#C62828]") : "text-gray-9B9BAA"}`}>
          {faNum(b)}
        </b>
      </span>
    </div>
  );
}

function ScopeOption({
  checked,
  onSelect,
  label,
  hint,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
}) {
  return (
    <label
      className={`flex items-start gap-x-8 rounded-10 border p-10 cursor-pointer transition ${
        checked ? "border-primary-main bg-primary-light" : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="w-14 h-14 mt-2 accent-[#03D6BB]"
      />
      <span className="min-w-0">
        <span className={`block text-12 leading-20 ${checked ? "text-primary-dark font-m" : "text-black"}`}>
          {label}
        </span>
        <span className="block text-11 leading-18 text-gray-9B9BAA">{hint}</span>
      </span>
    </label>
  );
}
