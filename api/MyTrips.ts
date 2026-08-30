import { MyTripStates_enum } from "@/constants/enums/mytrip_states";
import { ReservesCancel_enum } from "@/constants/enums/reserves_cancel";
import apiBuilder from "./apiBuilder";
import { bucketReservations } from "./_reservationShapes";
import { TReserveStates } from "./Reserves";
import { I_Residence_display_type } from "@/interfaces/Residences";

export const getStateCorrespondingInMytrips = (state?: string, cancelledBy?: string) => {
  if (state === MyTripStates_enum.HOST_APPROVAL) {
    return {
      name: "در انتظار تأیید میزبان",
      icon: "icon-Timer",
      iconPathInDesktop: "/assets/reserve_states/hostApproval.svg",
      stateDescription: ` مهمان حداکثر 1 ساعت مهلت دارد تا با پرداخت صورتحساب رزرو خود را قطعی کند. در پایان مهلت مقرر
        رزرو بصورت خودکار لغو می شود.`,
      bgColor: "bg-warning",
      textColor: "text-warning", // used in desktop
    };
  } else if (state === MyTripStates_enum.SECOND_PAYMENT) {
    return {
      name: "در انتظار پرداخت",
      icon: "icon-Timer",
      iconPathInDesktop: "/assets/reserve_states/secondPayment.svg",
      stateDescription: `    مهمان حداکثر 1 ساعت مهلت دارد تا با پرداخت صورتحساب رزرو خود را قطعی کند. در پایان مهلت مقرر
        رزرو بصورت خودکار لغو می شود.`,
      bgColor: "bg-warning",
      textColor: "text-blue-main", // used in desktop
    };
  } else if (state === MyTripStates_enum.DONE) {
    return {
      name: "رزرو قطعی", // Once upon a time, it was "رزرو موفق" but milad said to change it to 'رزرو قطعی'
      icon: "icon-Success",
      iconPathInDesktop: "/assets/reserve_states/done.svg",
      stateDescription: `ضمن قدردانی از تلاش شما برای ثبت خاطره ای شیرین برای میهمانان ، امیدواریم تلاشهای تیم لیدوما
        در کنار شما موجب رونق صنعت گردشگری و ارتقاء سطح رفاه هموطنان عزیز شود.`,
      bgColor: "bg-success",
      textColor: "text-green-main", // used in desktop
    };
  } else if (state === MyTripStates_enum.CANCEL) {
    if (cancelledBy === ReservesCancel_enum.HOST_CANCELLED) {
      return {
        name: "لغو شده توسط میزبان",
        icon: "icon-Error",
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        stateDescription: ` توجه: رد یا منقضی شدن هر درخواست رزرو، موجب کاهش امتیاز میزبانی شما می شود. این امر به تدریج
          موجب کاهش بازدید، کاهش رزرو و کاهش درآمد شما می شود. درصورت ادامه روند فوق اقامتگاه معلق شده
          و از لیست نمایش حذف می شود.`,
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    } else if (cancelledBy === ReservesCancel_enum.GUEST_CANCELLED) {
      return {
        name: "لغو شده توسط مهمان",
        icon: "icon-Error",
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    } else if (cancelledBy === ReservesCancel_enum.LIDOMA_CANCELLED) {
      return {
        name: "لغو شده توسط لیدوما",
        icon: "icon-Error",
        iconPathInDesktop: "/assets/reserve_states/cancel.svg",
        bgColor: "bg-error-light",
        textColor: "text-error-light", // used in desktop
      };
    }
  } else if (state === MyTripStates_enum.EXPIRED) {
    return {
      name: "منقضی شده",
      icon: "icon-Error",
      iconPathInDesktop: "/assets/reserve_states/cancel.svg",
      bgColor: "bg-error-light",
      textColor: "text-error-light", // used in desktop
    }; // TODO: ?? ye hamchin chizi tu figma darim?
  }
};

export interface IMyTrip {
  days_count: number;
  cancelled_by?: ReservesCancel_enum;
  end_date: string; // ex: "2023-05-10";
  expiry_date: string; // ex: "2023-02-24 07:30:00";
  extra_guests_count: number;
  guests_count: number;
  id: number;
  product: {
    id: number;
    image_url: string; // ex: "https://cdn.lidomatrip.com/web/image/product.template/22829/image/ویلا-نظری-همای-جان.jpg";
    name: string;
    city: string;
    province: string;
    display_type: I_Residence_display_type;
  };
  reference: string;
  start_date: string; // ex: "2023-05-07";
  state: TReserveStates;
  total_amount: number;
}

const getMyTrips = async () => {
  const url = `/api/reservations/mine`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  return { status: "success", params: bucketReservations(resp?.data || []) };
};

const guestCancelsReserve = async ({ order_id, reason }: { order_id: number; reason: string }) => {
  const url = `/api/reservations/${order_id}/cancel`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setParams({ reason }).call();
};

export { getMyTrips, guestCancelsReserve };

/**
 * What the guest gets back if they cancel now.
 *
 * The site's own cancellation policy promises this: «مبلغ صورتحساب لغو بصورت
 * خودکار محاسبه می شود و در هنگام لغو رزرو برای کاربر به نمایش درمی آید». It
 * never was — the sheet asked for a reason and cancelled, and the guest found
 * out what it cost afterwards.
 */
export interface ICancelQuote {
  band: string;
  bandLabel: string;
  totalAmount: number;
  paidAmount: number;
  penalty: number;
  refund: number;
  explanation: string[];
}

const getCancelQuote = async (order_id: number): Promise<ICancelQuote | null> => {
  const res = await apiBuilder
    .setUrl(`/api/reservations/${order_id}/cancel-quote`)
    .setCallMethod("GET")
    .call();

  return res?.status === "success" ? (res.data as ICancelQuote) : null;
};

export { getCancelQuote };
