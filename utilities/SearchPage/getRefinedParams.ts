import { I_SearchResidenceApi_params } from "@/interfaces/Search/SearchResp";

export function getRefinedParams({
  page = 1,
  page_size = 20,
  order,
  filters,
  features,
  replace_lead,
  lead_id,
  alt_order,
  page_type,
}: I_SearchResidenceApi_params) {
  const params: { [key: string]: any } = {
    page,
    page_size,
    page_type,
  };
  if (!!filters && Object.keys(filters).length !== 0) params["filters"] = filters;
  if (features.length !== 0) params["features"] = features;
  if (!!order) params["order"] = order;
  if (!!replace_lead) params["replace_lead"] = replace_lead;
  if (!!lead_id) params["lead_id"] = lead_id;
  if (!!alt_order) params["alt_order"] = alt_order;

  return params;
}
