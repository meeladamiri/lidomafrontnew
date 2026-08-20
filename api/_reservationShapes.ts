// Shared helpers for reshaping the new backend's reservation objects into the old
// Odoo-backend-shaped interfaces (`IReserve`, `IReserveDetails`, `IMyTrip`) that
// `api/Reserves.ts` and `api/MyTrips.ts` already export, so every existing consumer
// component keeps working unchanged.

const STATE_MAP: Record<string, string> = {
  HOST_APPROVAL: "host_approval",
  SECOND_PAYMENT: "second_payment",
  DONE: "done",
  CANCEL: "cancel",
  EXPIRED: "expired",
};

const CANCELLED_BY_MAP: Record<string, string> = {
  HOST_CANCELLED: "cancelled_by_host",
  LIDOMA_CANCELLED: "cancelled_by_lidoma",
  GUEST_CANCELLED: "cancelled_by_guest",
};

export function mapReservationState(state: string): string {
  return STATE_MAP[state] || String(state || "").toLowerCase();
}

export function mapCancelledBy(cancelledBy: string | null | undefined): string | undefined {
  if (!cancelledBy) return undefined;
  return CANCELLED_BY_MAP[cancelledBy] || undefined;
}

export function mapDisplayType(type: string | undefined): "suit" | "boomgardi" | undefined {
  if (!type) return undefined;
  return type === "BOOMGARDI" ? "boomgardi" : "suit";
}

function dateOnly(d: any): string {
  return d ? String(d).slice(0, 10) : "";
}

/** Flat card shape shared by guest ("my trips") and host reservation list items. */
export function mapReservationCard(r: any) {
  const image = r.residence?.images?.[0]?.url || "";

  return {
    id: r.id,
    reference: r.reference,
    state: mapReservationState(r.state),
    cancelled_by: mapCancelledBy(r.cancelledBy),
    start_date: dateOnly(r.startDate),
    end_date: dateOnly(r.endDate),
    expiry_date: r.expiryDate || "",
    days_count: r.daysCount ?? 0,
    days_to_start: 0,
    guests_count: r.guestsCount ?? 0,
    extra_guests_count: r.extraGuestsCount ?? 0,
    total_amount: r.totalAmount ?? 0,
    host_share: r.hostShare ?? 0,
    customer: { name: r.guest?.name || "", phone: r.guest?.phone },
    product: {
      id: r.residence?.id,
      name: r.residence?.name || "",
      image_url: image,
      city: r.residence?.city?.name || "",
      province: r.residence?.city?.province?.name || "",
      display_type: mapDisplayType(r.residence?.type),
    },
  };
}

/** Buckets a flat reservation list into the old {current,past,all}_reserves shape
 * used by the guest-facing "my trips" list. */
export function bucketReservations(list: any[]) {
  const mapped = (list || []).map(mapReservationCard);
  const current = mapped.filter((r) => r.state === "host_approval" || r.state === "second_payment");
  const past = mapped.filter((r) => r.state === "done" || r.state === "cancel" || r.state === "expired");
  return { current_reserves: current, past_reserves: past, all_reserves: mapped };
}

/** Buckets a flat reservation list into the old {current,succeed,failed}_reserves
 * shape used by the host-facing reservations list. */
export function bucketHostReservations(list: any[]) {
  const mapped = (list || []).map(mapReservationCard);
  const current = mapped.filter((r) => r.state === "host_approval" || r.state === "second_payment");
  const succeed = mapped.filter((r) => r.state === "done");
  const failed = mapped.filter((r) => r.state === "cancel" || r.state === "expired");
  return { current_reserves: current, succeed_reserves: succeed, failed_reserves: failed };
}

/** Builds the 9-slot `TReserveCheckout` tuple. New backend only stores a final total
 * (no per-category day-by-day breakdown), so everything is folded into the first
 * "normal weekdays" slot and the rest are present-but-zero — this keeps every
 * `.find()` call downstream safe (array always has all 9 shapes) while the total
 * shown to the user still matches `total_amount` exactly. */
