import client from "../index";

/**
 * The host calendar's data layer.
 *
 * One request per visible window, not one per month and not one per listing
 * lookup: `GET /api/host/residences/:id/calendar` answers with the listing's
 * base rates, the day overrides and the booked ranges together, because the
 * screen cannot draw a single cell without all three.
 */

export interface CalendarOverride {
  id: number;
  date: string;
  isBlocked: boolean;
  isFast: boolean | null;
  isPeak: boolean;
  specialPrice: number | null;
  discountAmount: number | null;
  discountType: "PERCENTAGE" | "FIXED_PRICE" | null;
}

export interface BookedRange {
  reference: string;
  /** First night. */
  from: string;
  /** Checkout day — not itself a night. */
  to: string;
  state: string;
  guestName: string | null;
}

export interface HostCalendar {
  residence: {
    id: number;
    name: string;
    isFast: boolean;
    weekPrice: number | null;
    weekendPrice: number | null;
    peakPrice: number | null;
    extraGuestsPrice: number | null;
    minReservableDays: number | null;
  } | null;
  days: CalendarOverride[];
  reservations: BookedRange[];
}

export interface CalendarPatch {
  dates: string[];
  isBlocked?: boolean;
  isFast?: boolean;
  specialPrice?: number | null;
  discountAmount?: number | null;
  discountType?: "PERCENTAGE" | "FIXED_PRICE";
  /** Clears every override on those dates, returning them to the listing's own settings. */
  reset?: boolean;
}

export async function getHostCalendar(
  residenceId: number,
  from: string,
  to: string
): Promise<HostCalendar> {
  const res = await client.get(`/api/host/residences/${residenceId}/calendar`, {
    params: { from, to },
  });
  return res.data?.data as HostCalendar;
}

export async function patchCalendar(residenceId: number, patch: CalendarPatch) {
  const res = await client.patch(`/api/host/residences/${residenceId}/calendar`, patch);
  return res.data?.data as { success: boolean; removed?: number; cleared?: number };
}
