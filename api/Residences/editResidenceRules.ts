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

const editResidenceRules = async ({
  // product_type,
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
}: IEditResidenceRules) => {
  const url = `/api/edit_residence/rules`;

  const params = {
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
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { editResidenceRules };
