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

const getCalendarData = async ({
  residenceId,
  residenceType,
}: {
  residenceId: number | "all";
  residenceType: ResidenceTypes_enum;
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
   * One request, to the host's own endpoint.
   *
   * This used to be two — the public calendar plus the public listing — and
   * neither of them knew anything about bookings. `GET /api/host/residences/
   * :id/calendar` answers with the day overrides, the listing's rates and the
   * booked ranges together, which is what lets the two arrays below actually
   * mean different things.
   */
  const resp = await apiBuilder
    .setUrl(`/api/host/residences/${residenceId}/calendar`)
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
