import { Moment } from "moment-jalaali";
import { I_CheckoutData } from "./CheckoutData";
import { Dispatch, SetStateAction } from "react";
import { IAvailableRoom } from "@/api/Boomgardi";
import { IGuestInfo } from ".";
import { IDiscountedDaysStatistics } from "./IDiscountedDaysStatistics";
import { IDiscountAmounts } from "./IDiscountAmounts";

export interface I_Boomgardi_PropertyPageData {
  selectedRanges: [Moment, Moment | null][];
  setSelectedRanges: Dispatch<SetStateAction<[Moment, Moment | null][]>>;
  numberOfPeople: number;
  setNumberOfPeople: Dispatch<SetStateAction<number>>;
  showDoubleCalendar: boolean;
  setShowDoubleCalendar: Dispatch<SetStateAction<boolean>>;
  dateToWorkWith: Moment;
  setDateToWorkWith: Dispatch<SetStateAction<Moment>>;
  guestInfo: IGuestInfo;
  setGuestInfo: Dispatch<SetStateAction<IGuestInfo>>;
  checkoutData: I_CheckoutData | undefined;
  setCheckoutData: Dispatch<SetStateAction<I_CheckoutData | undefined>>;
  checkoutTotal: number;
  setCheckoutTotal: Dispatch<SetStateAction<number>>;
  weeklyDiscountAmount: number;
  setWeeklyDiscountAmount: Dispatch<SetStateAction<number>>;
  monthlyDiscountAmount: number;
  setMonthlyDiscountAmount: Dispatch<SetStateAction<number>>;
  selectedRoomByUser: IAvailableRoom | undefined;
  setSelectedRoomByUser: Dispatch<SetStateAction<IAvailableRoom | undefined>>;
  submitReserve: () => void;
  showTripleCalendar: boolean;
  setShowTripleCalendar: Dispatch<SetStateAction<boolean>>;
  discountedDaysStatistics: IDiscountedDaysStatistics;
  discountAmounts: IDiscountAmounts;
}
