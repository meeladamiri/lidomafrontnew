import { ParsedUrlQuery } from "querystring";
// import { determineResidenceTypeFromUrl } from "./determineResidenceTypeFromUrl";
import { search_pages_pageSize } from "@/constants/search_pages_pageSize";

export function getSearchResidences_API_params({ query }: { query: ParsedUrlQuery }) {
  const features: string[] = [];

  // Iterate over query parameters and add keys with value 1 to features
  Object.keys(query).forEach((key) => {
    if (query[key] === "1" && key !== "guests_count" && key !== "rooms_count") {
      features.push(key);
    }
  });

  // Determine the page_type
  let page_type: "lead_id" | "alt_order" | "replace_lead" | "search" = "search";
  if (query?.lead_id) {
    page_type = "lead_id";
  } else if (query?.alt_order) {
    page_type = "alt_order";
  } else if (query?.replace_lead) {
    page_type = "replace_lead";
  }

  return {
    page: !!query?.page ? Number(query?.page) : 1,
    page_size: search_pages_pageSize,
    filters: {
      cat_name: !query?.id || !isNaN(Number(query?.id as string)) ? "s" : (query?.id as string),
      start: !!query?.start ? (query?.start as string) : undefined,
      end: !!query?.end ? (query?.end as string) : undefined,
      min_price: !!query?.min_price ? Number(query?.min_price as string) : undefined,
      max_price: !!query?.max_price ? Number(query?.max_price as string) : undefined,
      guests_count: !!query?.guests_count ? Number(query?.guests_count as string) : undefined,
      // rating: !!query?.rating ? (query?.rating as string) : undefined,
      // hotel_stars: !!query?.hotel_stars ? Number(query?.hotel_stars as string) : undefined,
      // fast: !!query?.fast // if 'query?.fast' exists, defenitely 'query?.fast == "true"'
      //   ? true
      //   : undefined,
      // tonight: !!query?.tonight // if 'query?.tonight' exists, defenitely 'query?.tonight == "true"'
      //   ? true
      //   : undefined,
      discounted: !!query?.discounted // if 'query?.discounted' exists, defenitely 'query?.discounted == "true"'
        ? true
        : undefined,
      rooms_count: !!query?.rooms_count ? Number(query?.rooms_count as string) : undefined,
      map_bounds:
        !!query?.max_lat && !!query?.max_lng && !!query?.min_lat && !!query?.min_lng
          ? {
              max_lat: Number(query?.max_lat),
              max_lng: Number(query?.max_lng),
              min_lat: Number(query?.min_lat),
              min_lng: Number(query?.min_lng),
            }
          : undefined,
    },
    features: features,
    lead_id: !!query?.lead_id ? (query?.lead_id as string) : undefined,
    alt_order: !!query?.alt_order ? (query?.alt_order as string) : undefined,
    replace_lead: !!query?.replace_lead ? (query?.replace_lead as string) : undefined,
    // Note: Remove 'order' param from url when it is equal to 'lidoma_suggestion'
    order: !!query?.order ? (query?.order as string) : undefined,
    page_type: page_type,
  };
}
