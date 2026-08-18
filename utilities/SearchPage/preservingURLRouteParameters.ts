import { NextRouter } from "next/router";

export function preservingURLRouteParameters(
  paramsObj: URLSearchParams,
  router: NextRouter
): URLSearchParams {
  // Start of preserving URL-Route parameters
  if (!!router?.query?.id) {
    paramsObj.append("id", router?.query?.id as string);
  }
  if (!!router?.query?.lead_id) {
    paramsObj.append("lead_id", router?.query?.lead_id as string);
  }
  if (!!router?.query?.replace_lead) {
    paramsObj.append("replace_lead", router?.query?.replace_lead as string);
  }
  // if (!!router?.query?.city_name) {
  //   paramsObj.append("city_name", router?.query?.city_name as string);
  // }
  // if (!!router?.query?.tag_title) {
  //   paramsObj.append("tag_title", router?.query?.tag_title as string);
  // }
  if (!!router?.query?.alt_order) {
    paramsObj.append("alt_order", router?.query?.alt_order as string);
  }
  // End of preserving URL-Route parameters

  return paramsObj;
}
