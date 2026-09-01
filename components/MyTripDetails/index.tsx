import Checkout, { WithFullname, WithKeyValue } from "components/General/Checkout";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import Divider from "components/General/Divider";
import PageTitle from "components/General/PageTitle";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cancelReasons,
  getReserve,
  getStateCorresponding,
  IReserveDetails,
  IReserveDetailsFAQ,
  rejectReasons,
  submitEditReserve,
  unDiscountTheCodeDiscount,
} from "api/Reserves";
import { useRouter } from "next/router";
import { canShowContact, CONTACT_WINDOW_NOTE } from "@/utilities/tripWindow";
import { ReserveDetailsCheckout_enum } from "constants/enums/reserve_details_checkout";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import moment from "moment-jalaali";
import { miladiToJalali } from "utilities/dateTools";
import { ReserveStates_enum } from "constants/enums/reserve_states";
import Image from "next/image";
import GoToFlash from "@/components/General/GoToFlash";
import dynamic from "next/dynamic";
import { getTimeDiff } from "@/utilities/Time";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import Timeline from "../Reservations/Timeline";
import DownloadFactor from "../Reservations/DownloadFactor";
import FAQs from "../Reservations/FAQs";
import CancelReserveAfterBeingFinalizedBottomSheet from "../Reservations/CancelReserveAfterBeingFinalizedBottomSheet";
import GuestWantsToCancelBottomSheet from "../Reservations/GuestWantsToCancelBottomSheet";
import ApplyDiscountBottomSheet from "../Reservations/ApplyDiscountBottomSheet";
import ResidenceCancelReserveRulesModal from "../ObserveResidenceDetails/ResCompleteInfo/ResCancelRules/ResidenceCancelReserveRulesModal";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import { getPaymentToken } from "@/api/Payment";
import ChooseEnterAndExitDaysCalendarModal from "../ObserveResidenceDetails/ChooseEnterAndExitDaysCalendarModal";
import { getCalendarData } from "@/api/Calendar/Calendar";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import ConfirmGuestInfoForReserveBottomSheet from "../ObserveResidenceDetails/ConfirmGuestInfoForReserveBottomSheet";
import EditReserveDetailsBottomSheet from "../ObserveResidenceDetails/EditReserveDetailsBottomSheet";
import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";
import ResRate from "../General/ResRate";
const ProjectMap = dynamic(() => import("components/Map"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/layouts/Footer"), {
  ssr: true,
});

function CreateInfo({ icon, title, desc }: { icon: JSX.Element; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-x-12">
      <div className="flex items-center">{icon}</div>

      <div>
        <p className="text-12 leading-16 font-l text-gray-959FA7 mb-12">{title}</p>
        <p className="text-16 leading-24 font-r text-black">{desc}</p>
      </div>
    </div>
  );
}

const confirmGuestInfoInitV = {
  show: false,
  payload: {
    name: "",
    phoneNumber: "",
  },
};

const confirmReserveDetailsInitV = {
  show: false,
  payload: {
    openingConfirmReserveBottomSheetFromObservePage: false,
  },
};

