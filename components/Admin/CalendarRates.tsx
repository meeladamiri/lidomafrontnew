import { useMemo, useState } from "react";
import useSWR from "swr";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Field, Input, Skeleton, faNum } from "@/components/Admin/ui";

/**
 * تقویم و نرخ.
 *
 * A month at a time, in Jalali, with the price a guest would actually pay on
 * each night rather than only the override that was typed. Those differ on
 * every night nobody has touched, and a grid that shows the second is a grid
 * you cannot price from.
 *
 * Selection is the whole interaction: click days (or drag across them), then
 * one panel applies one change to all of them. Editing a night at a time is
 * how a two-week peak period takes fourteen saves.
 *
 * Saving asks what to do about bookings it overlaps — see `onAffected`. The
 * calendar never reprices a booking on its own: a price was agreed when the
 * booking was made, and moving it is a decision rather than a consequence.
 */

interface Day {
  date: string;
  is_blocked: boolean;
  is_peak: boolean;
  special_price: number | null;
  effective_price: number;
  is_weekend: boolean;
  source: "special" | "peak" | "weekend" | "base";
  reservation: { id: number; reference: string; state: string; guest: string | null } | null;
}

export interface AffectedReservation {
  id: number;
  reference: string;
  state: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  guest: string | null;
}

const SOURCE_TONE: Record<Day["source"], string> = {
  special: "text-primary-dark",
  peak: "text-[#C62828]",
  weekend: "text-[#B26A00]",
  base: "text-gray-6C6A7D",
};

/**
 * Month names spelled out rather than left to `jMMMM`, which returns them in
 * Latin unless the locale is loaded globally — and loading a locale globally
 * from a component changes how every other date on the site renders.
 */
const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** Persian digits, ungrouped — for years and day numbers alike. `faNum(1405)` would render ۱٬۴۰۵. */
const faYear = (n: number) => String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

const SOURCE_LABEL: Record<Day["source"], string> = {
  special: "نرخ ویژه",
  peak: "پیک",
  weekend: "آخر هفته",
  base: "نرخ پایه",
};

