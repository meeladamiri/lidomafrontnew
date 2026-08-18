import { ParsedUrlQuery } from "querystring";
// import { determineResidenceTypeFromUrl } from "./determineResidenceTypeFromUrl";
import { search_pages_pageSize } from "@/constants/search_pages_pageSize";

// IMPORTANT NOTE: Because we use the array returned from this function, as the name of 'Cache Files' in '/Search-cache' directory,
//                 Any "New query dependency" MUST be added to the below array (which is being returned by below function);
//                 This SHOULD be done to avoid confilcts when reading data of prevoius files in SSR of search pages.

export function getSearchResidences_Query_dep_array({ query }: { query: ParsedUrlQuery }) {
  return [
    "searchResidences",
    !!query?.page ? Number(query?.page) : 1, // for the page
    search_pages_pageSize, // for pageSize
    !!query?.lead_id
      ? "lead_id"
      : !!query?.alt_order
      ? "alt_order"
      : !!query?.replace_lead
      ? "replace_lead"
      : "search",
    ...Object.values(query), // add all query parameters as dependencies
    // query?.order,
    // query?.replace_lead,
    // query?.lead_id,
    // query?.alt_order,
    // query?.max_lat,
    // query?.max_lng,
    // query?.min_lat,
    // query?.min_lng,
    // // start of generalFilters dependencies
    // query?.id,
    // query?.start,
    // query?.end,
    // query?.min_price,
    // query?.max_price,
    // // query?.region,
    // // query?.rating,
    // // query?.hotel_stars,
    // // query?.fast,
    // // query?.tonight,
    // query?.rooms_count,
    // // query?.fac,
    // // query?.rule,
    // query?.guests_count,
    // // end of generalFilters dependencies
    // query?.discounted,
  ];
}