function buildCheckoutPrices(r: any) {
  const days = r.daysCount || 1;
  const unit = (r.totalAmount ?? 0) / days;

  return [
    { weekdays: days, unit_price: unit, total_price: r.totalAmount ?? 0 },
    { weekends: 0, unit_price: 0, total_price: 0 },
    { peaks: 0, unit_price: 0, total_price: 0 },
    { specials: 0, unit_price: 0, total_price: 0 },
    { count: 0, extras: 0, unit_price: 0, total_price: 0 },
    { host_discount: 0 },
    { website_discount: 0 },
    { coupon_discount: 0 },
    { period_discount: 0 },
  ];
}

/** Full `IReserveDetails.order_details` shape for a single reservation. */
export function mapReservationDetail(r: any) {
  const residence = r.residence || {};

  return {
    faqs: [],
    order_details: {
      paid_amount: r.paidAmount ?? 0,
      remaining_amount: r.remainingAmount ?? 0,
      total_amount: r.totalAmount ?? 0,
      alters: [],
      cancel_desc: r.cancelDesc || undefined,
      cancel_reason: r.cancelReason || undefined,
      cancelled_by: mapCancelledBy(r.cancelledBy),
      coordinated_with: undefined,
      days_count: r.daysCount ?? 0,
      end_date: dateOnly(r.endDate),
      expiry_date: r.expiryDate || "",
      guest: {
        name: r.guest?.name || "",
        phone: r.guest?.phone || undefined,
        avatar_url: r.guest?.avatarUrl || undefined,
      },
      guests_count: r.guestsCount ?? 0,
      extra_guests_count: r.extraGuestsCount ?? 0,
      host: {
        name: r.host?.name || "",
        phone: r.host?.phone || undefined,
        avatar_url: r.host?.avatarUrl || undefined,
      },
      host_share: r.hostShare ?? 0,
      id: r.id,
      prices: buildCheckoutPrices(r),
      rooms: (r.rooms || []).map((rr: any) => ({
        id: rr.room?.id,
        name: rr.room?.name || "",
        image_url: rr.room?.image || "",
      })),
      product: {
        display_type: mapDisplayType(residence.type),
        cancel_rule: "",
        beds_count: undefined,
        rooms_count: undefined,
        capacity: residence.capacity ?? 0,
        max_capacity: residence.maxCapacity ?? 0,
        before_start_time: residence.beforeStartTime ?? 0,
        full_return_time: residence.fullReturnTime ?? 0,
        host_share_future_nights: residence.hostShareFutureNights ?? 0,
        host_share_past_nights: residence.hostSharePastNights ?? 0,
        host_share_total_amount: residence.hostShareTotalAmount ?? 0,
        address: residence.address || "",
        average_rating: residence.averageRating ?? 0,
        city: residence.city?.name || "",
        city_id: undefined,
        city_title: residence.city?.titleEn || residence.city?.name || "",
        id: residence.id,
        image_url: residence.images?.[0]?.url || "",
        latitude: residence.latitude != null ? String(residence.latitude) : "",
        longitude: residence.longitude != null ? String(residence.longitude) : "",
        name: residence.name || "",
        neighborhood: residence.neighborhood || "",
        province: residence.city?.province?.name || "",
        province_id: undefined,
        province_title: residence.city?.province?.name || "",
        reviews_count: residence.reviewsCount ?? 0,
        min_reservable_days: residence.minReservableDays ?? 1,
        checkin_from: residence.checkinFrom || undefined,
        checkin_to: residence.checkinTo || undefined,
        checkout: residence.checkout || undefined,
        rules: (residence.rules || []).map((rr: any) => ({
          category: rr.rule?.category || "",
          id: rr.rule?.id,
          name: rr.rule?.name || "",
          value: typeof rr.value === "string" ? rr.value : rr.value ? "بله" : "خیر",
        })),
      },
      reference: r.reference,
      start_date: dateOnly(r.startDate),
      state: mapReservationState(r.state),
      voucher_url: undefined,
      temp_state: undefined,
      website_share: r.websiteShare ?? 0,
    },
  };
}
