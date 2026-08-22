import apiBuilder from "../apiBuilder";
import { I_SearchResidenceApi_params, IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";
import moment from "moment-jalaali";

const VALID_ORDERS = ["price_asc", "price_desc", "rating_desc", "newest"];

// Date filters live in the URL as Jalali ("1405/06/10"); the backend only
// accepts Gregorian ISO (YYYY-MM-DD) — anything else fails validation and
// kills the whole search request.
function jalaliToISO(j: string | undefined): string | undefined {
  if (!j) return undefined;
  const m = moment(j, "jYYYY/jMM/jDD");
  return m.isValid() ? m.format("YYYY-MM-DD") : undefined;
}

export function mapCard(card: any): IProduct_SearchResidences {
  return {
    id: card.id,
    name: card.name,
    name2: card.name2,
    average_rating: card.averageRating ?? 0,
    reviews_count: card.reviewsCount ?? 0,
    is_fast: !!card.isFast,
    is_full: !!card.isFull,
    is_offer: !!card.isOffer,
    latitude: card.latitude != null ? String(card.latitude) : "",
    longitude: card.longitude != null ? String(card.longitude) : "",
    max_capacity: card.maxCapacity ?? 0,
    capacity: card.capacity ?? 0,
    min_price: card.minPrice ?? 0,
    nowruz_price: undefined,
    city: card.city,
    city_id: undefined as any,
    province: card.province,
    province_id: undefined as any,
    neighborhood: card.neighborhood || "",
    images: card.images || [],
    main_image: card.mainImage,
    rooms_count: card.roomsCount ?? 0,
    reference: card.reference,
    discount: 0,
    display_type: undefined as any,
    prices: {
      discounted_days: [],
      extra_guests_price: 0,
      monthly_discount: 0,
      peak_price: 0,
      special_dates: [],
      week_price: card.minPrice ?? 0,
      weekend_price: card.weekendPrice ?? 0,
      weekly_discount: 0,
    },
  };
}

// Old backend took a nested `filters` object plus lead/alt-order/feature params that
// have no equivalent on the new one — flatten to what `/api/search/residences` accepts.
// Exported so `pages/search/index.tsx`'s `getServerSideProps` (which must hit the
// backend by absolute URL, not through the browser-only rewrite) can build the same body.
export function buildSearchBody({ page = 1, page_size = 20, order, filters, features }: I_SearchResidenceApi_params) {
  const body: Record<string, any> = {
    page,
    pageSize: page_size,
  };

  // Category tags (?villa=1, ?pool=1, ...) arrive as `features`.
  // "boomgardi"/"suit" map to the residence-type column; the rest are
  // amenity-backed filters the backend resolves via Amenity.key (villa/
  // cottage/... -> type, forest/beach/... -> area, pool/jacuzzi -> binary,
  // luxury/economic -> price band, fast -> isFast).
  if (features?.includes("boomgardi")) body.type = "BOOMGARDI";
  else if (features?.includes("suit")) body.type = "SUIT";
  const amenityFeatures = features?.filter((f) => f !== "boomgardi" && f !== "suit");
  if (amenityFeatures?.length) body.features = amenityFeatures;

  if (filters?.cat_name && filters.cat_name !== "s") body.cityName = filters.cat_name;
  const startISO = jalaliToISO(filters?.start);
  const endISO = jalaliToISO(filters?.end);
  if (startISO) body.startDate = startISO;
  if (endISO) body.endDate = endISO;
  if (filters?.min_price !== undefined) body.minPrice = filters.min_price;
  if (filters?.max_price !== undefined) body.maxPrice = filters.max_price;
  if (filters?.guests_count !== undefined) body.guestsCount = filters.guests_count;
  if (filters?.rooms_count !== undefined) body.roomsCount = filters.rooms_count;
  if (filters?.map_bounds) {
    body.mapBounds = {
      minLat: filters.map_bounds.min_lat,
      maxLat: filters.map_bounds.max_lat,
      minLng: filters.map_bounds.min_lng,
      maxLng: filters.map_bounds.max_lng,
    };
  }
  if (order && VALID_ORDERS.includes(order)) body.order = order;

  return body;
}

// Reshape to the old `{status, params:{count, products, peak_dates}}` envelope so
// every existing search-page consumer keeps working unchanged.
export function mapSearchResponse(resp: any) {
  if (resp?.status !== "success") return resp;

  return {
    status: "success",
    params: {
      count: resp?.meta?.total ?? resp?.data?.length ?? 0,
      peak_dates: [],
      products: (resp?.data || []).map(mapCard),
    },
  };
}

const searchResidences = async (params: I_SearchResidenceApi_params) => {
  const resp = await apiBuilder
    .setUrl(`/api/search/residences`)
    .setCallMethod("POST")
    .setParams(buildSearchBody(params))
    .call();

  return mapSearchResponse(resp);
};

export { searchResidences };
