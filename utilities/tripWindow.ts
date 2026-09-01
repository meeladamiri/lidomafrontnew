import moment from "moment";

/**
 * How long after a stay the two sides can still reach each other.
 *
 * A guest and a host need each other during the trip and for a short while
 * after it — a forgotten charger, a deposit, a misunderstanding about the
 * bill. They do not need each other indefinitely, and leaving a phone number
 * on screen forever is how a booking platform becomes the place people go
 * around rather than through.
 *
 * One day after checkout, the phone number and the message button disappear
 * from both panels. The invoice stays available for the same window and says
 * so, so nobody discovers the limit by hitting it.
 *
 * Deliberately one shared rule rather than a check at each call site: the
 * guest's page, the host's page and the invoice button all have to agree, and
 * three copies of `endDate + 1 day` is three chances for one of them to drift.
 */
export const CONTACT_GRACE_DAYS = 1;

/** The moment contact closes: the end of the day after checkout. */
export function contactClosesAt(endDate: string | Date | null | undefined) {
  if (!endDate) return null;
  const end = moment(endDate);
  if (!end.isValid()) return null;
  return end.endOf("day").add(CONTACT_GRACE_DAYS, "day");
}

/**
 * Can these two still contact each other?
 *
 * True for anything that has not ended yet, which is most of the states this
 * is asked about — the window only closes on the far side of a finished stay.
 */
export function isContactOpen(endDate: string | Date | null | undefined): boolean {
  const closes = contactClosesAt(endDate);
  if (!closes) return true;
  return moment().isSameOrBefore(closes);
}

/** «تا ۱ روز پس از پایان سفر» — the same sentence everywhere it is explained. */
export const CONTACT_WINDOW_NOTE =
  "تا یک روز پس از پایان سفر امکان‌پذیر است";

export const INVOICE_WINDOW_NOTE =
  "چاپ صورتحساب تا یک روز پس از پایان سفر امکان‌پذیر است";

/**
 * Whether the two sides' contact details may be shown at all.
 *
 * Two conditions, and both have to hold:
 *
 *   1. **The booking is قطعی.** Before that it is a request, not an
 *      arrangement — a host who has not accepted has no reason to have the
 *      guest's number, and a guest whose request may still be declined has no
 *      reason to have the address. Handing them over early is how a booking
 *      gets completed outside the platform.
 *   2. **The window is still open** — see isContactOpen.
 *
 * The address is included deliberately: a listing's exact address is as much
 * a contact detail as the phone number, and showing it on an unconfirmed
 * request gives away the thing the booking is for.
 */
export function canShowContact(
  state: string | undefined,
  endDate: string | Date | null | undefined
): boolean {
  return state === "DONE" && isContactOpen(endDate);
}
