import Checkout, { WithFullname, WithKeyValue } from "components/General/Checkout";
import BottomSheet from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import Divider from "components/General/Divider";
import PageTitle from "components/General/PageTitle";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReserveCart from "components/Reservations/ReserveCart";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cancelReasons,
  getReserve,
  getStateCorresponding,
  IReserveDetails,
  IReserveDetailsFAQ,
  rejectReasons,
  unDiscountTheCodeDiscount,
} from "api/Reserves";
import { useRouter } from "next/router";
import { ReserveDetailsCheckout_enum } from "constants/enums/reserve_details_checkout";
import FAQs from "./FAQs";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import moment from "moment-jalaali";
import { miladiToJalali } from "utilities/dateTools";
import { useUserProfile } from "providers/Profile";
import CancelReserveAfterBeingFinalizedBottomSheet from "./CancelReserveAfterBeingFinalizedBottomSheet";
import Timeline from "./Timeline";
import { ReserveStates_enum } from "constants/enums/reserve_states";
import CancelReserveBeforeBeingFinalizedBottomSheet from "./CancelReserveBeforeBeingFinalizedBottomSheet";
import Image from "next/image";
import { getTimeDiff } from "@/utilities/Time";
import DownloadFactor from "./DownloadFactor";
import GuestWantsToCancelBottomSheet from "./GuestWantsToCancelBottomSheet";
import ConfirmReserveBottomSheet from "./ConfirmReserveBottomSheet";
import RejectReserveWithReasonBottomSheet from "./RejectReserveWithReasonBottomSheet";
import { ReservesCancel_enum } from "@/constants/enums/reserves_cancel";
import SendAltersListModal from "./SendAltersListModal";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import Footer from "@/layouts/Footer";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Link from "next/link";
import { canShowContact, CONTACT_WINDOW_NOTE } from "@/utilities/tripWindow";

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

