//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";
import { residenceTypeSlug, residenceTypeLabel } from "@/utilities/residenceType";

function mapDisplayType(type: string): "suit" | "boomgardi" | "hotel" {
  return residenceTypeSlug(type);
}

// `residence_type` gets interpolated directly into Persian UI strings
// ("امکانات __", "ظرفیت __", "__ به میزبانی: ") across several components —
// unlike `display_type` (mapDisplayType above), it was never meant to carry
// the raw enum value.
function mapResidenceTypeLabel(type: string): string {
  return residenceTypeLabel(type);
}

function avg(reviews: any[], key: string): number {
  if (!reviews?.length) return 0;
  return reviews.reduce((sum: number, r: any) => sum + (r[key] ?? 0), 0) / reviews.length;
}

function mapResidenceInfo(residence: any, publicId?: number) {
  const images: string[] = (residence.images || []).map((img: any) => img.url).filter(Boolean);
  const mainFirst = [...images].sort((a, b) => {
    const imgA = (residence.images || []).find((i: any) => i.url === a);
    const imgB = (residence.images || []).find((i: any) => i.url === b);
    return (imgB?.isMain ? 1 : 0) - (imgA?.isMain ? 1 : 0);
  });

  // The backend attaches the listing to a single `location` row and hands its
  // province back as `location.parent`. This mapper was reading `residence.city`
  // and `residence.city.province`, neither of which exists on that payload, so
  // every one of these four fields came out empty — which is why the residence
  // page's breadcrumb rendered as "لیدوماتریپ / / / نام اقامتگاه".
  //
  // A listing pinned straight to a province has no city of its own; treating the
  // province row as a city would put it in the breadcrumb twice.
  const locationRow = residence.location ?? null;
  const isProvinceRow = locationRow?.type === "PROVINCE";
  const cityRow = isProvinceRow ? null : locationRow;
  const provinceRow = isProvinceRow ? locationRow : locationRow?.parent ?? null;

  return {
    average_rating: residence.averageRating ?? 0,
    cancel_commission: residence.cancelCommission ?? 0,
    capacity: residence.capacity ?? 0,
    checkin_from: [residence.checkinFrom ?? null],
    checkin_to: [residence.checkinTo ?? null],
    checkout: [residence.checkout ?? null],
    city_id: cityRow?.id,
    city: cityRow?.name || "",
    city_title: cityRow?.titleEn || cityRow?.name || "",
    description: residence.description || "",
    display_type: mapDisplayType(residence.type),
    // Per-facility "توضیحات بیشتر" answers, keyed by amenity id — ResFacilities
    // reads extra_features[feature.id] to fill its details bottom-sheet.
    extra_features: Object.fromEntries(
      (residence.amenities || [])
        .filter((ra: any) => ra.extraFeatures?.extra && Object.keys(ra.extraFeatures.extra).length)
        .map((ra: any) => [ra.amenity?.id, ra.extraFeatures.extra])
    ),
    // Host's free-text rules JSON — ResRules JSON.parses this and shows `desc`.
    extra_rules: residence.extraRules ? JSON.stringify(residence.extraRules) : undefined,
    foundation_area: residence.foundationArea ?? 0,
    host_share_future_nights: residence.hostShareFutureNights ?? 0,
    before_start_time: residence.beforeStartTime ?? 0,
    host_share_past_nights: residence.hostSharePastNights ?? 0,
    host_share_total_amount: residence.hostShareTotalAmount ?? 0,
    full_return_time: residence.fullReturnTime ?? 0,
    host: {
      answer_time: 0,
      description: "",
      image_url: residence.host?.avatarUrl || "",
      joined_date: residence.host?.createdAt || "",
      last_update: "",
      name: residence.host?.name || "",
      reference: residence.host?.id != null ? String(residence.host.id) : "",
    },
    // legacy-URL contract: migrated residences are addressed by their Odoo id
    // everywhere (URL, reserve payloads, کد آگهی) — the backend resolves both.
    id: publicId ?? residence.id,
    is_fast: !!residence.isFast,
    is_full: !!residence.isFull,
    is_offer: !!residence.isOffer,
    latitude: residence.latitude != null ? String(residence.latitude) : undefined,
    longitude: residence.longitude != null ? String(residence.longitude) : undefined,
    main_image: mainFirst,
    max_capacity: residence.maxCapacity ?? 0,
    min_reservable_days: residence.minReservableDays ?? 1,
    name: residence.name,
    name2: residence.name2 || "",
    province_id: provinceRow?.id,
    province: provinceRow?.name || "",
    // slug for /search/<slug> links + breadcrumb schema URLs
    province_title: provinceRow?.titleEn || provinceRow?.name || "",
    // "کد آگهی" — the old site shows the public (Odoo) id, not "ODOO-..."
    reference: publicId ?? residence.reference,
    reserve_commission: residence.reserveCommission ?? 0,
    reviews_count: residence.reviewsCount ?? 0,
    cleaning_rate: avg(residence.reviews, "cleaning"),
    location_rate: avg(residence.reviews, "location"),
    quality_rate: avg(residence.reviews, "quality"),
    integrity_rate: avg(residence.reviews, "integrity"),
    greeting_rate: avg(residence.reviews, "greeting"),
    delivery_rate: avg(residence.reviews, "delivery"),
    residence_type: mapResidenceTypeLabel(residence.type),
    total_area: residence.totalArea ?? 0,
    video_url: residence.videoUrl || undefined,
    price_details: {
      discount: 0,
      discounted_price: residence.weekPrice ?? 0,
      extra_price: residence.extraGuestsPrice ?? 0,
      original_price: residence.weekPrice ?? 0,
    },
  };
}

