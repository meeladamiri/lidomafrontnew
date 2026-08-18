import { IAvailableRoom } from "@/api/Boomgardi";
import { IServerCalendarData } from "@/api/Calendar/Calendar";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { I_Boomgardi_PropertyPageData } from "@/interfaces/PropertyPages/Boomgardi/Boomgardi_PropertyPageData";
import { I_CheckoutData } from "@/interfaces/PropertyPages/Boomgardi/CheckoutData";
import { getManuallyCalculatedCheckoutData } from "@/utilities/getManuallyCalculatedCheckoutData";
import { useGetCalendarData } from "Hooks/ObserveResidence/useGetCalendarData";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import moment, { Moment } from "moment-jalaali";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { UserType_enum, useUserProfile } from "./Profile";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useRouter } from "next/router";
import { IGuestInfo } from "@/interfaces/PropertyPages/Boomgardi";
import { useMutation } from "@tanstack/react-query";
import { submitNewReserve } from "@/api/Reserves";
import { IDiscountedDaysStatistics } from "@/interfaces/PropertyPages/Boomgardi/IDiscountedDaysStatistics";
import { IDiscountAmounts } from "@/interfaces/PropertyPages/Boomgardi/IDiscountAmounts";

const discountedDaysStatistics_InitV = {
  n_of_discounted_special_days: 0,
  n_of_discounted_peak_days: 0,
  n_of_discounted_weekends: 0,
  n_of_discounted_normaldays: 0,
};
const discountAmounts_InitV = {
  special_days_total_discount_amount: 0,
  peak_days_total_discount_amount: 0,
  weekends_total_discount_amount: 0,
  normaldays_total_discount_amount: 0,
};

export const BoomgardiPropertyPageDataContext = createContext<I_Boomgardi_PropertyPageData>({
  numberOfPeople: 0,
  selectedRanges: [],
  setNumberOfPeople: () => {},
  setSelectedRanges: () => {},
  dateToWorkWith: moment(new Date()),
  showDoubleCalendar: false,
  setShowDoubleCalendar: () => {},
  setDateToWorkWith: () => {},
  checkoutData: undefined,
  setCheckoutData: () => {},
  checkoutTotal: 0,
  setCheckoutTotal: () => {},
  weeklyDiscountAmount: 0,
  setWeeklyDiscountAmount: () => {},
  monthlyDiscountAmount: 0,
  setMonthlyDiscountAmount: () => {},
  guestInfo: {
    name: "",
    phone: "",
  },
  setGuestInfo: () => {},
  submitReserve: () => {},
  // start of boomgardi-specific
  selectedRoomByUser: undefined,
  setSelectedRoomByUser: () => {},
  showTripleCalendar: false,
  setShowTripleCalendar: () => {},
  // end of boomgardi-specific
  discountedDaysStatistics: discountedDaysStatistics_InitV,
  discountAmounts: discountAmounts_InitV,
});

