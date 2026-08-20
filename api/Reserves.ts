//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";

import {
  LIDOMA_CANCELLED_IN_COORDINATION_WITH,
  ReservesCancel_enum,
} from "constants/enums/reserves_cancel";
import { ReserveDetailsCheckout_enum } from "constants/enums/reserve_details_checkout";
import apiBuilder from "./apiBuilder";
import { RejectReasons_enum } from "constants/enums/reject_reasons";
import { ReserveStates_enum } from "constants/enums/reserve_states";
import { CancelReasons_enum } from "constants/enums/cancel_reasons";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { bucketHostReservations, mapReservationDetail } from "./_reservationShapes";
import { jalaliToIso } from "@/utilities/jalaliGregorian";

export const getStateCorresponding = (state?: string, cancelledBy?: string) => {
  if (state === ReserveStates_enum.HOST_APPROVAL) {
    return {
      name: "در انتظار تأیید میزبان",
      icon: "icon-Timer",
      iconPathInDesktop: "/assets/reserve_states/hostApproval.svg",
      stateDescription_ForHost: ``,
      stateDescription_ForGuest: (city?: string) =>
        `درخواست رزرو شما به میزبان ارسال شده و منتظر تأیید میزبان می باشد. پس از تأیید میزبان می توانید با پرداخت صورتحساب ، رزرو خود را نهایی کنید `,
      bgColor: "bg-warning",
      textColor: "text-warning", // used in desktop
    };
  } else if (state === ReserveStates_enum.SECOND_PAYMENT) {
    return {
      name: "در انتظار پرداخت",
      icon: "icon-Timer",
      iconPathInDesktop: "/assets/reserve_states/secondPayment.svg",
      stateDescription_ForHost: `    مهمان حداکثر 1 ساعت مهلت دارد تا با پرداخت صورتحساب رزرو خود را قطعی کند. در پایان مهلت مقرر
      رزرو بصورت خودکار لغو می شود.`,
      stateDescription_ForGuest: (city?: string) =>
        `درخواست شما توسط میزبان تأیید شد. هم اکنون شما می توانید با پرداخت صورتحساب رزرو خود را قطعی کنید`,
      bgColor: "bg-warning",
      textColor: "text-blue-main", // used in desktop
    };
  } else if (state === ReserveStates_enum.DONE) {
    return {
      name: "رزرو قطعی", // Once upon a time, it was "رزرو موفق" but milad said to change it to 'رزرو قطعی'
      icon: "icon-Success",
      iconPathInDesktop: "/assets/reserve_states/done.svg",
      stateDescription_ForHost: `ضمن قدردانی از تلاش شما برای ثبت خاطره ای شیرین برای میهمانان ، امیدواریم تلاشهای تیم لیدوما
      در کنار شما موجب رونق صنعت گردشگری و ارتقاء سطح رفاه هموطنان عزیز شود.`,
      stateDescription_ForGuest: (city?: string) =>
        `مهمان گرامی، درخواست رزرو شما قطعی شد. شما می توانید با انتخاب گزینه دانلود فاکتور، اطلاعات کامل رزرو را مشاهده کنید.`,
      bgColor: "bg-success",
      textColor: "text-green-main", // used in desktop
    };
  } else if (state === ReserveStates_enum.CANCEL) {
    if (cancelledBy === ReservesCancel_enum.HOST_CANCELLED) {
      return {
        name: "لغو شده توسط میزبان",
        icon: "icon-Error",
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        stateDescription_ForHost: ` توجه: رد یا منقضی شدن هر درخواست رزرو، موجب کاهش امتیاز میزبانی شما می شود. این امر به تدریج
        موجب کاهش بازدید، کاهش رزرو و کاهش درآمد شما می شود. درصورت ادامه روند فوق اقامتگاه معلق شده
        و از لیست نمایش حذف می شود.`,
        stateDescription_ForGuest: (city?: string) =>
          `درخواست رزرو شما توسط میزبان رد شد. پشتیبانان لیدوماتریپ چند اقامتگاه مشابه دیگر، متناسب با درخواست شما جهت جایگزینی ارسال کرده اند.`,
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    } else if (cancelledBy === ReservesCancel_enum.GUEST_CANCELLED) {
      return {
        name: "لغو شده توسط مهمان",
        icon: "icon-Error",
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        stateDescription_ForHost: ``,
        stateDescription_ForGuest: (city?: string) =>
          `درخواست رزرو توسط شما رد شد. شما میتوانید به صفحه اقامتگاه های ${city} بروید و اقامتگاه دیگری را انتخاب کنید`,
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    } else if (cancelledBy === ReservesCancel_enum.LIDOMA_CANCELLED) {
      return {
        name: "لغو شده توسط لیدوما",
        icon: "icon-Error",
        stateDescription_ForHost: ``,
        stateDescription_ForGuest: (city?: string) =>
          `درخواست رزرو شما توسط لیدوما رد شد. شما می توانید با مراجعه به صفحه اقامتگاه های ${city}، اقامتگاه دیگری را انتخاب کنید.`,
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    }
  } else if (state === ReserveStates_enum.EXPIRED) {
    return {
      name: "منقضی شده",
      icon: "icon-Error",
      stateDescription_ForHost: ``,
      stateDescription_ForGuest: (city?: string) =>
        `درخواست رزرو شما منقضی شد. شما می توانید با مراجعه به صفحه اقامتگاه های ${city}، اقامتگاه دیگری را انتخاب کنید.`,
      iconPathInDesktop: "/assets/reserve_states/cancel.svg",
      bgColor: "bg-error-light",
      textColor: "text-error-light", // used in desktop
    };
  }
};

export type TReserveStates =
  | (ReserveStates_enum.CANCEL | ReserveStates_enum.EXPIRED) // for falied reserves
  | ReserveStates_enum.HOST_APPROVAL
  | ReserveStates_enum.SECOND_PAYMENT
  | ReserveStates_enum.DONE;

export interface IReserve {
  customer: {
    phone?: string;
    name: string;
  };
  days_count: number;
  days_to_start: number;
  end_date: string; // ex: "2021-12-23"
  expiry_date: string; // ex: "2022-11-12 08:39:45"
  guests_count: number;
  extra_guests_count: number;
  host_share: number;
  id: number;
  product: {
    id: number;
    name: string;
    image_url: string;
    province: string;
    city: string;
    display_type: I_Residence_display_type;
  };
  reference: string;
  start_date: string; // ex: "2021-12-23"
  state: TReserveStates;
  cancelled_by?: reserve_cancel_values; // will exist only in failed reserves
}

export type reserve_cancel_values =
  | ReservesCancel_enum.HOST_CANCELLED
  | ReservesCancel_enum.LIDOMA_CANCELLED
  | ReservesCancel_enum.GUEST_CANCELLED;

// Host-facing reservations list (`/reservations` dashboard route).
const getReserves = async () => {
  const url = `/api/host/reservations`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  return { status: "success", params: bucketHostReservations(resp?.data || []) };
};

export interface IReserveDetailsFAQ {
  answer: string;
  id: number;
  question: string;
}

type TReserveCheckout = [
  {
    total_price?: number;
    unit_price?: number;
    [ReserveDetailsCheckout_enum.NORMAL_WEEKDAYS]?: number;
  },
  { total_price?: number; unit_price?: number; [ReserveDetailsCheckout_enum.WEEK_ENDS]?: number },
  {
    [ReserveDetailsCheckout_enum.PEAK_DAYS]?: number;
    total_price?: number;
    unit_price?: number;
  },
  {
    [ReserveDetailsCheckout_enum.SPECIAL_DAYS]?: number;
    total_price?: number;
    unit_price?: number;
  },
  {
    count?: number;
    [ReserveDetailsCheckout_enum.EXTRA_GUESTS]?: number;
    total_price?: number;
    unit_price?: number;
  },
  {
    [ReserveDetailsCheckout_enum.HOST_DISCOUNT]?: number;
  },
  {
    [ReserveDetailsCheckout_enum.WEBSITE_DISCOUNT]?: number;
  },
  {
    [ReserveDetailsCheckout_enum.COUPON_DISCOUNT]?: number;
  },
  {
    [ReserveDetailsCheckout_enum.RESERVE_PERIOD_DISCOUNT]?: number;
  }
];

export interface IAlterResidences {
  id: number;
  image_url: string;
  name: string;
  price: number;
  reference: string;
}

export interface IReserveDetails {
  faqs: IReserveDetailsFAQ[];
  order_details: {
    paid_amount?: number;
    remaining_amount?: number;
    total_amount: number;
    alters?: IAlterResidences[];
    cancel_desc: // property will 'exist' only in failed reserves;
    | RejectReasons_enum // if Typical options in reject bottom sheet was selected
      | string; // for 'other' reasons
    cancel_reason?: // property will 'exist' only in failed reserves;
    | CancelReasons_enum // if Typical options in cancel bottom sheet was selected
      | string; // for 'other' reasons
    cancelled_by?: reserve_cancel_values; // property will 'exist' only in failed reserves;
    coordinated_with?: LIDOMA_CANCELLED_IN_COORDINATION_WITH; // will exist only when cancelled_by == "cancelled_by_lidoma"
    days_count: number;
    end_date: string; // ex: "2022-12-04"
    expiry_date: string; // ex: "2022-11-12 08:39:45"
    guest: {
      name: string;
      phone?: string;
      avatar_url?: string;
    };
    guests_count: number;
    extra_guests_count: number;
    host: {
      name: string;
      phone?: string;
      avatar_url?: string;
    };
    host_share: number;
    id: number;
    prices: TReserveCheckout;
    rooms: {
      id: number;
      image_url: string; // ex: "https://test.lidomatrip.com/web/image/x_room/35062/x_image";
      name: string;
    }[];
    product: {
      display_type: I_Residence_display_type;
      cancel_rule: string;
      beds_count?: number;
      rooms_count?: number;
      capacity: number;
      max_capacity: number;
      before_start_time: number;
      full_return_time: number;
      host_share_future_nights: number;
      host_share_past_nights: number;
      host_share_total_amount: number;
      address: string;
      average_rating: number;
      city: string;
      city_id: number;
      city_title: string;
      id: number;
      image_url: string; // ex: "https://cdn.lidomatrip.com/web/image/product.template/22829/image/ویلا-نظری-همای-جان.jpg";
      latitude: string;
      longitude: string;
      name: string;
      neighborhood: string;
      province: string;
      province_id: number;
      province_title: string;
      reviews_count: number;
      min_reservable_days: number;
      checkin_from?: string;
      checkin_to?: string;
      checkout?: string;
      rules: {
        category: string;
        id: number;
        name: string;
        value: string;
      }[];
    };
    reference: string;
    start_date: string;
    state: TReserveStates;
    voucher_url?: string; // is included when state == "done"
    temp_state?: ReserveStates_enum.HOST_APPROVAL | ReserveStates_enum.SECOND_PAYMENT; // will exist in failed reserves
    website_share: number;
    // vat_amount: number
  };
}

const getReserve = async (reserveId: number) => {
  const url = `/api/reservations/${reserveId}`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  return { status: "success", params: mapReservationDetail(resp?.data || {}) };
};

function acceptTheReserve({ reserveId }: { reserveId: number }) {
  const url = `/api/host/reservations/${reserveId}/accept`;

  return apiBuilder.setUrl(url).setCallMethod("POST").call();
}

// Old flow was two calls (reject, then a separate reason submission). New backend
// takes the reason in the same call — `rejectTheReserve` now just remembers the id
// and `submitRejectReserveReason` (called right after by every consumer) does the work.
function rejectTheReserve({ reserveId }: { reserveId: number }): Promise<any> {
  return Promise.resolve({ status: "success", params: { reserveId } });
}

export const rejectReasons: {
  key: RejectReasons_enum;
  text: string;
  order: number;
}[] = [
  {
    key: RejectReasons_enum.NO_VACANCY,
    text: "اقامتگاه در تاریخ درخواست شده پر می باشد",
    order: 1,
  },
  {
    key: RejectReasons_enum.PRICE_CHANGED,
    text: "مبلغ رزرو اقامتگاه تغییر کرده است",
    order: 2,
  },
  {
    key: RejectReasons_enum.NOT_READY,
    text: "اقامتگاه آماده تحویل نیست",
    order: 3,
  },
  {
    key: RejectReasons_enum.OTHER,
    text: "سایر موارد",
    order: 4,
  },
];

function submitRejectReserveReason({
  reserveId,
  reason,
  desc,
}: {
  reserveId: number;
  reason: RejectReasons_enum;
  desc?: string;
}) {
  const url = `/api/host/reservations/${reserveId}/reject`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setParams({ reason, desc }).call();
}

export const cancelReasons: {
  key: CancelReasons_enum;
  text: string;
  order: number;
}[] = [
  {
    key: CancelReasons_enum.GUEST_DELAY,
    text: "مسافر دیر پرداخت کرد",
    order: 1,
  },
  {
    key: CancelReasons_enum.NOT_READY,
    text: "مشکلی برای اقامتگاه پیش آمده",
    order: 2,
  },
  {
    key: CancelReasons_enum.ALREADY_RESERVED,
    text: "اقامتگاه از راه دیگری رزرو قطعی شده است",
    order: 3,
  },
  {
    key: CancelReasons_enum.OTHER,
    text: "سایر موارد",
    order: 4,
  },
];

function cancelReserve({
  reserveId,
  reason,
  desc,
}: {
  reserveId: number;
  reason: CancelReasons_enum;
  desc?: string;
}) {
  const url = `/api/host/reservations/${reserveId}/cancel`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setParams({ reason, desc }).call();
}

export interface IAlternativeResidence {
  id: number;
  image_url: string;
  name: string;
  price: number;
  reference: string;
}

// No backend equivalent yet (host "suggest alternative residences" flow) — resolve
// gracefully instead of hitting a dead endpoint.
function getAlternativeResidencesList({ reserveId }: { reserveId: number }): Promise<any> {
  return Promise.resolve({ status: "success", params: { alters: [], residences_list: [] } });
}

function sendAlternativeResidencesList({
  reserveId,
  residencesIDs,
}: {
  reserveId: number;
  residencesIDs: number[];
}): Promise<any> {
  return Promise.resolve({
    status: "error",
    err_msg: "این قابلیت هنوز پیاده‌سازی نشده است",
  });
}

function submitNewReserve({
  product_id,
  product_type,
  start_date,
  end_date,
  guests_count,
  guest,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
  start_date: string; // ex: 1401/11/19
  end_date: string; // ex: 1401/11/21
  guests_count: number;
  guest?: string;
}): Promise<any> {
  if (product_type === ResidenceTypes_enum.ROOM) {
    // Boomgardi room booking passes a room id with no residence id alongside it, but
    // the new backend needs `residenceId` — this path needs a frontend change (thread
    // the residence id through the booking widget) that's out of scope for now.
    return Promise.resolve({
      status: "error",
      err_msg: "رزرو اتاق بوم‌گردی هنوز پشتیبانی نمی‌شود",
    });
  }

  const url = `/api/reservations`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setParams({
      residenceId: product_id,
      startDate: jalaliToIso(start_date),
      endDate: jalaliToIso(end_date),
      guestsCount: guests_count,
      guestNameOverride: guest || undefined,
    })
    .call()
    .then((resp) => {
      if (resp?.status !== "success") return resp;
      return { status: "success", params: { order_id: resp?.data?.id } };
    });
}

// No backend equivalent (amend an existing reservation) — resolve gracefully.
function submitEditReserve({
  order_id,
  start_date,
  end_date,
  guests_count,
  guest,
}: {
  order_id: number;
  start_date: string; // ex: 1401/11/19
  end_date: string; // ex: 1401/11/21
  guests_count: number;
  guest?: string;
}): Promise<any> {
  return Promise.resolve({
    status: "error",
    err_msg: "ویرایش رزرو هنوز پشتیبانی نمی‌شود",
  });
}

// Vouchers/coupons are phase-2 — no backend endpoint yet.
function submitDiscountCode({
  order_id,
  voucher_code,
}: {
  order_id: number;
  voucher_code: string;
}): Promise<any> {
  return Promise.resolve({
    status: "error",
    err_msg: "کد تخفیف هنوز پشتیبانی نمی‌شود",
  });
}

function unDiscountTheCodeDiscount({ order_id }: { order_id: number }): Promise<any> {
  return Promise.resolve({ status: "success" });
}

export {
  getReserves,
  getReserve,
  acceptTheReserve,
  rejectTheReserve,
  submitRejectReserveReason,
  cancelReserve,
  getAlternativeResidencesList,
  sendAlternativeResidencesList,
  submitNewReserve,
  submitDiscountCode,
  unDiscountTheCodeDiscount,
  submitEditReserve,
};
