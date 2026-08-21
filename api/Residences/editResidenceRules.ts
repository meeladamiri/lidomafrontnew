import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";
import apiBuilder from "../apiBuilder";

export interface IEditResidenceRules {
  product_id: number;
  rules: { id: number; extra_rules: "" | { desc: string } }[];
  checkin_from: string;
  checkin_to: string;
  checkout: string;
  min_reservable_days: number;
  desc: string;
  cancellation_policy: CancellationPolicy_enum | "custom";
  full_return_time?: number;
  before_start_time?: number;
  host_share_total_amount?: number;
  host_share_past_nights?: number;
  host_share_future_nights?: number;
}

// Same preset thresholds used by the submission wizard (api/SubmitResidence.ts)
// — kept in sync there since there's no backend-side "policy catalog" yet.
const CANCELLATION_POLICY_PRESETS: Record<
  string,
  {
    fullReturnTime: number;
    beforeStartTime: number;
    hostShareTotalAmount: number;
    hostSharePastNights: number;
    hostShareFutureNights: number;
  }
> = {
  "سیاست سهلگیرانه": {
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 10,
    hostSharePastNights: 100,
    hostShareFutureNights: 0,
  },
  "سیاست متعادل": {
    fullReturnTime: 168,
    beforeStartTime: 72,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 20,
  },
  "سیاست سختگیرانه": {
    fullReturnTime: 336,
    beforeStartTime: 168,
    hostShareTotalAmount: 30,
    hostSharePastNights: 100,
    hostShareFutureNights: 50,
  },
};

// Marker id `getResidenceFulldataToEdit` injects into `rules[]` so this
// screen's cancellation-policy dropdown can be read off the same array the
// old backend used — it must never be forwarded as a real ruleId.
const CANCEL_POLICY_SENTINEL_RULE_ID = -1;

const editResidenceRules = async ({
  product_id,
  rules,
  checkin_from,
  checkin_to,
  checkout,
  min_reservable_days,
  desc,
  cancellation_policy,
  full_return_time,
  before_start_time,
  host_share_total_amount,
  host_share_past_nights,
  host_share_future_nights,
}: IEditResidenceRules): Promise<any> => {
  const isCustom = cancellation_policy === "custom";
  const preset = !isCustom ? CANCELLATION_POLICY_PRESETS[cancellation_policy] : undefined;

  return apiBuilder
    .setUrl(`/api/host/residences/${product_id}/rules`)
    .setCallMethod("PATCH")
    .setParams({
      rules: rules
        .filter((r) => r.id !== CANCEL_POLICY_SENTINEL_RULE_ID)
        .map((r) => ({ ruleId: r.id, value: r.extra_rules || undefined })),
      checkinFrom: checkin_from,
      checkinTo: checkin_to,
      checkout,
      minReservableDays: min_reservable_days,
      rulesDesc: desc,
      // Step_13's same "custom" (literal) vs Persian-enum inconsistency —
      // see api/SubmitResidence.ts for the full explanation.
      cancellationPolicy: isCustom ? "سیاست دلخواه" : cancellation_policy,
      fullReturnTime: isCustom ? full_return_time : preset?.fullReturnTime,
      beforeStartTime: isCustom ? before_start_time : preset?.beforeStartTime,
      hostShareTotalAmount: isCustom ? host_share_total_amount : preset?.hostShareTotalAmount,
      hostSharePastNights: isCustom ? host_share_past_nights : preset?.hostSharePastNights,
      hostShareFutureNights: isCustom ? host_share_future_nights : preset?.hostShareFutureNights,
    })
    .call();
};

export { editResidenceRules };
