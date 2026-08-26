//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { BASE_URL } from "@/configs/info";
import apiBuilder from "./apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";

export interface IHomePageData {
  suggests: {
    // average: number; // ex: 729984.962406015
    id: number;
    image: string; // ex: "https://test.lidomatrip.com/web/image/product.public.category/46/x_suggest_image";
    name: string;
    content: string;
    title_en: string;
  }[];
  faqs: {
    answer: string; // html string
    question: string;
    id: number;
  }[];
  desc_boxes: {
    content: string; // html string
    mobile_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_desc_sections/1/x_mobile_image";
    pc_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_desc_sections/1/x_pc_image";
    id: number;
    title: string;
  }[];
  slides: {
    id: number;
    image: string;
    link: string;
  }[];
  service_boxes: {
    content: string;
    image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_trust_boxes/2/x_image";
    id: number;
    title: string;
  }[];
  articles: {
    author: string;
    image: string; // ex: "https://test.lidomatrip.com/web/image/x_article/9/x_image";
    title: string;
    link?: string; // ex: "https://lidomatrip.com/blog/travelguide-to-kelardasht/";
    author_image: string; // ex: "https://test.lidomatrip.com/web/image/x_article/9/x_author_image";
    id: number;
  }[];
  banners: {
    mobile_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_banners/1/x_mobile_image";
    link: string; // ex: "tel://+989361323233";
    id: number;
    pc_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_banners/1/x_pc_image";
  }[];
}

export interface ICustomSlide {
  average_rating: number;
  city: string;
  city_id: number;
  discount: number;
  display_type: I_Residence_display_type;
  id: number;
  is_fast: boolean;
  is_full: boolean;
  is_offer: number;
  main_image: string;
  max_capacity: number;
  min_price: number;
  name: string;
  name2: string;
  neighborhood: string;
  province: string;
  province_id: number;
  reference: number;
  reviews_count: number;
  rooms_count: number;
}
export interface ICustomSliders {
  residences: ICustomSlide[];
}

/**
 * The card components read the old Odoo snake_case shape (`min_price`,
 * `main_image`, ...). The new backend serves camelCase, so every home rail was
 * rendering with a blank image, no price, no rating and no capacity — the
 * markup was there, the values were all `undefined`.
 *
 * Mapping here (rather than in the page) also keeps a client-side refetch
 * consistent with what `getStaticProps` dehydrated.
 */
export function mapHomeCard(c: any) {
  return {
    id: c.id,
    name: c.name,
    name2: c.name2 ?? "",
    province: c.province,
    city: c.city,
    neighborhood: c.neighborhood || "",
    average_rating: c.averageRating ?? 0,
    reviews_count: c.reviewsCount ?? 0,
    min_price: c.minPrice ?? 0,
    rooms_count: c.roomsCount ?? 0,
    max_capacity: c.maxCapacity ?? 0,
    reference: c.reference,
    main_image: c.mainImage || c.images?.[0] || "",
    is_fast: !!c.isFast,
    is_full: !!c.isFull,
    is_offer: !!c.isOffer,
    discount: 0,
  };
}

// The listing rails the page renders. `mapHomeCard` also drops what no card
// reads — the image gallery, coordinates and the price breakdown — which is
// roughly two thirds of each card's bytes.
//
// `rails` (the configurable ones from the admin panel) are mapped separately
// below; these are the fixed legacy keys still referenced by name.
const RAIL_KEYS = ["shomal_reses", "tehran_reses", "boomgardi_reses"] as const;

// Everything else the page reads. The bundle carries more than this — rails for
// sections that are currently commented out — and shipping those put ~60KB of
// JSON nobody reads into `__NEXT_DATA__`, so it is narrowed to what the tree
// actually touches.
const BUNDLE_KEYS = [
  "hero",
  "sections",
  "slides",
  "banners",
  "res_types",
  "desc_boxes",
  "service_boxes",
  "articles",
  "suggests",
  "search_suggestions",
  "app",
  "video",
] as const;

/** Narrows the CMS bundle to what the home page renders, in the shape it expects. */
export function mapHomeBundle(raw: any) {
  if (!raw || typeof raw !== "object") return {};

  const out: Record<string, any> = {};
  for (const key of BUNDLE_KEYS) {
    if (raw[key] !== undefined) out[key] = raw[key];
  }
  for (const key of RAIL_KEYS) {
    out[key] = Array.isArray(raw[key]) ? raw[key].map(mapHomeCard) : [];
  }

  // Admin-configured sliders. A residence rail carries cards; a destination
  // rail carries its own items (city/tag tiles with their own image and link).
  out.rails = Array.isArray(raw.rails)
    ? raw.rails.map((r: any) => ({
        id: r.id,
        kind: r.kind,
        title: r.title ?? null,
        subtitle: r.subtitle ?? null,
        heading_level: r.heading_level ?? 2,
        link_to: r.link_to ?? null,
        items: Array.isArray(r.items) ? r.items : [],
        residences: Array.isArray(r.residences) ? r.residences.map(mapHomeCard) : [],
      }))
    : [];

  // Always present: the page indexes into these without a guard.
  out.faqs = Array.isArray(raw.faqs) ? raw.faqs : [];
  out.search_suggestions = Array.isArray(raw.search_suggestions) ? raw.search_suggestions : [];
  out.res_types = Array.isArray(raw.res_types) ? raw.res_types : [];
  out.banners = Array.isArray(raw.banners) ? raw.banners : [];

  return out;
}

const getHomePageData = async () => {
  // Was `/api/home/get_items` (Odoo JSON-RPC). That route does not exist on the
  // new backend, so every client-side refetch 404'd and only the prefetched
  // copy kept the page alive.
  const resp: any = await apiBuilder.setUrl(`/api/home/page-data`).setCallMethod("GET").call();

  return { status: "success", params: mapHomeBundle(resp?.data) };
};

const getCustomSliders = async ({
  cat_id,
  limit,
  res_type,
}: {
  cat_id: number;
  limit: number;
  res_type: "suit" | "boomgardi" | "all";
}) => {
  const url = `/api/home/get_custom_sliders`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ cat_id, limit, res_type })
    .call();
};

const getHomePageData2 = async () => {
  const url = `${BASE_URL}/api/home/get_items`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getHomePageMetaTags = async () => {
  const url = `/api/get_meta_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      page: "home",
    })
    .call();
};

const getHomePageMetaTags2 = async () => {
  const url = `${BASE_URL}/api/get_meta_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      page: "home",
    })
    .call();
};

export {
  getHomePageData,
  getHomePageData2,
  getHomePageMetaTags,
  getHomePageMetaTags2,
  getCustomSliders,
};
