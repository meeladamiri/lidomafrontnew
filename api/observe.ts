//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

function mapDisplayType(type: string): "suit" | "boomgardi" {
  return type === "BOOMGARDI" ? "boomgardi" : "suit";
}

// `residence_type` gets interpolated directly into Persian UI strings
// ("امکانات __", "ظرفیت __", "__ به میزبانی: ") across several components —
// unlike `display_type` (mapDisplayType above), it was never meant to carry
// the raw enum value.
function mapResidenceTypeLabel(type: string): string {
  return type === "BOOMGARDI" ? "بوم‌گردی" : "سوئیت";
}

function avg(reviews: any[], key: string): number {
  if (!reviews?.length) return 0;
  return reviews.reduce((sum: number, r: any) => sum + (r[key] ?? 0), 0) / reviews.length;
}

function mapResidenceInfo(residence: any) {
  const images: string[] = (residence.images || []).map((img: any) => img.url).filter(Boolean);
  const mainFirst = [...images].sort((a, b) => {
    const imgA = (residence.images || []).find((i: any) => i.url === a);
    const imgB = (residence.images || []).find((i: any) => i.url === b);
    return (imgB?.isMain ? 1 : 0) - (imgA?.isMain ? 1 : 0);
  });

  return {
    average_rating: residence.averageRating ?? 0,
    cancel_commission: residence.cancelCommission ?? 0,
    capacity: residence.capacity ?? 0,
    checkin_from: [residence.checkinFrom ?? null],
    checkin_to: [residence.checkinTo ?? null],
    checkout: [residence.checkout ?? null],
    city_id: residence.city?.id,
    city: residence.city?.name || "",
    city_title: residence.city?.titleEn || residence.city?.name || "",
    description: residence.description || "",
    display_type: mapDisplayType(residence.type),
    extra_features: undefined,
    extra_rules: undefined,
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
    id: residence.id,
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
    province_id: residence.city?.province?.id,
    province: residence.city?.province?.name || "",
    province_title: residence.city?.province?.name || "",
    reference: residence.reference,
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

function mapFeatures(amenities: any[]): any[] {
  return (amenities || []).map((ra: any) => ({
    category: ra.amenity?.category || "",
    icon_url: ra.amenity?.iconUrl || "",
    id: ra.amenity?.id,
    name: ra.amenity?.name || "",
    // extraFeatures = {value: "دارد" | "جنگلی" | "کولر گازی، ..."} (from the
    // Odoo attribute migration) — show the value itself.
    value: ra.extraFeatures?.value ?? "دارد",
  }));
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
      rooms_count: 0,
      name2: "",
      capacity: 0,
    };
  });
}

// Shared by the client-side call below AND `pages/rentals/[id].tsx`'s
// `getServerSideProps` (which fetches the backend directly by absolute URL since
// relative `/api/...` rewrites only resolve in the browser, not server-side).
export function mapObserveResidenceData(data: { residence?: any; similar?: any[] } | undefined) {
  const { residence, similar } = data || {};

  if (!residence) {
    return { status: "error", err_msg: "اقامتگاه یافت نشد" };
  }

  // Reshape into the old `{status, params: IObserveResidenceData}` envelope so the
  // whole ObserveResidenceDetails component tree keeps working unchanged. Sections the
  // new backend doesn't have yet (SEO schema_data, distances, tags, faqs) are
  // defaulted to empty arrays — several call-sites `.map()/.find()` these without an
  // optional-chain guard, so `undefined` here would crash the page; `[]` degrades safely.
  return {
    status: "success",
    params: {
      residence_info: mapResidenceInfo(residence),
      images: (residence.images || []).map((img: any) => ({ id: img.id, name: img.title, url: img.url })),
      rooms: mapRooms(residence.rooms),
      features: mapFeatures(residence.amenities),
      rules: mapRules(residence.rules),
      reviews: mapReviews(residence.reviews),
      schema_data: [],
      distances: [],
      tags: [],
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
