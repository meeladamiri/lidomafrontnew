import moment from "moment-jalaali";
import type { BookedRange, CalendarOverride, HostCalendar } from "@/api/Residences/hostCalendar";

/**
 * The calendar's arithmetic, kept away from its rendering.
 *
 * Everything here is pure and works in ISO dates. Jalali is a presentation
 * concern — it decides which cell a date lands in and what the header says —
 * so the identity of a day is always `YYYY-MM-DD`, which is also what the API
 * speaks. Mixing the two is how a calendar ends up off by one for six months
 * of the year.
 */

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

export const ISO = "YYYY-MM-DD";

export type DayState = "past" | "booked" | "blocked" | "open";

export interface Day {
  /** `YYYY-MM-DD`, and the key for everything else. */
  iso: string;
  /** Day number within the Jalali month. */
  label: number;
  state: DayState;
  /** What a guest would pay for this night, after overrides. */
  price: number | null;
  /** True when the price came from an override rather than the listing. */
  hasSpecialPrice: boolean;
  discount: number | null;
  discountType: "PERCENTAGE" | "FIXED_PRICE" | null;
  /** Resolved: the day's override if it has one, else the listing's default. */
  isFast: boolean;
  /** True when this day carries an instant-book answer of its own. */
  hasFastOverride: boolean;
  booking: BookedRange | null;
  /** True for Thursday and Friday, which price differently. */
  isWeekend: boolean;
}

export interface JalaliMonth {
  /** Jalali year and month, e.g. 1405 / 7. */
  year: number;
  month: number;
  title: string;
  /** Always 42 slots — six rows — so the grid never reflows between months. */
  cells: (Day | null)[];
}

/** شنبه‌محور: the week starts on Saturday. */
export const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Saturday = 0 … Friday = 6, from moment's Sunday-based day(). */
const jalaliWeekday = (m: moment.Moment) => (m.day() + 1) % 7;

export const todayIso = () => moment().format(ISO);

export function addJalaliMonths(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function currentJalaliMonth() {
  const now = moment();
  return { year: now.jYear(), month: now.jMonth() + 1 };
}

export function monthTitle(year: number, month: number) {
  return `${moment(`${year}/${month}/1`, "jYYYY/jM/jD").format("jMMMM")} ${year}`;
}

/** The ISO date range a set of Jalali months spans, for one fetch. */
export function windowFor(year: number, month: number, monthCount: number) {
  const start = moment(`${year}/${month}/1`, "jYYYY/jM/jD");
  const last = addJalaliMonths(year, month, monthCount - 1);
  const end = moment(`${last.year}/${last.month}/1`, "jYYYY/jM/jD").endOf("jMonth");
  return { from: start.format(ISO), to: end.format(ISO) };
}

/**
 * The price a guest would pay for one night.
 *
 * An explicit override wins outright. Otherwise the listing's own rates apply,
 * and a peak day beats a weekend day — which is the order the reservation
 * engine uses, so the host is shown the number that will actually be charged.
 */
function priceFor(
  override: CalendarOverride | undefined,
  residence: HostCalendar["residence"] | undefined,
  isWeekend: boolean
): { price: number | null; special: boolean } {
  if (override?.specialPrice != null) return { price: override.specialPrice, special: true };
  if (override?.isPeak && residence?.peakPrice) return { price: residence.peakPrice, special: false };
  if (isWeekend && residence?.weekendPrice) return { price: residence.weekendPrice, special: false };
  return { price: residence?.weekPrice ?? null, special: false };
}

/**
 * Builds the month grids for a window.
 *
 * Booked nights are resolved from the reservation ranges rather than from
 * `isBlocked`, because a booking and a host's own block write the same column.
 * Without this the screen cannot tell them apart — and a host who "unblocks" a
 * sold night has just offered it to a second guest.
 */
export function buildMonths(
  data: HostCalendar | undefined,
  startYear: number,
  startMonth: number,
  monthCount: number
): JalaliMonth[] {
  const overrides = new Map<string, CalendarOverride>();
  (data?.days ?? []).forEach((day) => overrides.set(String(day.date).slice(0, 10), day));

  const booked = new Map<string, BookedRange>();
  (data?.reservations ?? []).forEach((reservation) => {
    const cursor = moment(reservation.from, ISO);
    const end = moment(reservation.to, ISO);
    // `to` is the checkout day, so it is not a night that is occupied.
    while (cursor.isBefore(end)) {
      booked.set(cursor.format(ISO), reservation);
      cursor.add(1, "day");
    }
  });

  const today = todayIso();
  const months: JalaliMonth[] = [];

  for (let i = 0; i < monthCount; i++) {
    const { year, month } = addJalaliMonths(startYear, startMonth, i);
    const first = moment(`${year}/${month}/1`, "jYYYY/jM/jD");
    const daysInMonth = moment.jDaysInMonth(year, month - 1);
    const lead = jalaliWeekday(first);

    const cells: (Day | null)[] = new Array(42).fill(null);

    for (let d = 0; d < daysInMonth; d++) {
      const date = first.clone().add(d, "day");
      const iso = date.format(ISO);
      const override = overrides.get(iso);
      const booking = booked.get(iso) ?? null;
      const weekday = jalaliWeekday(date);
      const isWeekend = weekday === 5 || weekday === 6; // پنجشنبه، جمعه

      const { price, special } = priceFor(override, data?.residence, isWeekend);

      const state: DayState = iso < today
        ? "past"
        : booking
          ? "booked"
          : override?.isBlocked
            ? "blocked"
            : "open";

      cells[lead + d] = {
        iso,
        label: d + 1,
        state,
        price,
        hasSpecialPrice: special,
        discount: override?.discountAmount ?? null,
        discountType: override?.discountType ?? null,
        isFast: override?.isFast ?? data?.residence?.isFast ?? false,
        hasFastOverride: override?.isFast != null,
        booking,
        isWeekend,
      };
    }

    months.push({ year, month, title: monthTitle(year, month), cells });
  }

  return months;
}

/** Every ISO date between two, inclusive — for drag selection. */
export function rangeBetween(a: string, b: string): string[] {
  const [from, to] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  const cursor = moment(from, ISO);
  const end = moment(to, ISO);
  while (cursor.isSameOrBefore(end)) {
    out.push(cursor.format(ISO));
    cursor.add(1, "day");
  }
  return out;
}

export const faDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const money = (value: number | null | undefined) => {
  if (value == null || value <= 0) return "—";
  // Thousands only: a cell is 44px wide and «۱٬۲۰۰٬۰۰۰» does not fit.
  if (value >= 1_000_000) return faDigits((value / 1_000_000).toFixed(1).replace(/\.0$/, "")) + "م";
  return faDigits(Math.round(value / 1000)) + "ه";
};
