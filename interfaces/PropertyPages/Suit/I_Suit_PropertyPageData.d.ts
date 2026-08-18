import { Moment } from "moment-jalaali";
import { Dispatch, SetStateAction } from "react";
import { I_CheckoutData } from "../Boomgardi/CheckoutData";
import { IGuestInfo } from "../Boomgardi";
import { IDiscountedDaysStatistics } from "../Boomgardi/IDiscountedDaysStatistics";
import { IDiscountAmounts } from "../Boomgardi/IDiscountAmounts";

export interface I_Suit_PropertyPageData {
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
  submitReserve: () => void;
  showTripleCalendar: boolean;
  setShowTripleCalendar: Dispatch<SetStateAction<boolean>>;
  discountedDaysStatistics: IDiscountedDaysStatistics;
  discountAmounts: IDiscountAmounts;
}
