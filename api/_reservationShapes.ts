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
    // The guest's own bill, not the rent alone — see `guestPayable`.
    total_amount: guestPayable(r),
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

/**
 * What the guest actually owes: the rent plus the fee added on top for them.
 *
 * `r.totalAmount` alone is the rent — the same number the host's share is a
 * percentage of. `r.guestCommission` is a separate, independent charge (see
 * `computeBreakdown` on the backend: the host's share never reads it and it
 * never reads the host's share). A guest shown only the rent would be quoted
 * a bill smaller than the one the admin panel and the payment ledger agree
 * on, by exactly the fee — invisible while `guestCommissionPercent` is 0,
 * which is the only reason it went unnoticed.
 */
function guestPayable(r: any): number {
  return (r.totalAmount ?? 0) + (r.guestCommission ?? 0);
}

/** Builds the 9-slot `TReserveCheckout` tuple from the reservation's stored
 * `priceBreakdown` snapshot (see `pricing.ts:summarizeBreakdown` on the
 * backend) — the same weekday/weekend/peak/special/extra-guest categories the
 * admin panel shows, priced as they were at booking/reprice time.
 *
 * Older reservations have no snapshot (the column postdates them); those fall
 * back to one folded "normal weekdays" line covering the whole rent, same as
 * before this existed, rather than guessing at history from today's rates. */
function buildCheckoutPrices(r: any) {
  const b = r.priceBreakdown;

  if (!b) {
    const days = r.daysCount || 1;
    const rent = r.totalAmount ?? 0;
    const unit = rent / days;

    return [
      { weekdays: days, unit_price: unit, total_price: rent },
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

  return [
    {
      weekdays: b.weekdayNights || 0,
      unit_price: b.weekdayNights ? b.weekdayTotal / b.weekdayNights : 0,
      total_price: b.weekdayTotal || 0,
    },
    {
      weekends: b.weekendNights || 0,
      unit_price: b.weekendNights ? b.weekendTotal / b.weekendNights : 0,
      total_price: b.weekendTotal || 0,
    },
    {
      peaks: b.peakNights || 0,
      unit_price: b.peakNights ? b.peakTotal / b.peakNights : 0,
      total_price: b.peakTotal || 0,
    },
    {
      specials: b.specialNights || 0,
      unit_price: b.specialNights ? b.specialTotal / b.specialNights : 0,
      total_price: b.specialTotal || 0,
    },
    {
      count: b.extraGuests || 0,
      extras: b.extraGuests ? r.daysCount || 0 : 0,
      unit_price: b.extraGuests && r.daysCount ? b.extraGuestsTotal / b.extraGuests / r.daysCount : 0,
      total_price: b.extraGuestsTotal || 0,
    },
    { host_discount: 0 },
    { website_discount: 0 },
    { coupon_discount: 0 },
    // The only discount this backend computes today is the weekly/monthly
    // length discount — it belongs under "reserve period", not a coupon.
    { period_discount: b.discountAmount || 0 },
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
      // The guest's own bill, not the rent alone — see `guestPayable`. Both
      // `remaining_amount` and `paid_amount` already come straight off
      // `Reservation.remainingAmount`/`paidAmount`, and those two columns are
      // kept accurate against this exact sum by `payments.service.ts`'s
      // `recompute()` — this just needs to agree with them, not recompute.
      total_amount: guestPayable(r),
      // Broken out so a screen that wants to *say* "شامل X تومان کارمزد" can,
      // without re-deriving it from the difference of two other numbers.
      guest_commission: r.guestCommission ?? 0,
      alters: [],
      cancel_desc: r.cancelDesc || undefined,
      cancel_reason: r.cancelReason || undefined,
      cancelled_by: mapCancelledBy(r.cancelledBy),
      coordinated_with: undefined,
      days_count: r.daysCount ?? 0,
      end_date: dateOnly(r.endDate),
      expiry_date: r.expiryDate || "",
      // Whether this stay has already been reviewed. The button needs to know
      // so it can offer "مشاهده نظر" instead of inviting a second one — a
      // review is written once and is not editable afterwards.
      has_review: !!r.review,
      review_id: r.review?.id ?? null,
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