function MyTripDetails() {
  const router = useRouter();
  const [reserveInfo, setReserveInfo] = useState<IReserveDetails["order_details"]>();
  const [checkoutData, setCheckoutData] = useState<(WithFullname | WithKeyValue)[]>();
  const [checkoutTotal, setCheckoutTotal] = useState<number>(0);
  const [FAQData, setFAQData] = useState<IReserveDetailsFAQ[]>([]);
  const [reserveTotalDiscountAmount, setReserveTotalDiscountAmount] = useState<number>(0);
  // map
  const [userLat, setUserLat] = useState<number>();
  const [userLang, setUserLang] = useState<number>();

  const timerRef = useRef<any>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [showGuestWantsToCancelBottomSheet, setShowGuestWantsToCancelBottomSheet] =
    useState<boolean>(false);

  const [showResidenceCancelReserveRulesModal, setShowResidenceCancelReserveRulesModal] =
    useState<boolean>(false);

  const [showConfirmReserveDetailsBottomSheet, setShowConfirmReserveDetailsBottomSheet] = useState(
    confirmReserveDetailsInitV
  );
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  const [showConfirmGuestInfoForReserveBottomSheet, setShowConfirmGuestInfoForReserveBottomSheet] =
    useState(confirmGuestInfoInitV);
  const [showChooseEnterAndExitDaysCalendarModal, setShowChooseEnterAndExitDaysCalendarModal] =
    useState<boolean>(false);
  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [guestInfo, setGuestInfo] = useState<{ name: string; phone: string }>({
    name: "",
    phone: "",
  });
  const tokenRef = useRef<string>();
  //   const [showSendAltersList, setShowSendAltersList] = useState<boolean>(false);

  const [showApplyDiscountBottomSheet, setShowApplyDiscountBottomSheet] = useState<boolean>(false);

  //   const [
  //     showCancelReserveBeforeBeingFinalizedBottomSheet,
  //     setShowCancelReserveBeforeBeingFinalizedBottomSheet,
  //   ] = useState(false);
  const [
    showCancelReserveAfterBeingFinalizedBottomSheet,
    setShowCancelReserveAfterBeingFinalizedBottomSheet,
  ] = useState(false);

  const { isLoading, isSuccess, data, refetch } = useQuery(
    ["getReserve", router?.query?.id],
    () => {
      return getReserve(+(router?.query?.id as string));
    },
    {
      enabled: !!router?.query?.id,
      staleTime: 0,
    }
  );

  const statusInfo = useMemo(() => {
    return getStateCorresponding(reserveInfo?.state, reserveInfo?.cancelled_by);
  }, [reserveInfo?.state, reserveInfo?.cancelled_by]);

  const unDiscountTheCodeDiscountMutation = useMutation(
    () => {
      return unDiscountTheCodeDiscount({ order_id: reserveInfo?.id as number });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "کد تخفیف با موفقیت حذف شد." },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const reserveData: IReserveDetails = data?.params;

        setSelectedRanges([
          [
            moment(reserveData.order_details.start_date, "YYYY-MM-DD"),
            moment(reserveData.order_details.end_date, "YYYY-MM-DD"),
          ],
        ]);

        setNumberOfPeople(
          (reserveData.order_details.guests_count || 0) +
            (reserveData.order_details.extra_guests_count || 0)
        );

        setGuestInfo({
          name: reserveData?.order_details.guest.name || "",
          phone: reserveData?.order_details.guest.phone || "",
        });
      }
    }
  }, [data]);

  // This useEffect is for handling checkout data
  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const reserveData: IReserveDetails = data?.params;

        const normalWeekDaysData = reserveData.order_details.prices.find(
          (
            el
          ): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.NORMAL_WEEKDAYS]?: number }> =>
            ReserveDetailsCheckout_enum.NORMAL_WEEKDAYS in el &&
            typeof el[ReserveDetailsCheckout_enum.NORMAL_WEEKDAYS] !== "undefined"
        );

        const weekendsData = reserveData.order_details.prices.find(
          (el): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.WEEK_ENDS]?: number }> =>
            ReserveDetailsCheckout_enum.WEEK_ENDS in el &&
            typeof el[ReserveDetailsCheckout_enum.WEEK_ENDS] !== "undefined"
        );

        const peakDaysData = reserveData.order_details.prices.find(
          (el): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.PEAK_DAYS]?: number }> =>
            ReserveDetailsCheckout_enum.PEAK_DAYS in el &&
            typeof el[ReserveDetailsCheckout_enum.PEAK_DAYS] !== "undefined"
        );

        const specialDaysData = reserveData.order_details.prices.find(
          (el): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.SPECIAL_DAYS]?: number }> =>
            ReserveDetailsCheckout_enum.SPECIAL_DAYS in el &&
            typeof el[ReserveDetailsCheckout_enum.SPECIAL_DAYS] !== "undefined"
        );

        const extraGuestsData = reserveData.order_details.prices.find(
          (el): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.EXTRA_GUESTS]?: number }> =>
            ReserveDetailsCheckout_enum.EXTRA_GUESTS in el &&
            typeof el[ReserveDetailsCheckout_enum.EXTRA_GUESTS] !== "undefined"
        );

        const hostDiscountData = reserveData.order_details.prices.find(
          (
            el
          ): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.HOST_DISCOUNT]?: number }> =>
            ReserveDetailsCheckout_enum.HOST_DISCOUNT in el &&
            typeof el[ReserveDetailsCheckout_enum.HOST_DISCOUNT] !== "undefined"
        );

        const websiteDiscountData = reserveData.order_details.prices.find(
          (
            el
          ): el is Extract<
            typeof el,
            { [ReserveDetailsCheckout_enum.WEBSITE_DISCOUNT]?: number }
          > =>
            ReserveDetailsCheckout_enum.WEBSITE_DISCOUNT in el &&
            typeof el[ReserveDetailsCheckout_enum.WEBSITE_DISCOUNT] !== "undefined"
        );

        const couponDiscountData = reserveData.order_details.prices.find(
          (
            el
          ): el is Extract<typeof el, { [ReserveDetailsCheckout_enum.COUPON_DISCOUNT]?: number }> =>
            ReserveDetailsCheckout_enum.COUPON_DISCOUNT in el &&
            typeof el[ReserveDetailsCheckout_enum.COUPON_DISCOUNT] !== "undefined"
        );

        const reservePeriodDiscountData = reserveData.order_details.prices.find(
          (
            el
          ): el is Extract<
            typeof el,
            { [ReserveDetailsCheckout_enum.RESERVE_PERIOD_DISCOUNT]?: number }
          > =>
            ReserveDetailsCheckout_enum.RESERVE_PERIOD_DISCOUNT in el &&
            typeof el[ReserveDetailsCheckout_enum.RESERVE_PERIOD_DISCOUNT] !== "undefined"
        );

        // console.log({
        //   normalWeekDaysData,
        //   weekendsData,
        //   peakDaysData,
        //   specialDaysData,
        //   extraGuestsData,
        //   hostDiscountData,
        //   websiteDiscountData,
        // });

        setCheckoutData([
          {
            label: "روزهای وسط هفته : ",
            valueOfKey: normalWeekDaysData?.weekdays || 0,
            numberOfDiscountedDays: 0,
            key: "شب",
            per: normalWeekDaysData?.unit_price || 0,
            total: (normalWeekDaysData?.weekdays || 0) * (normalWeekDaysData?.unit_price || 0),
          },
          {
            label: "روزهای آخر هفته : ",
            valueOfKey: weekendsData?.weekends || 0,
            numberOfDiscountedDays: 0,
            key: "شب",
            per: weekendsData?.unit_price || 0,
            total: (weekendsData?.weekends || 0) * (weekendsData?.unit_price || 0),
          },
          {
            label: "روزهای ایام پیک : ",
            valueOfKey: peakDaysData?.peaks || 0,
            numberOfDiscountedDays: 0,
            key: "شب",
            per: peakDaysData?.unit_price || 0,
            total: (peakDaysData?.peaks || 0) * (peakDaysData?.unit_price || 0),
          },
          {
            label: "روزهـــای خـاص : ",
            valueOfKey: specialDaysData?.specials || 0,
            numberOfDiscountedDays: 0,
            key: "شب",
            per: specialDaysData?.unit_price || 0,
            total: (specialDaysData?.specials || 0) * (specialDaysData?.unit_price || 0),
          },
          {
            label: "نرخ نفر اضافه : ",
            valueOfKey: extraGuestsData?.count || 0,
            numberOfDiscountedDays: 0,
            key: "نفر",
            per: (extraGuestsData?.extras || 0) * (extraGuestsData?.unit_price || 0),
            total: extraGuestsData?.total_price || 0,
          },
          {
            label: "تخفیف میزبان : ",
            fullValue: !!hostDiscountData?.host_discount
              ? `${hostDiscountData?.host_discount} هزار تومان`
              : "",
          },
          {
            label: "تخفیف مدت رزرو : ",
            fullValue: !!reservePeriodDiscountData?.period_discount
              ? `${reservePeriodDiscountData?.period_discount?.toLocaleString("en-US")} تومان`
              : "",
          },
          {
            label: "تخفیف سایت : ",
            fullValue: !!websiteDiscountData?.website_discount
              ? `${websiteDiscountData?.website_discount?.toLocaleString("en-US")}  تومان`
              : "",
          },
          {
            label: "کد تخفیف : ",
            fullValue: !!couponDiscountData?.coupon_discount
              ? `${couponDiscountData?.coupon_discount?.toLocaleString("en-US")}  تومان`
              : "",
          },
        ]);

        setCheckoutTotal(
          (normalWeekDaysData?.weekdays || 0) *
            (normalWeekDaysData?.unit_price || // ehsan mige ke tuye in unit_price ha, takhfif dar nazar gerefte shode.
              0) +
            (weekendsData?.weekends || 0) * (weekendsData?.unit_price || 0) +
            (peakDaysData?.peaks || 0) * (peakDaysData?.unit_price || 0) +
            (specialDaysData?.specials || 0) * (specialDaysData?.unit_price || 0) +
            // for extra_guests price
            (extraGuestsData?.count || 0) * // extra guests number
              (extraGuestsData?.extras || 0) * // total nights spent
              (extraGuestsData?.unit_price || 0) - // each extra guest unit price per night
            (hostDiscountData?.host_discount || 0) -
            (websiteDiscountData?.website_discount || 0) -
            (couponDiscountData?.coupon_discount || 0) -
            (reservePeriodDiscountData?.period_discount || 0)
        );

        setReserveTotalDiscountAmount(
          (reservePeriodDiscountData?.period_discount || 0) +
            (couponDiscountData?.coupon_discount || 0)
        );

        setFAQData(reserveData.faqs);

        setReserveInfo(reserveData.order_details);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!!reserveInfo?.expiry_date) {
      timerRef.current = setInterval(() => {
        const diff = getTimeDiff(Date.now(), new Date(`${reserveInfo?.expiry_date}Z`).getTime());

        if (diff === 0) {
          // So this reserve's expiryDate has been reached, so let's refetch the reserve details.
          refetch();

          // And also clear this reserve's interval
          if (!!timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          setRemainingTime(diff);
        }
      }, 1000);
    }

    return () => {
      if (!!timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserveInfo?.expiry_date]);

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    refetch: refetchCalendarData,
    data: calendarData,
  } = useQuery(
    [
      "getCalendarData",
      reserveInfo?.product.display_type === "suit"
        ? reserveInfo.product.id
        : reserveInfo?.rooms?.[0]?.id,
    ],
    () => {
      return getCalendarData({
        residenceId:
          reserveInfo?.product.display_type === "suit"
            ? reserveInfo.product.id
            : (reserveInfo?.rooms[0].id as number),
        residenceType:
          reserveInfo?.product.display_type === "suit"
            ? ResidenceTypes_enum.PRODUCT
            : ResidenceTypes_enum.ROOM,
      });
    },
    {
      enabled: reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL,
      onSuccess: (data) => {
        // console.log("calendarData", data);
      },
      // reserveInfo?.product.display_type === "suit"
      //   ? !!showChooseEnterAndExitDaysCalendarModal
      //   : reserveInfo?.product.display_type === "boomgardi"
      //   ? !!showTripleCalendar
      //   : // For hotel calendar condition
      //     false,
    }
  );

  // const startPayMutation = useMutation(
  //   ({ token }: { token: string }) => {
  //     return startPay({ token, return_url: router.asPath });
  //   },
  //   {
  //     onSuccess: (data) => {
  //       // router.push(
  //       //   `https://lidomatrip.com/api/payment/start_pay?acquirer_id=13&token=${tokenRef.current}&return_url=${router.asPath}`
  //       // );
  //       if (data?.status === "success") {
  //         console.log("startPay is", data);
  //       } else {
  //         exception.message([
  //           {
  //             type: EXCEPTIONTYPES.ERROR,
  //             title: data?.err_msg || defaultError,
  //           },
  //         ]);
  //       }
  //     },
  //   }
  // );

  // const getPaymentTokenMutation = useMutation(
  //   () => {
  //     return getPaymentToken({ order_id: Number(router?.query?.id) });
  //   },
  //   {
  //     onSuccess: (data) => {
  //       if (data?.status === "success") {
  //         console.log("getPaymentToken is", data);
  //         // call 'start pay'
  //         const token: string = data?.params?.token;
  //         tokenRef.current = token;
  //         console.log("getPaymentToken token is", token);
  //         startPayMutation.mutate({ token });
  //       } else {
  //         exception.message([
  //           {
  //             type: EXCEPTIONTYPES.ERROR,
  //             title: data?.err_msg || defaultError,
  //           },
  //         ]);
  //       }
  //     },
  //   }
  // );

  const getPaymentTokenMutation = useMutation(
    ({ order_id }: { order_id: number }) => {
      return getPaymentToken({ order_id });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          // console.log("getPaymentToken is", data);
          // call 'start pay'
          const token: string = data?.params?.token;
          const return_url = `/my-trips/${reserveInfo?.id}`;
          // console.log("getPaymentToken token is", token);
          tokenRef.current = token;
          // startPayMutation.mutate({ token });
          router.push(
            `https://lidomatrip.com/api/payment/start_pay?acquirer_id=11&token=${token}&return_url=${return_url}`
          );
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || defaultError,
            },
          ]);
        }
      },
    }
  );

  const submitEditReserveMutation = useMutation(
    () => {
      return submitEditReserve({
        order_id: reserveInfo?.id as number,
        start_date: selectedRanges?.[0]?.[0]?.format("jYYYY/jMM/jDD"),
        end_date: (selectedRanges?.[0]?.[1] as moment.Moment)?.format("jYYYY/jMM/jDD"),
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
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت تغییر یافت." },
          ]);

          setSelectedRanges([]);
          setNumberOfPeople(0);

          // When reserve is submitted in a mobile device.
          setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV);

          refetchCalendarData();

          router.replace(`/my-trips/${data?.params?.order_id}`);
        }
      },
    }
  );

  function submitEditRequest() {
    // Lets submit the edit reserve
    submitEditReserveMutation.mutate();
  }

  return isLoading ? (
    <div className="pt-84 md:pt-[115px]">
      <TinyLoader />
    </div>
  ) : (
    <>
      <div
        className={`
          pt-84 md:pt-[115px] md:pb-0 CustomContainer
          ${reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT ? "pb-[125px]" : "pb-84"}
        `}
      >
        <div className="grid grid-cols-14 md:gap-x-40">
          <div className="col-span-full md:col-span-8">
            <div className="mb-24">
              {!!reserveInfo?.state && (
                <Timeline
                  state={reserveInfo?.state}
                  tempState={reserveInfo?.temp_state}
                  startDate={reserveInfo.start_date}
                  endDate={reserveInfo.end_date}
                />
              )}
            </div>

            <div className="md:px-4 pb-24 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <div className="flex flex-col items-center">
                {!!statusInfo?.iconPathInDesktop && (
                  <Image src={statusInfo?.iconPathInDesktop} width={48} height={48} alt="" />
                )}

                <p className={`text-20 leading-28 font-m mt-4 mb-16 ${statusInfo?.textColor}`}>
                  {statusInfo?.name}
                </p>

                <p className="text-error-light text-center mb-4">
                  {(
                    rejectReasons.find((el) => el.key === reserveInfo?.cancel_desc) ||
                    cancelReasons.find((el) => el.key === reserveInfo?.cancel_reason)
                  )?.text ||
                    reserveInfo?.cancel_desc ||
                    reserveInfo?.cancel_reason}
                </p>

                <p className="text-14 leading-20 font-l text-black text-center">
                  {statusInfo?.stateDescription_ForGuest(reserveInfo?.product.city)}
                </p>

                {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
                  reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT) &&
                  !!reserveInfo?.expiry_date && (
                    <>
                      <p className="text-14 leading-20 font-r text-black mb-12 mt-24">
                        {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL
                          ? "حداکثر زمانی که منتظر خواهید ماند"
                          : reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT
                          ? "حداکثر مهلت پرداخت :"
                          : ""}
                      </p>

                      <div className="flex items-center gap-x-4">
                        <div className="w-40 h-40 bg-[rgba(118,118,128,0.12)] rounded-8 text-16 leading-24 font-r text-black flex items-center justify-center">
                          {remainingTime?.split(":")[2]}
                        </div>
                        <span className="text-16 leading-28 font-m text-black">:</span>
                        <div className="w-40 h-40 bg-[rgba(118,118,128,0.12)] rounded-8 text-16 leading-24 font-r text-black flex items-center justify-center">
                          {remainingTime?.split(":")[1]}
                        </div>
                        <span className="text-16 leading-28 font-m text-black">:</span>
                        <div className="w-40 h-40 bg-[rgba(118,118,128,0.12)] rounded-8 text-16 leading-24 font-r text-black flex items-center justify-center">
                          {remainingTime?.split(":")[0]}
                        </div>
                      </div>
                    </>
                  )}
                {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
                  reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT) && (
                  <div className="mt-24">
                    <Button
                      isFullWidth
                      color="grey"
                      variant="outlined"
                      onClick={() => router.reload()}
                      rightIcon={<i className="icon-Refresh text-24 text-black" />}
                      rounded
                    >
                      بروزرسانی وضعیت درخواست
                    </Button>
                  </div>
                )}
                {reserveInfo?.state === ReserveStates_enum.DONE && (
                  <div className="w-[318px] mt-16">
                    <DownloadFactor reserveId={reserveInfo.id} endDate={reserveInfo.end_date} />
                  </div>
                )}
              </div>
            </div>

            {/* Always in Desktop */}
            <Divider className="md:hidden" />
            <div className="block pb-24 pt-24 md:pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <div className="mb-16 md:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-12 grow">
                    <div className="flex items-center">
                      <i className="icon-Home text-24 text-black" />
                    </div>

                    <div>
                      <p className="text-12 leading-16 font-l text-gray-959FA7 mb-12">
                        نام اقامتگاه
                      </p>
                      <Link
                        prefetch={false}
                        passHref
                        href={getPropertyPageUrl({
                          residenceId: reserveInfo?.product.id as number,
                        })}
                        className="text-16 leading-24 font-r text-blue-main"
                      >
                        {reserveInfo?.product.name}
                      </Link>
                    </div>
                  </div>

                  {!!reserveInfo?.product.image_url && (
                    <div className="w-56 h-56 relative">
                      <Image
                        src={reserveInfo?.product.image_url}
                        fill
                        style={{ objectFit: "cover" }}
                        alt={reserveInfo?.product.name}
                        className="rounded-8 shrink-0"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-16">
                <CreateInfo
                  icon={<i className="icon-Calendar text-24 text-black" />}
                  title="تاریخ سفر"
                  desc={`${miladiToJalali(reserveInfo?.start_date)} تا ${miladiToJalali(
                    reserveInfo?.end_date
                  )}`}
                />
              </div>

              {!!reserveInfo?.rooms && reserveInfo?.rooms.length !== 0 && (
                <div className="mb-16">
                  <CreateInfo
                    icon={<i className="icon-Rooms text-24 text-black" />}
                    title="نام اتاق"
                    desc={reserveInfo?.rooms[0].name}
                  />
                </div>
              )}

              <div className="mb-16">
                <CreateInfo
                  icon={<i className="icon-Profile text-24 text-black" />}
                  title="تعداد نفرات"
                  desc={`${reserveInfo?.guests_count} نفر ${
                    !!reserveInfo?.extra_guests_count
                      ? ` + ${reserveInfo?.extra_guests_count} نفر اضافه`
                      : ""
                  }`}
                />
              </div>

              <div>
                <CreateInfo
                  icon={<i className="icon-BirthCertificate text-24 text-black" />}
                  title="مشخصات مهمان"
                  desc={`${reserveInfo?.guest.name} ${reserveInfo?.guest.phone || "*********09"}`}
                />
              </div>

              {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL && (
                <div className="mt-24 md:w-[174px]">
                  <Button
                    isFullWidth
                    color="light-blue"
                    leftIcon={<i className="icon-FlashLeft text-24 text-info" />}
                    className="!pl-8 !pr-16 !py-12 justify-between"
                    onClick={() => {
                      setShowConfirmReserveDetailsBottomSheet({
                        show: true,
                        payload: { openingConfirmReserveBottomSheetFromObservePage: true },
                      });
                      // if (reserveInfo.product.display_type === "suit") {
                      //   setShowConfirmReserveDetailsBottomSheet({
                      //     show: true,
                      //     payload: { openingConfirmReserveBottomSheetFromObservePage: true },
                      //   });
                      // } else if (reserveInfo.product.display_type === "boomgardi") {
                      //   setShowConfirmReserveDetailsBottomSheet({
                      //     show: true,
                      //     payload: { openingConfirmReserveBottomSheetFromObservePage: true },
                      //   });
                      // } else if (reserveInfo.product.display_type === "hotel") {
                      // }
                    }}
                  >
                    <span className="flex items-center gap-x-8">
                      <i className="icon-Edit text-24 text-info" />
                      ویرایش رزرو
                    </span>
                  </Button>
                </div>
              )}
            </div>

            {!!checkoutTotal && (
              <div className="md:hidden">
                <Divider />
                <div className="py-16">
                  <Checkout
                    data={checkoutData || []}
                    total={reserveInfo?.total_amount || 0}
                    n_of_discounted_special_days={0}
                    n_of_discounted_peak_days={0}
                    n_of_discounted_weekends={0}
                    n_of_discounted_normaldays={0}
                    totalDiscountAmount={reserveTotalDiscountAmount}
                  />
                </div>
              </div>
            )}

            {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
              reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT) &&
              !reserveInfo.prices.find(
                (
                  el
                ): el is Extract<
                  typeof el,
                  { [ReserveDetailsCheckout_enum.COUPON_DISCOUNT]?: number }
                > =>
                  ReserveDetailsCheckout_enum.COUPON_DISCOUNT in el &&
                  typeof el[ReserveDetailsCheckout_enum.COUPON_DISCOUNT] !== "undefined"
              )?.coupon_discount && (
                <div className="pb-24 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
                  <div className={`flex items-center justify-between`}>
                    <div
                      className={`
                      flex items-center gap-x-8
                      ${
                        reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL
                          ? "cursor-not-allowed pointer-events-none opacity-30"
                          : ""
                      }
                    `}
                      onClick={() => {
                        setShowApplyDiscountBottomSheet(true);
                      }}
                    >
                      <i className="icon-Offer text-24 text-black" />
                      <p className="text-16 leading-24 text-black font-m">
                        اگر کد تخفیف دارید وارد کنید
                      </p>
                    </div>

                    <GoToFlash
                      onClick={() => {
                        setShowApplyDiscountBottomSheet(true);
                      }}
                      disabled={reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL}
                    />
                  </div>

                  {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL && (
                    <p className="text-12 leading-21 text-warning font-r mt-12">
                      {"( پس از تأیید میزبان می توانید کد تخفیف خود را وارد کنید )"}
                    </p>
                  )}
                </div>
              )}

            {!!reserveInfo?.prices.find(
              (
                el
              ): el is Extract<
                typeof el,
                { [ReserveDetailsCheckout_enum.COUPON_DISCOUNT]?: number }
              > =>
                ReserveDetailsCheckout_enum.COUPON_DISCOUNT in el &&
                typeof el[ReserveDetailsCheckout_enum.COUPON_DISCOUNT] !== "undefined"
            )?.coupon_discount && (
              <div className="pb-24 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24 flex items-center justify-between">
                <div className={`flex items-center gap-x-8 text-green-main`}>
                  <i className="icon-Offer text-24" />
                  <p className="text-16 leading-24 font-m">کد تخفیف اعمال شد</p>
                </div>

                <Button
                  color="grey"
                  rightIcon={<i className="icon-Delete text-20 text-black" />}
                  onClick={() => {
                    unDiscountTheCodeDiscountMutation.mutate();
                  }}
                >
                  حذف کد تخفیف
                </Button>
              </div>
            )}

            <Divider className="md:hidden" />

            <div className="py-24 md:!pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <PageTitle
                icon={<i className="icon-Profile text-20" />}
                title={"مشخصات میزبان"}
                containerClassname="mb-24"
              />

              <div className="flex items-center gap-x-24">
                <div className="flex items-center gap-x-12">
                  <i className="icon-GuestProfile text-18" />
                  <p className="text-14 text-black leading-18">{reserveInfo?.host.name}</p>
                </div>
                <div className="flex items-center gap-x-12">
                  <i className="icon-Phone text-18" />
                  <p className="text-14 text-black leading-18">
                    {reserveInfo?.host.phone &&
                    reserveInfo?.state === ReserveStates_enum.DONE &&
                    !moment(reserveInfo?.end_date)?.isBefore(moment())
                      ? reserveInfo?.host.phone
                      : "*********09"}
                  </p>
                </div>
              </div>

              {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
                reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT) && (
                <p className="text-12 leading-21 text-warning font-r mt-12">
                  {"( اطلاعات کامل پس از قطعی شدن رزرو قابل مشاهده خواهد بود )"}
                </p>
              )}

              {reserveInfo?.state === ReserveStates_enum.CANCEL ||
              reserveInfo?.state === ReserveStates_enum.EXPIRED ? null : (
                <>
                  {/* One day past checkout, not the moment of it — a guest who
                      left something behind still needs the host. After that
                      the number goes away for good; see utilities/tripWindow. */}
                  {canShowContact(reserveInfo?.state, reserveInfo?.end_date) && (
                    <div className="mt-18 md:mt-24 md:max-w-[224px]">
                      {reserveInfo?.state === ReserveStates_enum.DONE ? (
                        <LinkButton
                          href={`tel:${reserveInfo?.host.phone}`}
                          color="secondary"
                          isFullWidth
                          rightIcon={<i className="icon-Phone text-24" />}
                        >
                          تماس با میزبان
                        </LinkButton>
                      ) : (
                        <LinkButton
                          href={`/chats/${reserveInfo?.id}`}
                          color="secondary"
                          isFullWidth
                          rightIcon={<i className="icon-message text-24" />}
                        >
                          گفتگوی آنلاین با میزبان
                        </LinkButton>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <Divider className="md:hidden" />

            {reserveInfo?.state === ReserveStates_enum.DONE &&
              !!reserveInfo.product.latitude &&
              reserveInfo.product.longitude && (
                <div className="pb-24 pt-24 md:pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
                  <PageTitle
                    icon={<i className="icon-Map text-20" />}
                    title="آدرس و لوکیشن"
                    containerClassname="mb-24"
                  />

                  <p className="text-14 leading-24 text-black font-l mb-16">
                    {reserveInfo.product.address}
                  </p>

                  <div className="h-320">
                    <ProjectMap
                      userLat={Number(reserveInfo.product.latitude)}
                      userLang={Number(reserveInfo.product.longitude)}
                      setUserLat={setUserLat} // not gonna be used here
                      setUserLang={setUserLang} // not gonna be used here
                      showZoomControl={false}
                      // getUserLocationBtnClassname=""
                      name="reslatlng"
                      mapClassname="rounded-12"
                      hasRoutingOption={true}
                      isPinpointDraggable={false}
                      enableClickOnMap={false}
                      hasUserLocationBtn={false}
                    />
                  </div>

                  <ul className="text-12 leading-21 text-black font-l mt-16 list-disc list-inside">
                    <li>
                      لوکیشن نشان داده شده، محدوده اقامتگاه می باشد. جهت دریافت آدرس دقیق، با میزبان
                      خود در تماس باشید
                    </li>
                  </ul>
                </div>
              )}

            <Divider className="md:hidden" />

            <div className="pb-24 pt-24 md:pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <div className="flex items-center justify-between">
                <p className="text-16 leading-24 text-black font-m">قوانین لغو رزرو</p>

                <GoToFlash
                  onClick={() => {
                    setShowResidenceCancelReserveRulesModal(true);
                  }}
                />
              </div>

              <p className="text-12 leading-30 text-black font-l mt-12">
                {/* تا {reserveInfo?.product.full_return_time || 0} ساعت قبل از ورود مهمان : پرداخت کامل
                وجه به مهمان */}
                تا 72 ساعت قبل از ورود مهمان : با کسر ٪۲۰ از مبلغ کل رزرو، مابقی مبلغ پرداخت شده
                عودت داده می شود
              </p>
            </div>

            <Divider className="md:hidden" />

            <div className="py-24 md:!pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <p className="text-12 leading-21 text-zilgara font-l mb-12 md:mb-16 text-center">
                در صورت داشتن سوال و یا مشکل، با ما تماس بگیرید
              </p>

              <LinkButton
                href={`tel:02191070021`}
                isFullWidth
                rounded
                className="md:w-320 md:mx-auto"
                variant="outlined"
                color="black"
                rightIcon={<i className="icon-Phone text-24" />}
              >
                تماس با پشتیبانی
              </LinkButton>
            </div>

            {!FAQData || !FAQData?.length ? null : (
              <>
                <Divider className="md:hidden" />
                <div className="py-24 md:!pt-0">
                  <FAQs faqs={FAQData} />
                </div>
              </>
            )}

            {/* START OF CANCELLING A RESERVE */}
            {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
              reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT ||
              (reserveInfo?.state === ReserveStates_enum.DONE &&
                new (moment as any)().isBefore(new (moment as any)(reserveInfo?.end_date)))) && (
              <div className="md:w-[147px]">
                <Button
                  isFullWidth
                  // rightIcon={}
                  leftIcon={<i className="icon-FlashLeft text-24" />}
                  color="light-error"
                  className="!pl-8 !pr-12 !py-12 justify-between"
                  onClick={() => {
                    if (
                      reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
                      reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT
                    ) {
                      setShowGuestWantsToCancelBottomSheet(true);
                    } else {
                      setShowCancelReserveAfterBeingFinalizedBottomSheet(true);
                    }
                    // setShowCancelReserveAfterBeingFinalizedBottomSheet(true);
                  }}
                >
                  <span className="flex items-center gap-x-8">
                    <i className="icon-Error text-24" />
                    لغو رزرو
                  </span>
                </Button>
              </div>
            )}
            {/* END OF CANCELLING A RESERVE */}
          </div>

          <div className="hidden md:block md:col-span-6 relative">
            <div className="sticky top-[115px] border-1 border-solid border-gray-CACFD3 rounded-16 p-24">
              <div className="pb-24 border-b-1 border-dashed border-b-[rgba(28,46,69,0.6)] mb-24 flex items-start gap-x-16">
                <div className="w-120 h-120 relative">
                  {!!reserveInfo?.product.image_url && (
                    <Image
                      src={reserveInfo?.product.image_url}
                      fill
                      style={{ objectFit: "cover" }}
                      alt=""
                      className="rounded-12"
                    />
                  )}
                </div>

                <div>
                  <Link
                    passHref
                    prefetch={false}
                    href={getPropertyPageUrl({
                      residenceId: reserveInfo?.product.id as number,
                    })}
                    className="block text-14 leading-20 font-m text-blue-main mb-16"
                  >
                    {reserveInfo?.product.name}
                  </Link>

                  <ResLocationWithoutBreadCrumb
                    city={reserveInfo?.product.city || ""}
                    className="mb-16"
                    // neighborhood={undefined}
                    province={reserveInfo?.product.province || ""}
                  />

                  <ResRate
                    average_rating={reserveInfo?.product.average_rating || 0}
                    reviews_count={reserveInfo?.product.reviews_count || 0}
                  />
                </div>
              </div>

              <div className="mb-24">
                <Checkout
                  data={checkoutData || []}
                  total={reserveInfo?.total_amount || 0}
                  n_of_discounted_special_days={0}
                  n_of_discounted_peak_days={0}
                  n_of_discounted_weekends={0}
                  n_of_discounted_normaldays={0}
                  totalDiscountAmount={reserveTotalDiscountAmount}
                />
              </div>

              <div>
                {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ? (
                  <Button isFullWidth disabled>
                    پرداخت پس از تأیید میزبان
                  </Button>
                ) : reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT ? (
                  <Button
                    isFullWidth
                    onClick={() => {
                      getPaymentTokenMutation.mutate({ order_id: reserveInfo?.id });
                    }}
                  >
                    پرداخت صورتحساب
                  </Button>
                ) : reserveInfo?.state === ReserveStates_enum.DONE &&
                  moment(reserveInfo?.end_date)?.isBefore(moment()) ? (
                  <LinkButton
                    href={`/submit-review?id=${router?.query?.id}`}
                    color="secondary"
                    isFullWidth
                    rightIcon={<i className="icon-message text-24" />}
                  >
                    {reserveInfo?.has_review ? "مشاهده نظر ثبت‌شده" : "ثبت نظر"}
                  </LinkButton>
                ) : reserveInfo?.state === ReserveStates_enum.DONE ? (
                  <LinkButton
                    href={`tel:${reserveInfo?.host.phone}`}
                    color="secondary"
                    isFullWidth
                    rightIcon={<i className="icon-Phone text-24" />}
                  >
                    تماس با میزبان
                  </LinkButton>
                ) : (
                  <div>
                    {!!reserveInfo?.alters?.length && (
                      <Button variant="outlined" color="black" className="mb-12" isFullWidth>
                        مشاهده اقامتگاه های مشابه
                      </Button>
                    )}

                    <LinkButton
                      href={`/search/${
                        reserveInfo?.product?.city_title || reserveInfo?.product?.province_title
                      }`}
                      variant="contained"
                      color="grey"
                      isFullWidth
                    >
                      بازگشت به صفحه اقامتگاه های{" "}
                      {reserveInfo?.product?.city || reserveInfo?.product?.province}
                    </LinkButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navbar in mobile */}
          <div className="fixed bottom-0 right-0 left-0 px-20 py-16 bg-white md:hidden border-t-1 border-solid border-t-gray-CACFD3 z-2">
            {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ? (
              <Button isFullWidth disabled>
                پرداخت پس از تأیید میزبان
              </Button>
            ) : reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT ? (
              <div>
                <div className="mb-16 flex items-center justify-between">
                  <p className="flex items-center gap-x-8">
                    <span className="text-10 leading-17 text-gray-616E7C font-r">
                      جمع صورتحساب :
                    </span>
                    <span className="text-14 leading-24 text-black font-m">
                      {
                        // checkoutTotal?.toLocaleString("en-US")
                        (reserveInfo?.total_amount || 0)?.toLocaleString("en-US")
                      }{" "}
                      تومان
                    </span>
                  </p>

                  {!reserveInfo.prices.find(
                    (
                      el
                    ): el is Extract<
                      typeof el,
                      { [ReserveDetailsCheckout_enum.COUPON_DISCOUNT]?: number }
                    > =>
                      ReserveDetailsCheckout_enum.COUPON_DISCOUNT in el &&
                      typeof el[ReserveDetailsCheckout_enum.COUPON_DISCOUNT] !== "undefined"
                  )?.coupon_discount ? (
                    <Button
                      variant="contained"
                      color="grey"
                      rounded
                      className="!py-4 !px-12 !text-10 !leading-17 !font-r"
                      onClick={() => setShowApplyDiscountBottomSheet(true)}
                    >
                      کد تخفیف دارید ؟
                    </Button>
                  ) : null}
                </div>
                <Button
                  isFullWidth
                  onClick={() => {
                    getPaymentTokenMutation.mutate({ order_id: reserveInfo?.id });
                  }}
                >
                  پرداخت صورتحساب
                </Button>
              </div>
            ) : reserveInfo?.state === ReserveStates_enum.DONE &&
              moment(reserveInfo?.end_date)?.isBefore(moment()) ? (
              <LinkButton
                href={`/submit-review?id=${router?.query?.id}`}
                color="secondary"
                isFullWidth
                rightIcon={<i className="icon-message text-24" />}
              >
                {reserveInfo?.has_review ? "مشاهده نظر ثبت‌شده" : "ثبت نظر"}
              </LinkButton>
            ) : reserveInfo?.state === ReserveStates_enum.DONE ? (
              <LinkButton
                href={`tel:${reserveInfo?.host.phone}`}
                color="secondary"
                isFullWidth
                rightIcon={<i className="icon-Phone text-24" />}
              >
                تماس با میزبان
              </LinkButton>
            ) : (
              <div>
                {!!reserveInfo?.alters?.length && (
                  <Button variant="outlined" color="black" className="mb-12" isFullWidth>
                    مشاهده اقامتگاه های مشابه
                  </Button>
                )}

                <LinkButton
                  variant="contained"
                  color="grey"
                  isFullWidth
                  href={`/search/${
                    reserveInfo?.product?.city_title || reserveInfo?.product?.province_title
                  }`}
                >
                  بازگشت به صفحه اقامتگاه های{" "}
                  {reserveInfo?.product?.city || reserveInfo?.product?.province}
                </LinkButton>
              </div>
            )}
          </div>
        </div>

        {/* <BottomSheet
          open={showCancelReserveBeforeBeingFinalizedBottomSheet}
          handleClose={() => setShowCancelReserveBeforeBeingFinalizedBottomSheet(false)}
          headerTitle="علت لغو درخواست"
          body={({ handleSmoothClose }) => {
            return (
              <CancelReserveBeforeBeingFinalizedBottomSheet
                handleSmoothClose={handleSmoothClose}
                reasonsList={cancelReasons}
                reserveId={reserveInfo?.id as number}
              />
            );
          }}
        /> */}

        <BottomSheet
          open={showCancelReserveAfterBeingFinalizedBottomSheet}
          handleClose={() => setShowCancelReserveAfterBeingFinalizedBottomSheet(false)}
          headerTitle="لغو رزرو قطعی شده"
          body={({ handleSmoothClose }) => {
            return (
              <CancelReserveAfterBeingFinalizedBottomSheet
                handleSmoothClose={handleSmoothClose}
                hostIsCancelling={false}
              />
            );
          }}
        />

        <BottomSheet
          open={!!showConfirmReserveDetailsBottomSheet.show}
          handleClose={() => setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV)}
          headerTitle={"جزئیات رزرو"}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <EditReserveDetailsBottomSheet
                initialNumberOfPeople={
                  (reserveInfo?.guests_count || 0) + (reserveInfo?.extra_guests_count || 0)
                }
                initialEntranceDate={moment(reserveInfo?.start_date, "YYYY-MM-DD")}
                initialExitDate={moment(reserveInfo?.end_date, "YYYY-MM-DD")}
                handleSmoothClose={handleSmoothClose}
                // payload={showFacilityDetailsBottomSheet.payload}
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
                entranceDate={`
                ${parseInt(selectedRanges?.[0]?.[0].format("jDD"))} 
                ${selectedRanges?.[0]?.[0].format("jMMMM")}
                `}
                exitDate={`
                ${parseInt((selectedRanges[0]?.[1] as moment.Moment).format("jDD"))} 
                ${(selectedRanges[0]?.[1] as moment.Moment).format("jMMMM")}
                `}
                guestName={guestInfo.name}
                guestPhoneNumber={guestInfo.phone}
                openingThisBottomSheetFromObservePage={
                  // showConfirmReserveDetailsBottomSheet.payload
                  //   .openingConfirmReserveBottomSheetFromObservePage
                  false
                }
                setShowChooseEnterAndExitDaysCalendarModal={
                  reserveInfo?.product.display_type === "suit"
                    ? setShowChooseEnterAndExitDaysCalendarModal
                    : setShowChooseEnterAndExitDaysCalendarModal
                }
                onClickOfReturnBtn={() => {
                  // if (
                  //   showConfirmReserveDetailsBottomSheet.payload
                  //     .openingConfirmReserveBottomSheetFromObservePage
                  // ) {
                  //   handleSmoothClose();
                  // } else {
                  //   handleSmoothClose();

                  //   setShowChooseEnterAndExitDaysCalendarModal(true);
                  // }
                  handleSmoothClose();
                }}
                onTapOfEditGuestInfo={() => {
                  handleSmoothClose();

                  setTimeout(() => {
                    setShowConfirmGuestInfoForReserveBottomSheet({
                      show: true,
                      payload: {
                        name: guestInfo.name,
                        phoneNumber: guestInfo.phone,
                      },
                    });
                  }, 200);
                }}
                resMaxCapacity={
                  reserveInfo?.product.display_type === "suit"
                    ? reserveInfo?.product.max_capacity
                    : reserveInfo?.product.display_type === "boomgardi"
                    ? calendarData?.params?.max_capacity
                    : // hotel
                      1
                }
                //
                selectedRanges={selectedRanges}
                // preCalculatedCheckoutData={checkoutData || []}
                checkoutData={checkoutData}
                checkoutTotal={checkoutTotal}
                calendarData={calendarData}
                // weeklyDiscountAmount={weeklyDiscountAmount}
                // monthlyDiscountAmount={monthlyDiscountAmount}
                //
                onReadyToSubmitReserve={() => submitEditRequest()}
                baseCapacityOfSelectedResOrRoom={
                  reserveInfo?.product.display_type === "suit"
                    ? reserveInfo?.product.capacity || 1
                    : reserveInfo?.product.display_type === "boomgardi"
                    ? calendarData?.params?.capacity || 1
                    : // hotel
                      1
                }
                single_extra_guest_price={
                  reserveInfo?.product.display_type === "suit"
                    ? reserveInfo?.prices.find(
                        (
                          el
                        ): el is Extract<
                          typeof el,
                          { [ReserveDetailsCheckout_enum.EXTRA_GUESTS]?: number }
                        > =>
                          ReserveDetailsCheckout_enum.EXTRA_GUESTS in el &&
                          typeof el[ReserveDetailsCheckout_enum.EXTRA_GUESTS] !== "undefined"
                      )?.unit_price || 0
                    : reserveInfo?.product.display_type === "boomgardi"
                    ? calendarData?.params?.prices?.extra_guests_price
                    : // hotel
                      0
                }
              />
            );
          }}
        />

        {!!showChooseEnterAndExitDaysCalendarModal && (
          <ChooseEnterAndExitDaysCalendarModal
            isModalOpen={showChooseEnterAndExitDaysCalendarModal}
            handleClose={() => {
              setShowChooseEnterAndExitDaysCalendarModal(false);
              setShowConfirmReserveDetailsBottomSheet({
                show: true,
                payload: { openingConfirmReserveBottomSheetFromObservePage: false },
              });
            }}
            min_reservable_days={reserveInfo?.product.min_reservable_days || 1}
            discounted_days={calendarData?.params?.discounted_days || []}
            fast_days={calendarData?.params?.discounted_days || []}
            filled_dates={calendarData?.params?.filled_dates || []}
            noCoOperation={false}
            peak_dates={calendarData?.params?.peak_dates || []}
            reserved_dates={
              calendarData?.params?.reserved_dates.filter((el: string) => {
                const reserve_start_day = moment(reserveInfo?.start_date, "YYYY-MM-DD");
                const reserve_end_day = moment(reserveInfo?.end_date, "YYYY-MM-DD");

                const currentDay = moment(el, "YYYY-MM-DD");

                if (
                  currentDay.isBefore(reserve_end_day) &&
                  currentDay.isSameOrAfter(reserve_start_day)
                ) {
                  return false;
                } else {
                  return true;
                }
              }) || []
            }
            special_dates={calendarData?.params?.special_dates || []}
            prices={calendarData?.params?.prices || []}
            selectedRanges={selectedRanges}
            setSelectedRanges={setSelectedRanges}
            // dateToWorkWith={dateToWorkWith}
            // setDateToWorkWith={setDateToWorkWith}
            onSubmit={(givenSelectedRanges: [moment.Moment, moment.Moment | null][]) => {
              setSelectedRanges(givenSelectedRanges);
              // close the modal
              setShowChooseEnterAndExitDaysCalendarModal(false);
              // open up 'confirm reserve details bottom sheet'
              setShowConfirmReserveDetailsBottomSheet({
                show: true,
                payload: {
                  openingConfirmReserveBottomSheetFromObservePage: false,
                },
              });
            }}
          />
        )}

        <BottomSheet
          open={!!showConfirmGuestInfoForReserveBottomSheet.show}
          handleClose={() => setShowConfirmGuestInfoForReserveBottomSheet(confirmGuestInfoInitV)}
          headerTitle={"اطلاعات مهمان"}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ConfirmGuestInfoForReserveBottomSheet
                handleSmoothClose={handleSmoothClose}
                onTapOfReturnBtn={() => {
                  handleSmoothClose();

                  setTimeout(() => {
                    setShowConfirmReserveDetailsBottomSheet({
                      show: true,
                      payload: {
                        openingConfirmReserveBottomSheetFromObservePage: true,
                      },
                    });
                  }, 200);
                }}
                guestName={showConfirmGuestInfoForReserveBottomSheet.payload.name}
                guestPhoneNumber={showConfirmGuestInfoForReserveBottomSheet.payload.phoneNumber}
                onFormSubmit={(newGuestName: string) => {
                  setGuestInfo((prev) => ({
                    ...prev,
                    name: newGuestName,
                  }));
                  handleSmoothClose();

                  setTimeout(() => {
                    setShowConfirmReserveDetailsBottomSheet({
                      show: true,
                      payload: {
                        openingConfirmReserveBottomSheetFromObservePage: true,
                      },
                    });
                  }, 200);
                }}
              />
            );
          }}
        />

        <BottomSheet
          open={showGuestWantsToCancelBottomSheet}
          handleClose={() => setShowGuestWantsToCancelBottomSheet(false)}
          headerTitle="دلیل لغو رزرو"
          body={({ handleSmoothClose }) => {
            return (
              <GuestWantsToCancelBottomSheet
                handleSmoothClose={handleSmoothClose}
                reserveId={Number(router?.query?.id as string)}
              />
            );
          }}
        />

        {/* {!!showSendAltersList && (
          <SendAltersListModal
            isModalOpen={showSendAltersList}
            handleClose={() => setShowSendAltersList(false)}
            // handleAfterSelect={() => setShowCitiesListModal(true)}
            // selectedProvince={selectedProvince}
            reserveId={Number(router?.query?.id as string)}
          />
        )} */}

        <BottomSheet
          open={showApplyDiscountBottomSheet}
          handleClose={() => setShowApplyDiscountBottomSheet(false)}
          headerTitle="کد تخفیف"
          body={({ handleSmoothClose }) => {
            return (
              <ApplyDiscountBottomSheet
                handleSmoothClose={handleSmoothClose}
                reserveId={reserveInfo?.id as number}
              />
            );
          }}
        />

        {!!showResidenceCancelReserveRulesModal && (
          <ResidenceCancelReserveRulesModal
            isModalOpen={showResidenceCancelReserveRulesModal}
            handleClose={() => setShowResidenceCancelReserveRulesModal(false)}
            // data={{
            // title: reserveInfo?.product?.cancel_rule || "",
            // title: "مقررات لغو رزرو اقامتگاه ها",
            // fullReturnTime: reserveInfo?.product.full_return_time || 0,
            // fullReturnTime: 72,
            // beforeStartTime: reserveInfo?.product.before_start_time || 0,
            // hostShareTotalAmount: reserveInfo?.product.host_share_total_amount || 0,
            // hostSharePastNights: reserveInfo?.product.host_share_past_nights || 0,
            // hostShareFutureNights: reserveInfo?.product.host_share_future_nights || 0,
            // }}
          />
        )}
      </div>

      <div className="hidden md:block mt-[84px]">
        <Footer />
      </div>
    </>
  );
}

export default MyTripDetails;
