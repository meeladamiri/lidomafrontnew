// import { BASE_URL } from "@/configs/info";
import apiBuilder from "../apiBuilder";
import { getRefinedParams } from "@/utilities/SearchPage/getRefinedParams";
import { I_SearchResidenceApi_params } from "@/interfaces/Search/SearchResp";

const searchResidences = async ({
  page = 1,
  page_size = 20,
  order,
  filters,
  features,
  replace_lead,
  lead_id,
  alt_order,
  page_type,
}: I_SearchResidenceApi_params) => {
  const url = `/api/search/new_items`;

  const refined_params = getRefinedParams({
    page,
    page_size,
    order,
    filters,
    features,
    replace_lead,
    lead_id,
    alt_order,
    page_type,
  });

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(refined_params)
    .call();
};

// const searchResidences2 = async ({
//   page = 1,
//   page_size = 20,
//   res_type,
//   order,
//   filters,
//   replace_lead,
//   lead_id,
//   alt_order,
//   tag_title,
// }: I_SearchResidenceApi_params) => {
//   const url = `${BASE_URL}/api/search/get_items`;

//   const refined_params = getRefinedParams({
//     page,
//     page_size,
//     res_type,
//     order,
//     filters,
//     replace_lead,
//     lead_id,
//     alt_order,
//     tag_title,
//   });

//   return apiBuilder
//     .setUrl(url)
//     .setCallMethod("GET")
//     .setJsonRpcMethod("call")
//     .setParams(refined_params)
//     .call();
// };

export {
  searchResidences,
  // searchResidences2
};
