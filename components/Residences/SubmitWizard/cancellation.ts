/**
 * The three cancellation policies, and what each one actually means.
 *
 * The numbers are the same ones `api/SubmitResidence.ts` has always sent; they
 * are repeated here rather than imported so the old wizard can be retired
 * without taking the values with it. The stored value is the Persian name,
 * which is what the reservation engine and the panel both read.
 *
 * The descriptions are written from the guest's side, because that is the side
 * a host is deciding about: a stricter policy protects the host's calendar and
 * costs them bookings, and the screen should let them weigh that.
 */

export interface CancellationPolicy {
  /** Stored verbatim in `residence.cancellationPolicy`. */
  value: string;
  label: string;
  summary: string;
  detail: string;
  fullReturnTime: number;
  beforeStartTime: number;
  hostShareTotalAmount: number;
  hostSharePastNights: number;
  hostShareFutureNights: number;
}

export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    value: "سیاست سهلگیرانه",
    label: "سهل‌گیرانه",
    summary: "بیشترین رزرو، کمترین جریمه",
    detail: "لغو رایگان تا ۷۲ ساعت پس از رزرو و تا ۲۴ ساعت مانده به شروع اقامت.",
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 10,
    hostSharePastNights: 100,
    hostShareFutureNights: 0,
  },
  {
    value: "سیاست متعادل",
    label: "متعادل",
    summary: "انتخاب بیشتر میزبان‌ها",
    detail: "لغو رایگان تا ۷ روز پس از رزرو و تا ۳ روز مانده به شروع اقامت.",
    fullReturnTime: 168,
    beforeStartTime: 72,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 20,
  },
  {
    value: "سیاست سختگیرانه",
    label: "سخت‌گیرانه",
    summary: "بیشترین اطمینان از تقویم",
    detail: "لغو رایگان تا ۱۴ روز پس از رزرو و تا ۷ روز مانده به شروع اقامت.",
    fullReturnTime: 336,
    beforeStartTime: 168,
    hostShareTotalAmount: 30,
    hostSharePastNights: 100,
    hostShareFutureNights: 50,
  },
];

export const policyByValue = (value: string | null | undefined) =>
  CANCELLATION_POLICIES.find((policy) => policy.value === value);