function mapFeatures(amenities: any[], residence?: any): any[] {
  const catalogFeatures = (amenities || []).map((ra: any) => ({
    category: ra.amenity?.category || "",
    icon_url: ra.amenity?.iconUrl || "",
    id: ra.amenity?.id,
    name: ra.amenity?.name || "",
    // extraFeatures = {value: "دارد" | "جنگلی" | ..., extra: {...}} (from the
    // Odoo attribute migration) — show the value itself; `extra` (the
    // per-facility "توضیحات بیشتر" answers) surfaces via
    // residence_info.extra_features (see mapResidenceInfo).
    value: ra.extraFeatures?.value ?? "دارد",
  }));

  // Boomgardi residences also carry free-text feature names (legacy
  // x_features) rendered under the "امکانات بوم گردی" category.
  const boomFeatures = ((residence?.boomgardiFeatures as string[]) || []).map(
    (name: string, i: number) => ({
      category: "امکانات بوم گردی",
      icon_url: "",
      id: -(i + 1), // synthetic — not a catalog amenity
      name,
      value: "دارد",
    })
  );

  return [...catalogFeatures, ...boomFeatures];
}

function mapRules(rules: any[]): any[] {
  return (rules || []).map((rr: any) => ({
    category: rr.rule?.category || "",
    id: rr.rule?.id,
    name: rr.rule?.name || "",
    value: typeof rr.value === "string" ? rr.value : rr.value ? "بله" : "خیر",
  }));
}

function mapRooms(rooms: any[]): any[] {
  return (rooms || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    single_bed: r.singleBed ?? 0,
    double_bed: r.doubleBed ?? 0,
    traditional_bed: r.traditionalBed ?? 0,
    extras: "",
  }));
}

function mapReviews(reviews: any[]): any[] {
  return (reviews || []).map((r: any) => ({
    average_rating: r.averageRating ?? 0,
    comment: r.comment,
    customer: r.guest?.name ?? "",
    id: r.id,
    reserve_date: r.createdAt?.slice(0, 10) ?? "",
  }));
}

