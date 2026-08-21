import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

export interface IServer_Observe_Room {
  amenities: {
    cooling_system?: string;
    free_breakfast?: boolean;
    heating_system?: string;
    refrigerator?: "none" | "shared" | "dedicated";
    separate_bathroom?: boolean;
    wc?: "none" | "shared" | "dedicated";
  };
  capacity: number;
  description?: string;
  double_bed: number;
  extra_peak_price: number;
  extra_price: number;
  id: number;
  image: string;
  max_capacity: number;
  monthly_discount: number;
  name: string;
  peak_price: number;
  single_bed: number;
  traditional_bed: number;
  week_price: number;
  weekend_price: number;
  weekly_discount: number;
}

// Marker id injected into `rules[]` so components/Residences/Edit/Residence/
// index.tsx's `residenceFulldata.rules.find(category === "مقررات لغو رزرو" &&
// name === "مقررات لغو رزرو")` lookup can read the cancellation policy off
// the same array the old backend used. api/Residences/editResidenceRules.ts
// strips this id back out before it's ever sent as a real rule.
const CANCEL_POLICY_SENTINEL_RULE_ID = -1;

const getResidenceFulldataToEdit = async ({
  product_id,
  product_type,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
}): Promise<any> => {
  if (product_type === ResidenceTypes_enum.ROOM) {
    return { status: "error", err_msg: "این قابلیت برای اتاق‌های بوم‌گردی هنوز پشتیبانی نمی‌شود" };
  }

  const resp = await apiBuilder
    .setUrl(`/api/host/residences/${product_id}`)
    .setCallMethod("GET")
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  const r = resp.data;

  const extraFeaturesById: Record<string, any> = {};
  (r.amenities || []).forEach((ra: any) => {
    if (ra.extraFeatures) extraFeaturesById[ra.amenityId] = ra.extraFeatures;
  });
  if (r.otherAmenities) extraFeaturesById.others = r.otherAmenities;

  const extraRulesById: Record<string, any> = {};
  (r.rules || []).forEach((rr: any) => {
    if (rr.value) extraRulesById[rr.ruleId] = rr.value;
  });
  if (r.rulesDesc) extraRulesById.desc = r.rulesDesc;

  const rules = (r.rules || []).map((rr: any) => ({
    id: rr.ruleId,
    name: rr.rule?.name,
    category: rr.rule?.category,
    value: undefined,
  }));
  if (r.cancellationPolicy) {
    rules.push({
      id: CANCEL_POLICY_SENTINEL_RULE_ID,
      name: "مقررات لغو رزرو",
      category: "مقررات لغو رزرو",
      value: r.cancellationPolicy,
    });
  }

  const main = (r.images || []).find((img: any) => img.isMain);
  const gallery = (r.images || []).filter((img: any) => !img.isMain);

  const residence_info = {
    city: r.city?.name,
    parent_city: r.city?.province ? { id: r.city.province.id, name: r.city.province.name } : undefined,
    address: r.address || "",
    description: r.description || "",
    floor: r.floor || "",
    foundation_area: r.foundationArea || null,
    total_area: r.totalArea || null,
    neigborhood: r.neighborhood || "", // sic — matches the (misspelled) field name the edit screen reads
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,

    main_image: main?.url || "",
    images: gallery.map((img: any) => ({ id: img.id, name: img.title || "", url: img.url })),

    capacity: r.capacity || 0,
    max_capacity: r.maxCapacity || 0,
    rooms: (r.rooms || []).map((room: any) => ({
      name: room.name,
      single_bed: room.singleBed ?? 0,
      double_bed: room.doubleBed ?? 0,
      traditional_bed: room.traditionalBed ?? 0,
      extras: room.description || "",
    })),

    amenities: (r.amenities || []).map((ra: any) => ({
      category: "امکانات",
      id: ra.amenityId,
      name: ra.amenity?.name,
      value: "",
    })),
    extra_features: JSON.stringify(extraFeaturesById),

    min_reservable_days: r.minReservableDays || 1,
    checkin_from: r.checkinFrom || "",
    checkin_to: r.checkinTo || "",
    checkout: r.checkout || "12:00",
    rules_desc: JSON.stringify(extraRulesById),
    rules,

    before_start_time: r.beforeStartTime || undefined,
    full_return_time: r.fullReturnTime || undefined,
    host_share_future_nights: r.hostShareFutureNights || undefined,
    host_share_past_nights: r.hostSharePastNights || undefined,
    host_share_total_amount: r.hostShareTotalAmount || undefined,
  };

  return { status: "success", params: { residence_info } };
};

export { getResidenceFulldataToEdit };