export default function CalendarRates({
  residenceId,
  highlightRange,
  onAffected,
}: {
  residenceId: number;
  /** Draws a ring around one booking's nights — used from the reservation page. */
  highlightRange?: { start: string; end: string };
  /** Called after a save with the bookings the changed dates overlap. */
  onAffected?: (rows: AffectedReservation[]) => void;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // The Jalali month being shown, and the Gregorian window it spans.
  const anchor = useMemo(() => moment().add(monthOffset, "jMonth"), [monthOffset]);
  const from = anchor.clone().startOf("jMonth").format("YYYY-MM-DD");
  const to = anchor.clone().endOf("jMonth").format("YYYY-MM-DD");

  const { data, isLoading, mutate } = useSWR<{
    residence: { name: string; weekPrice: number | null; weekendPrice: number | null; peakPrice: number | null };
    days: Day[];
  }>(`/api/admin/residences/${residenceId}/calendar?from=${from}&to=${to}`, (p: string) =>
    apiFetch<{
      residence: {
        name: string;
        weekPrice: number | null;
        weekendPrice: number | null;
        peakPrice: number | null;
      };
      days: Day[];
    }>(p)
  );

  const days = data?.days ?? [];

  // Jalali weeks start on Saturday, so the grid needs leading blanks for the
  // columns to line up with their headers. `day()` is Gregorian (0 = Sunday);
  // shifting by one puts Saturday in the first column.
  const leading = (anchor.clone().startOf("jMonth").day() + 1) % 7;

  function toggle(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
    setSaved(null);
  }

  function selectAll() {
    setSelected(new Set(days.map((d) => d.date)));
  }

  function selectWeekends() {
    setSelected(new Set(days.filter((d) => d.is_weekend).map((d) => d.date)));
  }

  async function apply(body: Record<string, unknown>, label: string) {
    if (selected.size === 0) return;
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const res = await apiFetch<{ affected: AffectedReservation[] }>(
        `/api/admin/residences/${residenceId}/calendar`,
        {
          method: "PATCH",
          body: JSON.stringify({ dates: [...selected], ...body }),
        }
      );
      setSaved(`${label} روی ${faNum(selected.size)} روز اعمال شد`);
      setSelected(new Set());
      setPrice("");
      mutate();
      if (res?.affected?.length && onAffected) onAffected(res.affected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  const priceValue = Number(price.replace(/[^\d]/g, "")) || 0;

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <div>
          <h3 className="text-16 leading-24 font-m text-black">تقویم و نرخ</h3>
          {data && (
            <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
              نرخ پایه {faNum(data.residence.weekPrice ?? 0)}
              {data.residence.weekendPrice
                ? ` · آخر هفته ${faNum(data.residence.weekendPrice)}`
                : ""}
              {data.residence.peakPrice ? ` · پیک ${faNum(data.residence.peakPrice)}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-x-8">
          <Button variant="secondary" onClick={() => setMonthOffset((m) => m - 1)}>
            ماه قبل
          </Button>
          <span className="text-14 font-m text-black min-w-[110px] text-center">
            {JALALI_MONTHS[anchor.jMonth()]} {faYear(anchor.jYear())}
          </span>
          <Button variant="secondary" onClick={() => setMonthOffset((m) => m + 1)}>
            ماه بعد
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[320px]" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-4 mb-4">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => (
              <div key={d} className="text-center text-11 text-gray-9B9BAA py-4">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: leading }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {days.map((d) => {
              const jd = moment(d.date, "YYYY-MM-DD");
              const isSelected = selected.has(d.date);
              const inRange =
                highlightRange && d.date >= highlightRange.start && d.date < highlightRange.end;
              const taken = !!d.reservation;

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => toggle(d.date)}
                  title={
                    d.reservation
                      ? `${d.reservation.reference}${d.reservation.guest ? ` — ${d.reservation.guest}` : ""}`
                      : SOURCE_LABEL[d.source]
                  }
                  className={`relative rounded-10 border p-6 text-right transition min-h-[62px] ${
                    isSelected
                      ? "border-primary-main bg-primary-light"
                      : taken
                        ? "border-gray-E5E5E6 bg-gray-F5F5F7"
                        : "border-gray-E5E5E6 hover:border-gray-C4CAD3 bg-white"
                  } ${inRange ? "ring-2 ring-[#B26A00]" : ""}`}
                >
                  {/* `format("jD")` gives Latin digits — a Persian calendar
                      numbered 1..31 in Latin reads as somebody else's. */}
                  <span className="block text-12 leading-18 text-black">
                    {faYear(Number(jd.format("jD")))}
                  </span>
                  <span className={`block text-10 leading-14 ${SOURCE_TONE[d.source]}`}>
                    {faNum(Math.round(d.effective_price / 1000))}k
                  </span>
                  {/* A blocked night says why when a booking holds it, because
                      "blocked" with no reason is the thing support goes and
                      looks up somewhere else. */}
                  {taken && (
                    <span className="block text-9 leading-12 text-gray-9B9BAA truncate">
                      {d.reservation!.reference.replace("RSV-", "")}
                    </span>
                  )}
                  {d.is_blocked && !taken && (
                    <span className="absolute top-4 left-4 w-6 h-6 rounded-full bg-[#C62828]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-x-8 flex-wrap gap-y-8 mt-14 text-11 text-gray-9B9BAA">
            <span>راهنما:</span>
            <span className="text-primary-dark">نرخ ویژه</span>
            <span className="text-[#B26A00]">آخر هفته</span>
            <span className="text-[#C62828]">پیک</span>
            <span>خاکستری = رزرو دارد</span>
          </div>

          <div className="mt-14 rounded-12 border border-gray-E5E5E6 p-14">
            <div className="flex items-center justify-between gap-x-10 flex-wrap gap-y-8 mb-12">
              <span className="text-13 leading-20 text-black">
                {selected.size > 0 ? (
                  <>
                    <b>{faNum(selected.size)}</b> روز انتخاب شده
                  </>
                ) : (
                  "روزها را انتخاب کنید"
                )}
              </span>
              <div className="flex items-center gap-x-6">
                <Button variant="secondary" onClick={selectWeekends}>
                  آخر هفته‌ها
                </Button>
                <Button variant="secondary" onClick={selectAll}>
                  کل ماه
                </Button>
                {selected.size > 0 && (
                  <Button variant="secondary" onClick={() => setSelected(new Set())}>
                    پاک کردن
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
              <Field label="نرخ این روزها (تومان)">
                <Input
                  inputMode="numeric"
                  value={priceValue ? priceValue.toLocaleString("fa-IR") : ""}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="خالی = بدون تغییر نرخ"
                />
              </Field>
              <Button
                disabled={busy || selected.size === 0 || priceValue <= 0}
                onClick={() => apply({ specialPrice: priceValue }, "نرخ ویژه")}
              >
                ثبت نرخ
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 mt-12">
              <Button
                variant="secondary"
                disabled={busy || selected.size === 0}
                onClick={() => apply({ isBlocked: true }, "بستن")}
              >
                بستن روزها
              </Button>
              <Button
                variant="secondary"
                disabled={busy || selected.size === 0}
                onClick={() => apply({ isBlocked: false }, "باز کردن")}
              >
                باز کردن
              </Button>
              <Button
                variant="secondary"
                disabled={busy || selected.size === 0}
                onClick={() => apply({ isPeak: true }, "پیک")}
              >
                علامت پیک
              </Button>
              <Button
                variant="secondary"
                disabled={busy || selected.size === 0}
                onClick={() => apply({ reset: true }, "بازگردانی")}
              >
                بازگردانی به نرخ پایه
              </Button>
            </div>

            {saved && <p className="mt-10 text-13 text-[#2E7D32]">{saved}</p>}
            {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
          </div>
        </>
      )}
    </Card>
  );
}

/** Shown by both callers after a save that touched a booking's nights. */
export function AffectedBadge({ rows }: { rows: AffectedReservation[] }) {
  return (
    <Badge tone="yellow">
      {faNum(rows.length)} رزرو در این بازه
    </Badge>
  );
}
