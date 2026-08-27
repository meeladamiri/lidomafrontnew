// The old backend had one generic `/api/new_residence/submit_info` endpoint that
// branched on a `step` number. The new backend exposes a proper REST resource
// (`/api/host/residences/...`) instead, so this file is now a dispatcher that
// routes each wizard step's payload to the right endpoint(s) and reshapes the
// result back into the `{status, params: {product_id}}` / `{status, err_msg}`
// envelope every Step_*/index.tsx component already expects.

import apiBuilder from "./apiBuilder";

const WIZARD_STEP_COUNT = 14;

const CANCELLATION_POLICY_PRESETS: Record<
  string,
  {
    fullReturnTime: number;
    beforeStartTime: number;
    hostShareTotalAmount: number;
    hostSharePastNights: number;
    hostShareFutureNights: number;
  }
> = {
  "سیاست سهلگیرانه": {
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 10,
    hostSharePastNights: 100,
    hostShareFutureNights: 0,
  },
  "سیاست متعادل": {
    fullReturnTime: 168,
    beforeStartTime: 72,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 20,
  },
  "سیاست سختگیرانه": {
    fullReturnTime: 336,
    beforeStartTime: 168,
    hostShareTotalAmount: 30,
    hostSharePastNights: 100,
    hostShareFutureNights: 50,
  },
};

const submitStep = async ({
  step,
  productId,
  data,
}: {
  step: number;
  productId?: number; // will not exist only in first step
  data: { [key: string]: any };
}): Promise<any> => {
  try {
    switch (step) {
      case 1: {
        const type = data.res_type === "اقامتگاه بوم‌گردی" ? "BOOMGARDI" : "SUIT";
        const resp = await apiBuilder
          .setUrl(`/api/host/residences`)
          .setCallMethod("POST")
          .setParams({ type })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: resp.data.id } };
      }

      case 2:
        return finish(
          await apiBuilder
            .setUrl(`/api/host/residences/${productId}`)
            .setCallMethod("PATCH")
            .setParams({ region: data.res_region, step: 2 })
            .call(),
          productId
        );

      case 3:
        return finish(
          await apiBuilder
            .setUrl(`/api/host/residences/${productId}`)
            .setCallMethod("PATCH")
            .setParams({ rentType: data.rent_type, step: 3 })
            .call(),
          productId
        );

      case 4:
        return finish(
          await apiBuilder
            .setUrl(`/api/host/residences/${productId}`)
            .setCallMethod("PATCH")
            .setParams({
              name: data.name || undefined,
              description: data.description,
              totalArea: data.total_area,
              foundationArea: data.foundation_area,
              floor: data.floor,
              step: 4,
            })
            .call(),
          productId
        );

      case 5: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/rooms`)
          .setCallMethod("PUT")
          .setParams({
            capacity: data.capacity,
            maxCapacity: data.max_capacity,
            rooms: (data.rooms || []).map((r: any) => ({
              name: r.name,
              singleBed: r.single_bed || 0,
              doubleBed: r.double_bed || 0,
              traditionalBed: r.traditional_bed || 0,
              description: r.extras || undefined,
            })),
            step: 5,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      case 6: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/amenities`)
          .setCallMethod("PATCH")
          .setParams({
            amenities: (data.amenities || []).map((a: any) => ({
              amenityId: a.id,
              extraFeatures: a.extra_features || undefined,
            })),
            other: data.others,
            step: 6,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      case 7:
        // The city goes by name: the backend resolves it. Looking the id up
        // here first put a second serial round trip in front of every address
        // save, on the step where a host is already typing the most.
        return finish(
          await apiBuilder
            .setUrl(`/api/host/residences/${productId}`)
            .setCallMethod("PATCH")
            .setParams({
              cityName: data.city || undefined,
              neighborhood: data.neighborhood,
              address: data.address,
              step: 7,
            })
            .call(),
          productId
        );

      case 8:
        return finish(
          await apiBuilder
            .setUrl(`/api/host/residences/${productId}`)
            .setCallMethod("PATCH")
            .setParams({
              latitude: data.latitude ?? undefined,
              longitude: data.longitude ?? undefined,
              step: 8,
            })
            .call(),
          productId
        );

      case 9: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/images/order`)
          .setCallMethod("POST")
          .setParams({
            imageIds: (data.image_ids || []).filter((id: any) => !!id),
            step: 9,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      // step 10 (documents) is handled entirely by submitNewResidenceDocs in
      // api/NewResidenceImages.ts, not through this generic dispatcher.

      case 11: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/pricing`)
          .setCallMethod("PATCH")
          .setParams({
            weekPrice: data.week_price,
            weekendPrice: data.weekend_price,
            peakPrice: data.peak_price,
            extraPrice: data.extra_price,
            weeklyDiscount: data.weekly_discount,
            monthlyDiscount: data.monthly_discount,
            step: 11,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      case 12: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/rules`)
          .setCallMethod("PATCH")
          .setParams({
            rules: (data.rules || []).map((r: any) => ({
              ruleId: r.id,
              value: r.extra_rules || undefined,
            })),
            checkinFrom: data.checkin_from,
            checkinTo: data.checkin_to,
            checkout: data.checkout,
            minReservableDays: data.min_reservable_days,
            rulesDesc: data.desc,
            step: 12,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      case 13: {
        // Step_13 sends the literal string "custom" on submit but compares
        // against the Persian CancellationPolicy_enum.CUSTOM value ("سیاست
        // دلخواه") when re-selecting a previously-saved policy — store the
        // enum value so a resumed draft correctly re-highlights "custom".
        const isCustom = data.cancellation_policy === "custom";
        const preset = !isCustom ? CANCELLATION_POLICY_PRESETS[data.cancellation_policy] : undefined;
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/rules`)
          .setCallMethod("PATCH")
          .setParams({
            cancellationPolicy: isCustom ? "سیاست دلخواه" : data.cancellation_policy,
            fullReturnTime: isCustom ? data.full_return_time : preset?.fullReturnTime,
            beforeStartTime: isCustom ? data.before_start_time : preset?.beforeStartTime,
            hostShareTotalAmount: isCustom ? data.host_share_total_amount : preset?.hostShareTotalAmount,
            hostSharePastNights: isCustom ? data.host_share_past_nights : preset?.hostSharePastNights,
            hostShareFutureNights: isCustom
              ? data.host_share_future_nights
              : preset?.hostShareFutureNights,
            step: 13,
          })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      case 14: {
        const resp = await apiBuilder
          .setUrl(`/api/host/residences/${productId}/state`)
          .setCallMethod("PATCH")
          .setParams({ action: "submit", step: WIZARD_STEP_COUNT })
          .call();
        if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
        return { status: "success", params: { product_id: productId } };
      }

      default:
        return { status: "error", err_msg: "مرحله نامعتبر است" };
    }
  } catch (err) {
    return { status: "error", err_msg: "خطای غیرمنتظره‌ای رخ داد" };
  }
};

function finish(resp: any, productId?: number) {
  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return { status: "success", params: { product_id: resp.data?.id ?? productId } };
}

export { submitStep };
