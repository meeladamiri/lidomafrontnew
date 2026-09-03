import { ResidenceTypes_enum } from "constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

export interface IServerCalendarData_discounted_day {
  amount: number;
  date: string; // ex: "2022-12-14"
  discount_id: number;
  type: "percentage" | "fixed_price"; // Refrence to backend: They never use 'fixed_price';
}

export interface IServerCalendarData {
  capacity: number;
  discounted_days: IServerCalendarData_discounted_day[];
  fast_days: string[];
  filled_dates: string[];
  is_temp: boolean;
  max_capacity: number;
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
  prices: {
    extra_guests_price: number;
    extra_guests_peak_price?: number;
    monthly_discount: number;
    peak_price: number;
    week_price: number;
    weekend_price: number;
    weekly_discount: number;
  };
  reserved_dates: string[];
  special_dates: [
    string, // date
    number // price
  ][];
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Which of the two calendar endpoints to ask.
 *
 * They are not interchangeable and the difference is not only permissions:
 * the public route is addressed by the **public** id and resolves legacy Odoo
 * codes, the host route by the **internal** primary key. 1,640 Odoo codes are
 * also some other listing's internal id, so sending one to the wrong route
 * does not fail — it quietly answers about a different property.
 *
 * Public is the default because every page a guest can reach is public, and
 * defaulting the other way is what took booking down: the host route needs
 * `requireHost` plus ownership, so a visitor got 401 or 404 and the residence
 * page showed «خطا در دریافت اطلاعات تقویم» with no way to book.
 */
export type CalendarScope = "public" | "host";

const getCalendarData = async ({
  residenceId,
  residenceType,
  scope = "public",
}: {
  residenceId: number | "all";
  residenceType: ResidenceTypes_enum;
  scope?: CalendarScope;
}): Promise<any> => {
  if (residenceId === "all") {
    // Bulk cross-residence calendar (internal ops tooling) has no backend equivalent.
    return { status: "error", err_msg: "این حالت پشتیبانی نمی‌شود" };
  }

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 365);
  const fromStr = toIsoDate(from);
  const toStr = toIsoDate(to);

  /**
   * One request either way.
   *
   * This used to be two — the public calendar plus the public listing — and
   * neither knew anything about bookings. Both routes now answer with the day
   * overrides, the listing's rates and the booked ranges together, which is
   * what lets the two arrays below actually mean different things. The host
   * route adds who booked; the public one deliberately does not.
   */
  const resp = await apiBuilder
    .setUrl(
      scope === "host"
        ? `/api/host/residences/${residenceId}/calendar`
        : `/api/residences/${residenceId}/calendar`
    )
    .setCallMethod("GET")
    .setParams({ from: fromStr, to: toStr })
    .call();

  if (resp?.status !== "success") {
    return { status: "error", err_msg: "خطا در دریافت اطلاعات تقویم" };
  }

  const residence = resp?.data?.residence || {};
  const days: any[] = resp?.data?.days || [];
  const bookings: { from: string; to: string }[] = resp?.data?.reservations || [];

  const filled_dates: string[] = [];
  const fast_days: string[] = [];
  const special_dates: [string, number][] = [];
  const discounted_days: IServerCalendarData_discounted_day[] = [];

  for (const day of days) {
    const dateStr = String(day.date).slice(0, 10);
    if (day.isBlocked) filled_dates.push(dateStr);
    if (day.isFast) fast_days.push(dateStr);
    if (day.specialPrice != null) special_dates.push([dateStr, day.specialPrice]);
    if (day.discountAmount != null) {
      discounted_days.push({
        amount: day.discountAmount,
        date: dateStr,
        discount_id: day.id,
        type: day.discountType === "PERCENTAGE" ? "percentage" : "fixed_price",
      });
    }
  }

  /**
   * Nights a guest has actually booked.
   *
   * These used to be the same array as `filled_dates`, with a comment saying
   * the backend could not tell them apart — so the calendar drew a sold night
   * and a night the host had closed identically, and "opening" one would have
   * put a sold night back on sale. The backend distinguishes them now.
   *
   * The checkout day is not a night: a booking 10th→12th occupies 10 and 11.
   */
  const reserved_dates: string[] = [];
  for (const booking of bookings) {
    const cursor = new Date(booking.from);
    const end = new Date(booking.to);
    while (cursor < end) {
      reserved_dates.push(toIsoDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // peak_dates stays empty: peak price is a flat per-listing override, not a
  // schedule the calendar can show.
  const data: IServerCalendarData = {
    capacity: residence.capacity ?? 0,
    discounted_days,
    fast_days,
    filled_dates,
    is_temp: false,
    max_capacity: residence.maxCapacity ?? 0,
    peak_dates: [],
    prices: {
      extra_guests_price: residence.extraGuestsPrice ?? 0,
      extra_guests_peak_price: residence.extraGuestsPeakPrice ?? 0,
      monthly_discount: residence.monthlyDiscount ?? 0,
      peak_price: residence.peakPrice ?? 0,
      week_price: residence.weekPrice ?? 0,
      weekend_price: residence.weekendPrice ?? 0,
      weekly_discount: residence.weeklyDiscount ?? 0,
    },
    reserved_dates,
    special_dates,
  };

  return { status: "success", params: data };
};

const getCalendarData2 = getCalendarData;

export { getCalendarData, getCalendarData2 };
