import { MyTripStates_enum } from "@/constants/enums/mytrip_states";
import { ReservesCancel_enum } from "@/constants/enums/reserves_cancel";
import apiBuilder from "./apiBuilder";
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
  const url = `/api/users/panel/trips_list`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const guestCancelsReserve = async ({ order_id, reason }: { order_id: number; reason: string }) => {
  const url = `/api/guest/cancel_order`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      order_id,
      reason,
    })
    .call();
};

export { getMyTrips, guestCancelsReserve };