function BoomgardiPropertyPageDataProvider({ children }: { children: ReactNode }) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  const [dateToWorkWith, setDateToWorkWith] = useState<Moment>(moment(new Date()));
  const [showDoubleCalendar, setShowDoubleCalendar] = useState<boolean>(false);
  const [selectedRanges, setSelectedRanges] = useState<
    [
      Moment, // start day of range
      Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [checkoutData, setCheckoutData] = useState<I_CheckoutData>();
  const [checkoutTotal, setCheckoutTotal] = useState<number>(0);
  const [weeklyDiscountAmount, setWeeklyDiscountAmount] = useState<number>(0);
  const [monthlyDiscountAmount, setMonthlyDiscountAmount] = useState<number>(0);
  const [guestInfo, setGuestInfo] = useState<IGuestInfo>({
    name: "",
    phone: "",
  });
  const [discountedDaysStatistics, setDiscountedDaysStatistics] =
    useState<IDiscountedDaysStatistics>(discountedDaysStatistics_InitV);
  const [discountAmounts, setDiscountAmounts] = useState<IDiscountAmounts>(discountAmounts_InitV);
  // start of boomgardi-specific
  const [selectedRoomByUser, setSelectedRoomByUser] = useState<IAvailableRoom>();
  const [showTripleCalendar, setShowTripleCalendar] = useState<boolean>(false);
  // end of boomgardi-specific

  const { refetch: refetchCalendarData, data: calendarData } = useGetCalendarData({
    residenceOrRoomId: selectedRoomByUser?.id,
    residenceType: ResidenceTypes_enum.ROOM, // bcz we are in boomgardi
  });

  const { data: observeResidenceData } = useGetObserveResidence();
  useEffect(() => {
    if (
      selectedRanges.length === 1 &&
      !!selectedRanges[0][1] &&
      !!calendarData &&
      calendarData?.status === "success" &&
      !!calendarData?.params &&
      // numberOfPeople !== 0 &&
      !!observeResidenceData
    ) {
      const serverCalendarData: IServerCalendarData = calendarData?.params;

      const {
        checkoutPaperData,
        finalCalculatedCheckoutTotal,
        monthlyDiscountAmount,
        weeklyDiscountAmount,
        //
        special_days_total_discount_amount,
        peak_days_total_discount_amount,
        weekends_total_discount_amount,
        normaldays_total_discount_amount,
        //
        n_of_discounted_special_days,
        n_of_discounted_peak_days,
        n_of_discounted_weekends,
        n_of_discounted_normaldays,
        //
      } = getManuallyCalculatedCheckoutData({
        serverCalendarData: serverCalendarData,
        theRangeSelected: selectedRanges[0],
        numberOfPeople,
        baseCapacity: selectedRoomByUser?.capacity || 0,
        extraGuestUnitPrice: serverCalendarData.prices.extra_guests_price || 0,
        discountedDays: serverCalendarData.discounted_days.map((discounted_day) => ({
          date: moment(discounted_day.date, "YYYY-MM-DD"),
          amount: discounted_day.amount,
        })),
      });

      setCheckoutData(checkoutPaperData);
      setWeeklyDiscountAmount(weeklyDiscountAmount);
      setMonthlyDiscountAmount(monthlyDiscountAmount);
      setCheckoutTotal(finalCalculatedCheckoutTotal);
      setDiscountAmounts({
        special_days_total_discount_amount,
        peak_days_total_discount_amount,
        weekends_total_discount_amount,
        normaldays_total_discount_amount,
      });
      setDiscountedDaysStatistics({
        n_of_discounted_special_days,
        n_of_discounted_peak_days,
        n_of_discounted_weekends,
        n_of_discounted_normaldays,
      });
    }
  }, [selectedRanges, calendarData, numberOfPeople, observeResidenceData, selectedRoomByUser]);

  const profileData = useUserProfile();
  useEffect(() => {
    if (!!profileData.phone || !!profileData.name) {
      setGuestInfo({ name: profileData.name, phone: profileData.phone });
    }
  }, [profileData.phone, profileData.name]);

  const submitReserveMutation = useMutation(
    () => {
      return submitNewReserve({
        product_id: selectedRoomByUser?.id as number,
        product_type: ResidenceTypes_enum.ROOM,
        start_date: selectedRanges[0][0].format("jYYYY/jMM/jDD"),
        end_date: (selectedRanges[0][1] as moment.Moment).format("jYYYY/jMM/jDD"),
        guests_count: numberOfPeople,
        guest: guestInfo.name,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "error") {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت ثبت شد." },
          ]);

          setSelectedRanges([]);
          setNumberOfPeople(0);

          // When reserve is submitted in a mobile device.
          // setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV);

          refetchCalendarData();

          router.push(`/my-trips/${data?.params?.order_id}`);
        }
      },
    }
  );

  function submitReserve() {
    if (profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC) {
      // first log the user in
      if (isDesktop) {
        profileData.authModalsUtils.setShowEnterPhoneNumberModal(true);
      } else {
        // setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV);
        router.push("/auth/enter_phone");
        exception.message([
          { type: EXCEPTIONTYPES.INFO, title: "لطفا جهت تکمیل فرآیند رزرو، وارد سیستم شوید." },
        ]);
      }

      // lets save 'order details' to local storage
      localStorage.setItem(
        "Pending_Reserve_Details",
        JSON.stringify({
          product_id: selectedRoomByUser?.id as number,
          product_type: ResidenceTypes_enum.ROOM,
          start_date: selectedRanges[0][0].format("jYYYY/jMM/jDD"),
          end_date: (selectedRanges[0][1] as moment.Moment).format("jYYYY/jMM/jDD"),
          guests_count: numberOfPeople,
          guest: guestInfo.name,
          product_page_url: router?.asPath,
        })
      );

      return;
    }

    submitReserveMutation.mutate();
  }

  useEffect(() => {
    setSelectedRoomByUser(undefined);
  }, [selectedRanges]);

  useEffect(() => {
    setNumberOfPeople(0);
  }, [selectedRoomByUser]);

  return (
    <BoomgardiPropertyPageDataContext.Provider
      value={{
        numberOfPeople,
        setNumberOfPeople,
        selectedRanges,
        setSelectedRanges,
        showDoubleCalendar,
        setShowDoubleCalendar,
        dateToWorkWith,
        setDateToWorkWith,
        checkoutData,
        setCheckoutData,
        checkoutTotal,
        setCheckoutTotal,
        weeklyDiscountAmount,
        setWeeklyDiscountAmount,
        monthlyDiscountAmount,
        setMonthlyDiscountAmount,
        selectedRoomByUser,
        setSelectedRoomByUser,
        guestInfo,
        setGuestInfo,
        submitReserve,
        showTripleCalendar,
        setShowTripleCalendar,
        discountedDaysStatistics,
        discountAmounts,
      }}
    >
      {children}
    </BoomgardiPropertyPageDataContext.Provider>
  );
}

export function useBoomgardiPropertyPageData() {
  const context = useContext(BoomgardiPropertyPageDataContext);

  return { ...context };
}

export default BoomgardiPropertyPageDataProvider;
