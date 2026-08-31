import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Field, Input, Skeleton, faNum, parseNum } from "@/components/Admin/ui";
import { JALALI_MONTHS, faDigits } from "@/components/Admin/JalaliDate";

/**
 * تقویم اقامتگاه — three panes over one draft.
 *
 * Modelled on the old site's change-residences-status, and for the same
 * reason: pricing a season is one act, not thirty. The previous version of
 * this calendar wrote on every button press, which meant a mistyped rate was
 * already live and the only undo was retyping the old number from memory.
 *
 *   راست  — the rates that produce each night's price, and the nights of each
 *           kind in view, because «آخر هفته‌ها گران‌اند» is one decision.
 *   وسط   — the month. Click nights, or take them by kind.
 *   چپ    — everything the draft would do, in words, with ذخیره and بازگردانی.
 *
 * The draft survives month navigation on purpose: a peak season runs across
 * the boundary, and a calendar that forgets when you page forward makes you
 * save twice and hope.
 *
 * Nothing here reprices a booking. A booking's price was agreed when it was
 * made; the calendar is what the listing costs *going forward*. After a save
 * that touched nights a booking sits on, the affected list appears and each
 * one stays a separate, confirmed decision.
 */

interface Day {
  date: string;
  is_blocked: boolean;
  is_peak: boolean;
  is_fast: boolean | null;
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

/** What the draft holds for one night. Absent key = untouched. */
interface DayChange {
  /** New nightly override. `null` clears it back onto the base ladder. */
  price?: number | null;
  blocked?: boolean;
  peak?: boolean;
  /** Clears price, peak and blocked together. */
  reset?: boolean;
}

const SOURCE_TONE: Record<Day["source"], string> = {
  special: "text-primary-dark",
  peak: "text-[#C62828]",
  weekend: "text-[#B26A00]",
  base: "text-gray-6C6A7D",
};

const SOURCE_LABEL: Record<Day["source"], string> = {
  special: "نرخ ویژه",
  peak: "پیک",
  weekend: "آخر هفته",
  base: "نرخ پایه",
};

const money = (n: number) => n.toLocaleString("fa-IR");

/** Compact rate for a calendar cell: ۲٬۵۰۰٬۰۰۰ becomes «۲۵۰۰k». */
const shortPrice = (n: number) => faNum(Math.round(n / 1000)) + "k";

export default function CalendarTab({ residenceId }: { residenceId: number }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Record<string, DayChange>>({});
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [affected, setAffected] = useState<AffectedReservation[]>([]);
  const [saved, setSaved] = useState<string | null>(null);

  const anchor = useMemo(() => moment().add(monthOffset, "jMonth"), [monthOffset]);
  const from = anchor.clone().startOf("jMonth").format("YYYY-MM-DD");
  const to = anchor.clone().endOf("jMonth").format("YYYY-MM-DD");

  interface CalendarPayload {
    residence: {
      name: string;
      weekPrice: number | null;
      weekendPrice: number | null;
      peakPrice: number | null;
    };
    days: Day[];
  }

  const { data, isLoading, mutate } = useSWR<CalendarPayload>(
    `/api/admin/residences/${residenceId}/calendar?from=${from}&to=${to}`,
    (p: string) => apiFetch<CalendarPayload>(p)
  );

  const days = data?.days ?? [];

  // Jalali weeks start on Saturday; `day()` is Gregorian (0 = Sunday), so
  // shifting by one puts Saturday in the first column.
  const leading = (anchor.clone().startOf("jMonth").day() + 1) % 7;

  /** The price a night would show if the draft were saved. */
  function previewPrice(d: Day): number {
    const change = draft[d.date];
    if (!change) return d.effective_price;

    const onLadder = () =>
      d.is_weekend && data?.residence.weekendPrice
        ? data.residence.weekendPrice
        : data?.residence.weekPrice ?? 0;

    if (change.reset) return onLadder();
    if (change.price === null) return onLadder();
    if (change.price !== undefined) return change.price;
    if (change.peak && data?.residence.peakPrice) return data.residence.peakPrice;
    return d.effective_price;
  }

  function stage(dates: string[], change: DayChange) {
    if (!dates.length) return;
    setSaved(null);
    setDraft((prev) => {
      const next = { ...prev };
      for (const date of dates) {
        // `reset` replaces rather than merges — it is the "forget everything
        // about this night" button, and merging would leave the thing it is
        // meant to clear sitting next to it.
        next[date] = change.reset ? { reset: true } : { ...next[date], ...change };
      }
      return next;
    });
    setSelected(new Set());
    setPrice("");
  }

  function unstage(date: string) {
    setDraft((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }

  function toggle(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  const draftDates = useMemo(() => Object.keys(draft).sort(), [draft]);

  /**
   * The draft, described the way a person would say it.
   *
   * Grouped by what the change *is*, so «۱۲ شب → ۳٬۲۰۰٬۰۰۰» is one line
   * instead of twelve. A list of every date is a list nobody reads before
   * pressing save.
   */
  const summary = useMemo(() => {
    const groups = new Map<string, { label: string; tone: string; dates: string[] }>();
    for (const date of draftDates) {
      const c = draft[date];
      let key: string;
      let label: string;
      let tone = "text-black";

      if (c.reset) {
        key = "reset";
        label = "بازگردانی به نرخ پایه";
        tone = "text-gray-6C6A7D";
      } else if (c.blocked === true) {
        key = "block";
        label = "بستن شب";
        tone = "text-[#C62828]";
      } else if (c.blocked === false) {
        key = "open";
        label = "باز کردن شب";
        tone = "text-[#2E7D32]";
      } else if (c.peak) {
        key = "peak";
        label = "علامت پیک";
        tone = "text-[#C62828]";
      } else if (c.price != null) {
        key = "price:" + c.price;
        label = "نرخ " + money(c.price) + " تومان";
        tone = "text-primary-dark";
      } else {
        key = "other";
        label = "تغییر";
      }

      const g = groups.get(key) ?? { label, tone, dates: [] };
      g.dates.push(date);
      groups.set(key, g);
    }
    return [...groups.values()];
  }, [draft, draftDates]);

  /** Nights of each kind in the shown month — the right pane's counts. */
  const buckets = useMemo(() => {
    return [
      {
        key: "base",
        label: "شب‌های عادی",
        nights: days.filter((d) => !d.is_weekend && !d.is_peak),
        rate: data?.residence.weekPrice ?? 0,
      },
      {
        key: "weekend",
        label: "آخر هفته",
        nights: days.filter((d) => d.is_weekend && !d.is_peak),
        rate: data?.residence.weekendPrice ?? 0,
      },
      {
        key: "peak",
        label: "ایام پیک",
        nights: days.filter((d) => d.is_peak),
        rate: data?.residence.peakPrice ?? 0,
      },
    ];
  }, [days, data]);

  async function save() {
    if (!draftDates.length) return;
    setBusy(true);
    setError(null);
    try {
      // One request per distinct change; the endpoint takes many dates and one
      // change, so this is the smallest number of writes the draft implies.
      const groups = new Map<string, { body: Record<string, unknown>; dates: string[] }>();
      for (const date of draftDates) {
        const c = draft[date];
        const body: Record<string, unknown> = {};
        if (c.reset) {
          body.reset = true;
        } else {
          if (c.price !== undefined) body.specialPrice = c.price;
          if (c.blocked !== undefined) body.isBlocked = c.blocked;
          if (c.peak !== undefined) body.isPeak = c.peak;
        }
        const key = JSON.stringify(body);
        const g = groups.get(key) ?? { body, dates: [] };
        g.dates.push(date);
        groups.set(key, g);
      }

      const hit: AffectedReservation[] = [];
      for (const g of groups.values()) {
        const res = await apiFetch<{ affected: AffectedReservation[] }>(
          `/api/admin/residences/${residenceId}/calendar`,
          { method: "PATCH", body: JSON.stringify({ dates: g.dates, ...g.body }) }
        );
        for (const r of res?.affected ?? []) {
          if (!hit.some((x) => x.id === r.id)) hit.push(r);
        }
      }

      setSaved(faNum(draftDates.length) + " شب ذخیره شد");
      setDraft({});
      setAffected(hit);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  const priceValue = parseNum(price);
  const selectedCount = selected.size;

  return (
    <div className="flex flex-col gap-y-16">
      {/* Three panes on a real desktop only. `sm:` is a 768–1023 range in this
          project's Tailwind config, not a min-width — see ADMIN-PITFALLS #1. */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-16 items-start">
        {/* ---------- راست: نرخ‌های محاسبه‌شده ---------- */}
        <Card className="p-16 order-2 lg:order-1">
          <h3 className="text-15 leading-24 font-m text-black mb-4">نرخ‌های محاسبه‌شده</h3>
          <p className="text-11 leading-18 text-gray-9B9BAA mb-12">
            نرخ پایه‌ی اقامتگاه و تعداد شب هر نوع در این ماه
          </p>

          {isLoading ? (
            <Skeleton className="h-[180px]" />
          ) : (
            <div className="flex flex-col gap-y-10">
              {buckets.map((b) => (
                <div key={b.key} className="rounded-10 border border-gray-E5E5E6 p-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-13 leading-20 text-black font-m">{b.label}</span>
                    <Badge tone="gray">{faNum(b.nights.length)} شب</Badge>
                  </div>
                  <p className="text-12 leading-20 text-gray-6C6A7D">
                    {b.rate ? money(b.rate) + " تومان" : "تعریف نشده"}
                  </p>
                  {b.nights.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelected(new Set(b.nights.map((d) => d.date)))}
                      className="mt-8 w-full rounded-8 border border-gray-E5E5E6 py-6 text-12 leading-18 text-gray-6C6A7D hover:border-primary-main hover:text-primary-dark"
                    >
                      انتخاب این شب‌ها
                    </button>
                  )}
                </div>
              ))}

              <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
                برای تغییر نرخ پایه به تب «نرخ اقامتگاه» بروید. اینجا فقط شب‌های همین تقویم عوض
                می‌شوند.
              </p>
            </div>
          )}
        </Card>

        {/* ---------- وسط: تقویم ---------- */}
        <Card className="p-16 order-1 lg:order-2">
          <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
            <h3 className="text-15 leading-24 font-m text-black">تقویم</h3>
            <div className="flex items-center gap-x-8">
              <Button variant="secondary" onClick={() => setMonthOffset((m) => m - 1)}>
                ماه قبل
              </Button>
              <span className="text-14 font-m text-black min-w-[110px] text-center">
                {JALALI_MONTHS[anchor.jMonth()]} {faDigits(anchor.jYear())}
              </span>
              <Button variant="secondary" onClick={() => setMonthOffset((m) => m + 1)}>
                ماه بعد
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-[340px]" />
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
                  <div key={"blank-" + i} />
                ))}

                {days.map((d) => {
                  const isSelected = selected.has(d.date);
                  const change = draft[d.date];
                  const taken = !!d.reservation;
                  const changed = !!change;

                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => toggle(d.date)}
                      title={
                        d.reservation
                          ? d.reservation.reference +
                            (d.reservation.guest ? " — " + d.reservation.guest : "")
                          : SOURCE_LABEL[d.source]
                      }
                      className={`relative rounded-10 border p-6 text-right transition min-h-[66px] ${
                        isSelected
                          ? "border-primary-main bg-primary-light"
                          : changed
                            ? "border-[#B26A00] bg-[#FFF8EC]"
                            : taken
                              ? "border-gray-E5E5E6 bg-gray-F5F5F7"
                              : "border-gray-E5E5E6 hover:border-gray-C4CAD3 bg-white"
                      }`}
                    >
                      {/* `format("jD")` returns Latin digits — a Persian
                          calendar numbered in Latin reads as somebody else's. */}
                      <span className="block text-12 leading-18 text-black">
                        {faDigits(moment(d.date, "YYYY-MM-DD").format("jD"))}
                      </span>
                      <span
                        className={`block text-10 leading-14 ${
                          changed ? "text-[#B26A00] font-m" : SOURCE_TONE[d.source]
                        }`}
                      >
                        {shortPrice(previewPrice(d))}
                      </span>
                      {taken && (
                        <span className="block text-9 leading-12 text-gray-9B9BAA truncate">
                          {d.reservation!.reference.replace("RSV-", "")}
                        </span>
                      )}
                      {(change?.blocked === true || (d.is_blocked && !change && !taken)) && (
                        <span className="absolute top-4 left-4 w-6 h-6 rounded-full bg-[#C62828]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-x-10 flex-wrap gap-y-6 mt-14 text-11 text-gray-9B9BAA">
                <span>راهنما:</span>
                <span className="text-primary-dark">نرخ ویژه</span>
                <span className="text-[#B26A00]">آخر هفته</span>
                <span className="text-[#C62828]">پیک</span>
                <span>خاکستری = رزرو دارد</span>
                <span className="text-[#B26A00]">نارنجی = تغییر ذخیره‌نشده</span>
              </div>

              {/* the action strip — applies to the selection, into the draft */}
              <div className="mt-14 rounded-12 border border-gray-E5E5E6 p-14">
                <div className="flex items-center justify-between gap-x-10 flex-wrap gap-y-8 mb-12">
                  <span className="text-13 leading-20 text-black">
                    {selectedCount > 0 ? (
                      <>
                        <b>{faNum(selectedCount)}</b> شب انتخاب شده
                      </>
                    ) : (
                      "شب‌ها را انتخاب کنید"
                    )}
                  </span>
                  <div className="flex items-center gap-x-6 flex-wrap gap-y-6">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setSelected(new Set(days.filter((d) => d.is_weekend).map((d) => d.date)))
                      }
                    >
                      آخر هفته‌ها
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setSelected(new Set(days.map((d) => d.date)))}
                    >
                      کل ماه
                    </Button>
                    {selectedCount > 0 && (
                      <Button variant="secondary" onClick={() => setSelected(new Set())}>
                        پاک کردن انتخاب
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
                  <Field label="نرخ این شب‌ها (تومان)">
                    <Input
                      inputMode="numeric"
                      value={priceValue ? priceValue.toLocaleString("fa-IR") : ""}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="مثلاً ۳٬۵۰۰٬۰۰۰"
                      disabled={selectedCount === 0}
                    />
                  </Field>
                  <Button
                    disabled={selectedCount === 0 || priceValue <= 0}
                    onClick={() => stage([...selected], { price: priceValue })}
                  >
                    افزودن به تغییرات
                  </Button>
                </div>

                <div className="flex flex-wrap gap-8 mt-12">
                  <Button
                    variant="secondary"
                    disabled={selectedCount === 0}
                    onClick={() => stage([...selected], { blocked: true })}
                  >
                    بستن شب‌ها
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={selectedCount === 0}
                    onClick={() => stage([...selected], { blocked: false })}
                  >
                    باز کردن
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={selectedCount === 0}
                    onClick={() => stage([...selected], { peak: true })}
                  >
                    علامت پیک
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={selectedCount === 0}
                    onClick={() => stage([...selected], { reset: true })}
                  >
                    بازگردانی به نرخ پایه
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* ---------- چپ: تغییرات ---------- */}
        <Card className="p-16 order-3 lg:sticky lg:top-[76px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-15 leading-24 font-m text-black">تغییرات</h3>
            {draftDates.length > 0 && <Badge tone="yellow">{faNum(draftDates.length)} شب</Badge>}
          </div>

          {draftDates.length === 0 ? (
            <p className="text-12 leading-20 text-gray-9B9BAA mt-8">
              هنوز تغییری ثبت نشده. شب‌ها را از تقویم انتخاب کنید و تغییر را اعمال کنید — تا وقتی
              «ذخیره» نزنید چیزی نوشته نمی‌شود.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-y-8 mt-10 max-h-[320px] overflow-y-auto">
                {summary.map((g) => (
                  <div key={g.label} className="rounded-10 border border-gray-E5E5E6 p-10">
                    <p className={`text-13 leading-20 font-m ${g.tone}`}>{g.label}</p>
                    <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
                      {faNum(g.dates.length)} شب
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      {g.dates.slice(0, 12).map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => unstage(date)}
                          title="حذف این شب از تغییرات"
                          className="rounded-6 bg-gray-F5F5F7 px-6 py-2 text-11 leading-16 text-gray-6C6A7D hover:bg-[#FDECEC] hover:text-[#C62828]"
                        >
                          {faDigits(moment(date, "YYYY-MM-DD").format("jD/jM"))}
                        </button>
                      ))}
                      {g.dates.length > 12 && (
                        <span className="text-11 leading-16 text-gray-9B9BAA py-2">
                          + {faNum(g.dates.length - 12)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-x-8 mt-14">
                <Button className="flex-1" disabled={busy} onClick={save}>
                  {busy ? "در حال ذخیره…" : "ذخیره"}
                </Button>
                <Button variant="secondary" disabled={busy} onClick={() => setDraft({})}>
                  بازگردانی
                </Button>
              </div>
            </>
          )}

          {saved && <p className="mt-10 text-13 leading-20 text-[#2E7D32]">{saved}</p>}
          {error && <p className="mt-10 text-13 leading-20 text-[#C62828]">{error}</p>}
        </Card>
      </div>

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
            اگر لازم است به‌روز شود، از صفحه‌ی خود رزرو پیش‌نمایشش را ببینید و تایید کنید.
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
                    {r.guest ?? "—"} · {faDigits(moment(r.start_date).format("jYYYY/jMM/jDD"))} تا{" "}
                    {faDigits(moment(r.end_date).format("jYYYY/jMM/jDD"))} ·{" "}
                    {money(r.total_amount)} تومان
                  </p>
                </div>
                <Link href={`/admin/reservations/${r.id}`}>
                  <Button variant="secondary">بررسی رزرو</Button>
                </Link>
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
  );
}
