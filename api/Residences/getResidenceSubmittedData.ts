// The old backend had one generic `/api/new_residence/get_info` endpoint that
// returned a different `residence_info` shape depending on `step`. The new
// backend just returns the full residence (`GET /api/host/residences/:id`),
// so this file fetches that once and reshapes it per-step to match whatever
// each Step_*/index.tsx component still expects to read.

import apiBuilder from "../apiBuilder";

function toRoomBed(room: any) {
  return {
    id: room.id,
    name: room.name,
    single_bed: room.singleBed ?? 0,
    double_bed: room.doubleBed ?? 0,
    traditional_bed: room.traditionalBed ?? 0,
    extras: room.description || "",
  };
}

const getResidenceSubmittedData = async ({
  step,
  productId,
}: {
  step: number;
  productId: number;
}): Promise<any> => {
  const resp = await apiBuilder
    .setUrl(`/api/host/residences/${productId}`)
    .setCallMethod("GET")
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  const r = resp.data;
  let residence_info: any = {};

  switch (step) {
    case 3:
      residence_info = { rent_type: r.rentType || undefined };
      break;

    case 4:
      residence_info = {
        name: r.name,
        description: r.description || "",
        total_area: r.totalArea || 0,
        foundation_area: r.foundationArea || 0,
        floor: r.floor || "",
      };
      break;

    case 5:
      residence_info = {
        capacity: r.capacity || 0,
        max_capacity: r.maxCapacity || 0,
        rooms: (r.rooms || []).map(toRoomBed),
      };
      break;

    case 6: {
      const extraFeaturesById: Record<string, any> = {};
      (r.amenities || []).forEach((ra: any) => {
        if (ra.extraFeatures) extraFeaturesById[ra.amenityId] = ra.extraFeatures;
      });
      if (r.otherAmenities) extraFeaturesById.others = r.otherAmenities;
      residence_info = {
        amenities: (r.amenities || []).map((ra: any) => ({
          id: ra.amenityId,
          category: ra.amenity?.category,
          name: ra.amenity?.name,
          value: undefined,
        })),
        extra_features: JSON.stringify(extraFeaturesById),
      };
      break;
    }

    case 7:
      residence_info = {
        province: r.city?.province ? { id: r.city.province.id, name: r.city.province.name } : undefined,
        city: r.city?.name,
        neighborhood: r.neighborhood || "",
        address: r.address || "",
      };
      break;

    case 8:
      residence_info = {
        latitude: r.latitude != null ? String(r.latitude) : undefined,
        longitude: r.longitude != null ? String(r.longitude) : undefined,
      };
      break;

    case 9: {
      const main = (r.images || []).find((img: any) => img.isMain);
      const gallery = (r.images || []).filter((img: any) => !img.isMain);
      residence_info = {
        id: r.id,
        images: gallery.map((img: any) => ({ id: img.id, name: img.title || "", url: img.url })),
        main_image: main?.url || "",
        step: r.step || step,
      };
      break;
    }

    case 10:
      residence_info = {
        document: r.documentUrl || undefined,
        host_national_card: r.hostNationalCardUrl || undefined,
        owner_national_card: r.ownerNationalCardUrl || undefined,
      };
      break;

    case 11:
      residence_info = {
        week_price: r.weekPrice || 0,
        weekend_price: r.weekendPrice || 0,
        peak_price: r.peakPrice || 0,
        extra_price: r.extraPrice || 0,
        weekly_discount: r.weeklyDiscount || 0,
        monthly_discount: r.monthlyDiscount || 0,
      };
      break;

    case 12: {
      const extraRules: Record<string, any> = {};
      (r.rules || []).forEach((rr: any) => {
        if (rr.value) extraRules[rr.ruleId] = rr.value;
      });
      if (r.rulesDesc) extraRules.desc = r.rulesDesc;
      residence_info = {
        min_reservable_days: r.minReservableDays || 1,
        checkin_from: r.checkinFrom || undefined,
        checkin_to: r.checkinTo || undefined,
        checkout: r.checkout || undefined,
        extra_rules: JSON.stringify(extraRules),
        rules: (r.rules || []).map((rr: any) => ({
          id: rr.ruleId,
          name: rr.rule?.name,
          category: rr.rule?.category,
        })),
      };
      break;
    }

    case 13:
      residence_info = {
        rules: r.cancellationPolicy ? [{ value: r.cancellationPolicy }] : [],
        full_return_time: r.fullReturnTime || undefined,
        before_start_time: r.beforeStartTime || undefined,
        host_share_total_amount: r.hostShareTotalAmount || undefined,
        host_share_past_nights: r.hostSharePastNights || undefined,
        host_share_future_nights: r.hostShareFutureNights || undefined,
      };
      break;

    default:
      residence_info = {};
  }

  return { status: "success", params: { residence_info } };
};

export { getResidenceSubmittedData };