function ReservationDetails() {
  const router = useRouter();
  const [reserveInfo, setReserveInfo] = useState<IReserveDetails["order_details"]>();
  const [checkoutData, setCheckoutData] = useState<(WithFullname | WithKeyValue)[]>();
  const [checkoutTotal, setCheckoutTotal] = useState<number>(0);
  const [FAQData, setFAQData] = useState<IReserveDetailsFAQ[]>([]);
  const profileData = useUserProfile();
  const [reserveTotalDiscountAmount, setReserveTotalDiscountAmount] = useState<number>(0);
  // map
  const [userLat, setUserLat] = useState<number>();
  const [userLang, setUserLang] = useState<number>();

  /**
   * May this host see the guest's number?
   *
   * The same rule the guest's side uses about the host's number, from the same
   * function — one arrangement, one answer. This page used to decide by asking
   * whether the field had arrived (`guest.phone || "*********09"`), which is
   * not a rule at all: it leans on the server happening to withhold it, so the
   * day a query starts selecting the column the mask lifts everywhere at once,
   * silently. The backend does withhold it correctly today; that is what makes
   * this the kind of bug nobody notices until it is already live.
   */
  const guestPhoneVisible = canShowContact(reserveInfo?.state, reserveInfo?.end_date);

  const timerRef = useRef<any>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [showGuestWantsToCancelBottomSheet, setShowGuestWantsToCancelBottomSheet] =
    useState<boolean>(false);

  const [showRejectReserveBottomSheet, setShowRejectReserveBottomSheet] = useState<boolean>(false);
  const [showConfirmReserveBottomSheet, setShowConfirmReserveBottomSheet] =
    useState<boolean>(false);

  const [showSendAltersList, setShowSendAltersList] = useState<boolean>(false);

  const [showApplyDiscountBottomSheet, setShowApplyDiscountBottomSheet] = useState<boolean>(false);

  const [
    showCancelReserveBeforeBeingFinalizedBottomSheet,
    setShowCancelReserveBeforeBeingFinalizedBottomSheet,
  ] = useState(false);
  const [
    showCancelReserveAfterBeingFinalizedBottomSheet,
    setShowCancelReserveAfterBeingFinalizedBottomSheet,
  ] = useState(false);

  const profile = useUserProfile();

  const { isLoading, isSuccess, data, refetch } = useQuery(
    ["getReserve", router?.query?.id],
    () => {
      return getReserve(+(router?.query?.id as string));
    },
    {
      enabled: !!router?.query?.id,
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
          (normalWeekDaysData?.weekdays || 0) * (normalWeekDaysData?.unit_price || 0) +
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
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data, reserveInfo?.extra_guests_count]);

  useEffect(() => {
    if (!!reserveInfo?.expiry_date) {
      timerRef.current = setInterval(() => {
        // Already a "...Z"-terminated ISO string — see MyTripDetails/index.tsx
        // for why appending a second one breaks the parse.
        const diff = getTimeDiff(Date.now(), new Date(reserveInfo?.expiry_date || "").getTime());

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

  return isLoading ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pt-84 md:pt-[115px] CustomContainer">
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

            {/* The same section in Mobile and Desktop */}
            <div>
              <div className="pb-16 md:hidden">
                {!!reserveInfo && (
                  <ReserveCart
                    isFromDetailsPage={true}
                    state={reserveInfo?.state}
                    residenceName={reserveInfo?.product.name}
                    reserveCode={reserveInfo?.reference}
                    hostIncome={reserveInfo?.host_share}
                    startDate={miladiToJalali(reserveInfo?.start_date)}
                    endDate={miladiToJalali(reserveInfo?.end_date)}
                    mainGuestsN={reserveInfo?.guests_count}
                    extraGuestsN={reserveInfo?.extra_guests_count}
                    reserveId={reserveInfo?.id}
                    residenceId={reserveInfo?.product.id}
                    residenceImage={`${reserveInfo?.product.image_url}`}
                    expiryDate={reserveInfo?.expiry_date}
                    voucherUrl={reserveInfo?.voucher_url}
                    cancelledBy={reserveInfo?.cancelled_by}
                    cancelDesc={reserveInfo?.cancel_desc}
                    cancelReason={reserveInfo?.cancel_reason}
                    suggestedResidencesList={reserveInfo?.alters || []}
                    coordinatedWith={reserveInfo?.coordinated_with}
                    setShowSendAltersList={setShowSendAltersList}
                    residenceCity={reserveInfo?.product.city}
                    displayType={reserveInfo.product.display_type}
                  />
                )}
              </div>

              {/* Always in Desktop */}
              <div className="hidden md:block px-4 pb-24 border-b-1 border-solid border-b-gray-CACFD3 mb-24">
                <div className="flex flex-col items-center">
                  {!!statusInfo?.iconPathInDesktop && (
                    <Image src={statusInfo?.iconPathInDesktop} width={48} height={48} alt="" />
                  )}

                  <p className={`text-20 leading-28 font-m mt-4 mb-16 ${statusInfo?.textColor}`}>
                    {statusInfo?.name}
                  </p>

                  <p className="text-error-light">
                    {(
                      rejectReasons.find((el) => el.key === reserveInfo?.cancel_desc) ||
                      cancelReasons.find((el) => el.key === reserveInfo?.cancel_reason)
                    )?.text ||
                      reserveInfo?.cancel_desc ||
                      reserveInfo?.cancel_reason}
                  </p>

                  <p className="text-14 leading-20 font-l text-black mb-24 text-center">
                    {statusInfo?.stateDescription_ForHost}
                  </p>

                  {(reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ||
                    reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT) &&
                    !!reserveInfo?.expiry_date && (
                      <>
                        <p className="text-14 leading-20 font-r text-black mb-12">
                          مهلت پاسخ به این درخواست
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

                  {reserveInfo?.state === ReserveStates_enum.DONE && (
                    <div className="grow md:w-[318px] mt-16">
                      <DownloadFactor reserveId={reserveInfo.id} endDate={reserveInfo.end_date} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!!checkoutTotal && (
              <div className="md:hidden">
                <Divider />
                <div className="py-16">
                  <Checkout
                    data={checkoutData || []}
                    total={checkoutTotal}
                    n_of_discounted_special_days={0}
                    n_of_discounted_peak_days={0}
                    n_of_discounted_weekends={0}
                    n_of_discounted_normaldays={0}
                    totalDiscountAmount={reserveTotalDiscountAmount}
                    hostShare={data?.params?.order_details?.host_share}
                    websiteShare={data?.params?.order_details?.website_share}
                    guestCommission={data?.params?.order_details?.guest_commission}
                    // vatAmount={data?.params?.order_details?.vat_amount}
                  />
                </div>
              </div>
            )}

            {/* Always in Desktop */}
            <div className="hidden md:block pb-24 border-b-1 border-solid border-b-gray-CACFD3 mb-24">
              <div className="mb-16">
                <CreateInfo
                  icon={<i className="icon-Calendar text-24 text-black" />}
                  title="تاریخ سفر"
                  desc={`${miladiToJalali(reserveInfo?.start_date)} تا ${miladiToJalali(
                    reserveInfo?.end_date
                  )}`}
                />
              </div>

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
                  desc={`${reserveInfo?.guest.name} ${
                    guestPhoneVisible ? reserveInfo?.guest.phone : "*********09"
                  }`}
                />
              </div>
            </div>

            <Divider className="md:hidden" />

            <div className="py-24 md:!pt-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3 md:mb-24">
              <PageTitle
                icon={<i className="icon-Profile text-20" />}
                title={"مشخصات مهمان"}
                containerClassname="mb-24"
              />

              <div className="flex items-center gap-x-24">
                <div className="flex items-center gap-x-12">
                  <i className="icon-GuestProfile text-18" />
                  <p className="text-14 text-black leading-18">{reserveInfo?.guest.name}</p>
                </div>
                <div className="flex items-center gap-x-12">
                  <i className="icon-Phone text-18" />
                  <p className="text-14 text-black leading-18">
                    {guestPhoneVisible ? reserveInfo?.guest.phone : "*********09"}
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
                <div className="mt-18 md:mt-24 md:max-w-[224px]">
                  {/*
                    `canShowContact`, not `state === DONE`. The state alone
                    left the guest's number reachable from a قطعی booking for
                    ever, while the guest's own page dropped the host's number
                    a day after checkout — the same arrangement, two different
                    expiries, and the one that never expired was the guest's.
                  */}
                  {guestPhoneVisible ? (
                    <>
                      <LinkButton
                        href={`tel:${reserveInfo?.guest.phone}`}
                        color="secondary"
                        isFullWidth
                        rightIcon={<i className="icon-Phone text-24" />}
                      >
                        تماس با مهمان
                      </LinkButton>

                      <p className="text-11 leading-18 text-gray-959FA7 mt-8 text-center">
                        تماس با مهمان {CONTACT_WINDOW_NOTE}
                      </p>
                    </>
                  ) : (
                    <LinkButton
                      href={
                        reserveInfo?.conversation_public_id
                          ? `/chats?c=${reserveInfo.conversation_public_id}`
                          : "/chats"
                      }
                      color="secondary"
                      isFullWidth
                      rightIcon={<i className="icon-message text-24" />}
                    >
                      چت آنلاین با مهمان
                    </LinkButton>
                  )}
                </div>
              )}
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
            {!!profileData.is_host &&
              (reserveInfo?.state === ReserveStates_enum.SECOND_PAYMENT ||
                (reserveInfo?.state === ReserveStates_enum.DONE &&
                  new (moment as any)().isBefore(
                    new (moment as any)(reserveInfo?.start_date)
                  ))) && (
                <>
                  <Divider />
                  <div className="py-24">
                    <PageTitle
                      icon={<i className="text-20 icon-Error" />}
                      title="لغو رزرو"
                      containerClassname="mb-24"
                    />

                    <div className="p-16 border-1 border-dashed border-black rounded-10">
                      <p className="text-12 leading-30 text-zilgara mb-24">
                        در صورت نیاز شما می توانید با فشردن دکمه زیر, درخواست رزرو تایید شده خود را
                        &quot;لغو&quot; کنید. توجه داشته باشید, با توجه به تاثیر منفی رد درخواست
                        رزرو, بر میهمانان لیدوما, در صورت رد چند درخواست رزرو بصورت متوالی,
                        جریمه‌هایی همانند غیر فعال شدن نمایه اقامتگاه و کاهش رتبه نمایش در صفحه
                        جستجو به حساب کاربری شما اعمال خواهد شد.
                      </p>

                      <Button
                        color="error"
                        variant="outlined"
                        isFullWidth
                        onClick={() => {
                          if (reserveInfo.state === ReserveStates_enum.SECOND_PAYMENT) {
                            setShowCancelReserveBeforeBeingFinalizedBottomSheet(true);
                          } else {
                            setShowCancelReserveAfterBeingFinalizedBottomSheet(true);
                          }
                        }}
                      >
                        لغو رزرو
                      </Button>
                    </div>
                  </div>
                </>
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

                  <div className="flex items-center gap-x-4 mb-24">
                    <p className="text-14 leading-20 font-l text-black">کد رزرو :</p>
                    <p className="text-16 leading-24 font-r text-black">{reserveInfo?.reference}</p>
                  </div>

                  <LinkButton
                    rounded
                    color="black"
                    rightIcon={<i className="icon-See text-16" />}
                    className="!bg-black bg-gradient-0 opacity-80"
                    styles={{ backgroundImage: "none" }}
                    href={getPropertyPageUrl({
                      residenceId: reserveInfo?.product.id as number,
                    })}
                  >
                    مشاهده اقامتگاه
                  </LinkButton>
                </div>
              </div>

              <div className="mb-24">
                <Checkout
                  data={checkoutData || []}
                  total={checkoutTotal}
                  n_of_discounted_special_days={0}
                  n_of_discounted_peak_days={0}
                  n_of_discounted_weekends={0}
                  n_of_discounted_normaldays={0}
                  totalDiscountAmount={reserveTotalDiscountAmount}
                  hostShare={data?.params?.order_details?.host_share}
                  websiteShare={data?.params?.order_details?.website_share}
                  guestCommission={data?.params?.order_details?.guest_commission}
                  // vatAmount={data?.params?.order_details?.vat_amount}
                />
              </div>

              <div>
                {reserveInfo?.state === ReserveStates_enum.HOST_APPROVAL ? (
                  <div className="grid grid-cols-2 gap-x-16">
                    <Button
                      isFullWidth
                      className="!px-8"
                      variant="outlined"
                      color="error"
                      onClick={() => setShowRejectReserveBottomSheet(true)}
                    >
                      رد درخواست
                    </Button>
                    <Button
                      isFullWidth
                      className="!px-8"
                      onClick={() => setShowConfirmReserveBottomSheet(true)}
                    >
                      تأیید درخواست
                    </Button>
                  </div>
                ) : reserveInfo?.state ===
                  ReserveStates_enum.SECOND_PAYMENT ? null : guestPhoneVisible ? (
                  // The sticky bar and the block above have to close together;
                  // this one used to read `state === DONE` on its own and so
                  // outlived the number it dials by an unbounded amount.
                  <LinkButton
                    href={`tel:${reserveInfo?.guest.phone}`}
                    // color="secondary"
                    isFullWidth
                    // rightIcon={<i className="icon-Phone text-24" />}
                  >
                    تماس با مهمان
                  </LinkButton>
                ) : reserveInfo?.state === ReserveStates_enum.EXPIRED ||
                  (ReserveStates_enum.CANCEL &&
                    reserveInfo?.cancelled_by === ReservesCancel_enum.HOST_CANCELLED) ? (
                  // {/* NOTE: We "only" have 'پیشنهاد اقامتگاه جایگزین' when the "host" has cancelled the reserve */}
                  <Button
                    isFullWidth
                    // href={`/residences/suggest/${reserveInfo?.id}`}
                    disabled={!!reserveInfo?.alters && !!reserveInfo?.alters.length}
                    onClick={() => setShowSendAltersList(true)}
                  >
                    {!!reserveInfo?.alters && !!reserveInfo?.alters.length
                      ? `${reserveInfo?.alters.length} پیشنهاد جایگزین ارسال شد`
                      : "پیشنهاد اقامتگاه جایگزین"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <BottomSheet
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
        />

        <BottomSheet
          open={showCancelReserveAfterBeingFinalizedBottomSheet}
          handleClose={() => setShowCancelReserveAfterBeingFinalizedBottomSheet(false)}
          headerTitle="لغو رزرو قطعی شده"
          body={({ handleSmoothClose }) => {
            return (
              <CancelReserveAfterBeingFinalizedBottomSheet
                handleSmoothClose={handleSmoothClose}
                hostIsCancelling={true}
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

        <BottomSheet
          open={showConfirmReserveBottomSheet}
          handleClose={() => setShowConfirmReserveBottomSheet(false)}
          headerTitle="تأیید درخواست"
          body={({ handleSmoothClose }) => {
            return (
              <ConfirmReserveBottomSheet
                handleSmoothClose={handleSmoothClose}
                reserveId={reserveInfo?.id as number}
              />
            );
          }}
        />

        <BottomSheet
          open={showRejectReserveBottomSheet}
          handleClose={() => setShowRejectReserveBottomSheet(false)}
          headerTitle="علت رد درخواست"
          body={({ handleSmoothClose }) => {
            return (
              <RejectReserveWithReasonBottomSheet
                handleSmoothClose={handleSmoothClose}
                reasonsList={rejectReasons}
                reserveId={reserveInfo?.id as number}
              />
            );
          }}
        />

        {!!showSendAltersList && (
          <SendAltersListModal
            isModalOpen={showSendAltersList}
            handleClose={() => setShowSendAltersList(false)}
            // handleAfterSelect={() => setShowCitiesListModal(true)}
            // selectedProvince={selectedProvince}
            reserveId={Number(router?.query?.id as string)}
          />
        )}

        {/* <BottomSheet
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
      /> */}
      </div>

      <div className="hidden md:block mt-[84px]">
        <Footer />
      </div>
    </>
  );
}

export default ReservationDetails;
