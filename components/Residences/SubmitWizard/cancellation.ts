import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";

/**
 * The three cancellation policies, in the words the previous wizard used.
 *
 * The three-row breakdown ("تا ۷۲ ساعت…", "تا ۲۴ ساعت…", "از روز ورود…") is
 * what a host actually reads to choose between them, and it is rendered by
 * `components/Residences/CancelRule/CancelRuleItem` — the same component the
 * old step used, reused rather than reimplemented so the two cannot drift.
 *
 * The numeric side (`fullReturnTime` and the host's shares) is what the
 * reservation engine reads. Storing the name without them would leave the
 * refund terms to be guessed at cancellation time.
 */

export interface CancellationPolicy {
  /** Stored verbatim in `residence.cancellationPolicy`. */
  value: string;
  firstTitle: string;
  firstDesc: string;
  secondTitle: string;
  secondDesc: string;
  thirdTitle: string;
  thirdDesc: string;
  fullReturnTime: number;
  beforeStartTime: number;
  hostShareTotalAmount: number;
  hostSharePastNights: number;
  hostShareFutureNights: number;
}

/** Shown on every policy card. Matches the previous wizard's constants. */
export const RESERVE_COMMISSION = 10;
export const CANCEL_COMMISSION = 10;

export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    value: CancellationPolicy_enum.EASYGOING,
    firstTitle: "تا ۷۲ ساعت قبل از ورود مهمان",
    firstDesc: "پرداخت کامل وجه با کسر کارمزد سایت",
    secondTitle: "تا ۲۴ ساعت قبل از ورود مهمان",
    secondDesc: "سهم میزبان : کسر مبلغ شب اول",
    thirdTitle: "از روز ورود تا خروج مهمان",
    thirdDesc: "سهم میزبان : ۱۰۰٪ مبلغ شب های سپری شده + ۱۰٪ مبلغ شب های باقیمانده",
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 10,
    hostSharePastNights: 100,
    hostShareFutureNights: 0,
  },
  {
    value: CancellationPolicy_enum.BALANCED,
    firstTitle: "تا ۷۲ ساعت قبل از ورود مهمان",
    firstDesc: "سهم میزبان : ۱۰٪ کل مبلغ رزرو",
    secondTitle: "تا ۲۴ ساعت قبل از ورود مهمان",
    secondDesc: "سهم میزبان : کسر مبلغ شب اول + ۱۰٪ شب های باقی مانده",
    thirdTitle: "از روز ورود تا خروج مهمان",
    thirdDesc: "سهم میزبان : ۱۰۰٪ مبلغ شب های سپری شده + ۲۰٪ مبلغ شب های باقیمانده",
    fullReturnTime: 168,
    beforeStartTime: 72,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 20,
  },
  {
    value: CancellationPolicy_enum.STRICT,
    firstTitle: "تا ۷۲ ساعت قبل از ورود مهمان",
    firstDesc: "سهم میزبان : ۲۰٪ کل مبلغ رزرو",
    secondTitle: "تا ۲۴ ساعت قبل از ورود مهمان",
    secondDesc: "سهم میزبان : کسر مبلغ دو شب اول + ۲۰٪ شب های باقی مانده",
    thirdTitle: "از روز ورود تا خروج مهمان",
    thirdDesc: "هیچ مبلغی به مسافر عودت داده نخواهد شد",
    fullReturnTime: 336,
    beforeStartTime: 168,
    hostShareTotalAmount: 30,
    hostSharePastNights: 100,
    hostShareFutureNights: 50,
  },
];

export const policyByValue = (value: string | null | undefined) =>
  CANCELLATION_POLICIES.find((policy) => policy.value === value);

/** Short label for the review screen, where the three rows do not fit. */
export const policyLabel = (value: string | null | undefined) => value || "—";