function mapSimilar(similar: any[]): any[] {
  return (similar || []).map((s: any) => {
    const images: string[] = (s.images || []).map((img: any) => img.url).filter(Boolean);
    return {
      average_rating: s.averageRating ?? 0,
      city: "",
      city_id: undefined,
      discount: 0,
      display_type: undefined,
      id: s.id,
      images,
      is_fast: false,
      is_full: false,
      is_offer: false,
      latitude: "",
      longitude: "",
      main_image: images[0] || "",
      max_capacity: s.maxCapacity ?? 0,
      min_price: s.weekPrice ?? 0,
      name: s.name,
      neighborhood: "",
      province: "",
      province_id: undefined,
      reference: undefined,
      reviews_count: 0,
      rooms_count: s.roomsCount ?? 0,
      name2: "",
      capacity: 0,
    };
  });
}

// Shared by the client-side call below AND `pages/rentals/[id].tsx`'s
// `getServerSideProps` (which fetches the backend directly by absolute URL since
// relative `/api/...` rewrites only resolve in the browser, not server-side).
export function mapObserveResidenceData(
  data:
    | {
        residence?: any;
        similar?: any[];
        tags?: any[];
        publicId?: number;
        bookable?: boolean;
        unavailable?: { since?: string | null } | null;
      }
    | undefined
) {
  const { residence, similar, tags, publicId, bookable, unavailable } = data || {};

  if (!residence) {
    return { status: "error", err_msg: "اقامتگاه یافت نشد" };
  }

  // Reshape into the old `{status, params: IObserveResidenceData}` envelope so the
  // whole ObserveResidenceDetails component tree keeps working unchanged. Sections the
  // new backend doesn't have yet (SEO schema_data, distances, faqs) are defaulted to
  // empty arrays — several call-sites `.map()/.find()` these without an optional-chain
  // guard, so `undefined` here would crash the page; `[]` degrades safely.
  return {
    status: "success",
    // A deactivated listing still renders its whole page — only the booking box
    // is replaced. `bookable` is the single flag the tree branches on, rather
    // than each panel re-deriving it. Older payloads have no field, and an
    // undefined one has to mean "yes" or every existing page goes read-only.
    bookable: bookable !== false,
    unavailable_since: unavailable?.since ?? null,
    params: {
      residence_info: mapResidenceInfo(residence, publicId),
      images: (residence.images || []).map((img: any) => ({
        id: img.id,
        name: img.title,
        url: img.url,
      })),
      rooms: mapRooms(residence.rooms),
      features: mapFeatures(residence.amenities, residence),
      rules: mapRules(residence.rules),
      reviews: mapReviews(residence.reviews),
      // feeds the Accommodation schema's amenityFeature list — one
      // {name: true} per possessed amenity, as the old backend produced.
      schema_data: (residence.amenities || [])
        .filter((ra: any) => ra.amenity?.category === "امکانات")
        .map((ra: any) => ({ [ra.amenity.name]: true })),
      // The backend serves these now. They were hardcoded empty because the
      // payload had no such field, so 1,212 listings carried distances that
      // never reached a page.
      // Shaped as IDistanceItem, which is what TouristAttractionsPlaces reads.
      // A row with no distance still belongs on the page — the name and the
      // travel time are useful on their own — so only the label is required.
      distances: (residence.distances || []).map((d: any) => ({
        name: d.placeName,
        distance: d.distance || "",
        time: d.eta || "",
      })),
      // "جستجوهای مرتبط" — computed by the backend from this residence's own
      // amenities (type/area/pool/...) + its city, like the old site.
      tags: tags || [],
      faqs: [],
      similar_res: mapSimilar(similar || []),
    },
  };
}

const getObserveResidence = async ({ product_id }: { product_id: number }) => {
  const url = `/api/residences/${product_id}`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  return mapObserveResidenceData(resp.data);
};

const getObserveResidence2 = getObserveResidence;

export { getObserveResidence, getObserveResidence2 };
