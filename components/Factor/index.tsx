import { getReserve, IReserveDetails } from "@/api/Reserves";
import { ReserveDetailsCheckout_enum } from "@/constants/enums/reserve_details_checkout";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { WithFullname, WithKeyValue } from "../General/Checkout";
import { Button } from "../General/core/Button";
import FactorDesign from "./FactorDesign";
import { miladiToJalali } from "@/utilities/dateTools";
import moment from "moment-jalaali";
import html2canvas from "html2canvas";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";

function FactorIndex() {
  const componentRef = useRef<any>(null);
  const router = useRouter();
  const [reserveInfo, setReserveInfo] = useState<IReserveDetails["order_details"]>();
  const [checkoutData, setCheckoutData] = useState<(WithFullname | WithKeyValue)[]>();
  const [checkoutTotal, setCheckoutTotal] = useState<number>(0);
  const [reserveTotalDiscountAmount, setReserveTotalDiscountAmount] = useState<number>(0);
  // const [getReserveInfoFromApi, setGetReserveInfoFromApi] = useState<boolean>(false);
  // const downloadImage = async () => {
  //   const dataUrl = await htmlToImage.toJpeg(componentRef.current, {
  //     quality: 1,
  //     cacheBust: true,
  //     canvasWidth: 1920,
  //     canvasHeight: 1320,
  //   });

  //   // download image
  //   const link = document.createElement("a");
  //   link.download = `فاکتور-رزرو-${reserveInfo?.product.name}.jpeg`;
  //   link.href = dataUrl;
  //   link.target = "_blank";
  //   link.click();

  //   // After the download completes, open the image in a new tab/window
  //   // setGetReserveInfoFromApi(false);
  //   var newTab = window.open();
  //   if (!!newTab) {
  //     newTab.document.body.innerHTML = '<img src="' + dataUrl + '" alt="Downloaded Image">';
  //   }
  // };

  const handleDownloadImage = async () => {
    const element = document.getElementById("factorElement")!,
      canvas = await html2canvas(element, {
        allowTaint: true,
        removeContainer: true,
        backgroundColor: null,
        imageTimeout: 15000,
        logging: true,
        scale: 2,
        useCORS: true,
      }),
      data = canvas.toDataURL("image/png"),
      link = document.createElement("a");

    link.href = data;
    link.download = "downloaded-image.png";

    document.body.appendChild(link);
    link.click();
    var newTab = window.open();
    if (!!newTab) {
      newTab.document.body.innerHTML = '<img src="' + data + '" alt="Downloaded Image">';
    }
    document.body.removeChild(link);
  };

  const { isLoading, data } = useQuery(
    ["getReserve", router?.query?.id],
    () => getReserve(+(router?.query?.id as string)),
    {
      enabled: !!router?.query?.id,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const reserveData: IReserveDetails = data?.params;

        setReserveInfo(reserveData.order_details);

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
      }
    }
  }, [data, reserveInfo?.extra_guests_count]);

  // function handleDownloadImage() {
  //   htmlToImageConvert();
  // }

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden bg-white pt-[80px] md:pt-[90px]">
      <div
        className="p-40 w-[310px] rounded-20 flex flex-col items-center gap-y-24 -translate-y-1/4"
        style={{
          background: "linear-gradient(180deg, #D9FFFB 0%, rgba(217, 255, 251, 0) 100%)",
        }}
      >
        <Image src="/assets/non-icomoon-icons/PDF.svg" width={56} height={56} alt="" />

        <div className="text-20 leading-36 font-m text-black">
          جهت دریافت فاکتور رزرو بر روی دکمه زیر کلیک کنید
        </div>

        <Button
          onClick={() => {
            // setGetReserveInfoFromApi(true);
            if (!!reserveInfo && !!checkoutData && !!checkoutTotal) {
              exception.message([
                {
                  type: EXCEPTIONTYPES.INFO,
                  title: "فاکتور شما در حال آماده شدن میباشد. لطفا کمی صبر کنید.",
                },
              ]);

              handleDownloadImage();
            }
          }}
          disabled={!!isLoading}
          // disabled={getReserveInfoFromApi}
          // isLoading={getReserveInfoFromApi}
          // loadingText="در حال دریافت اطلاعات فاکتور"
        >
          {!!isLoading ? "درحال دریافت اطلاعات فاکتور" : "دریافت فاکتور"}
        </Button>
      </div>

      {!!reserveInfo && !!checkoutData && !!checkoutTotal && (
        <div
          style={{
            // display: "none",
            // visibility: "hidden",
            width: "1707px",
            height: "1318px",
          }}
          className="fixed left-0 right-0 z-[-1] bottom-0 translate-y-full"
        >
          <FactorDesign
            ref={(el: any) => (componentRef.current = el)}
            data={{
              reserveCode: reserveInfo?.reference as string,
              entranceDate: miladiToJalali(reserveInfo?.start_date),
              entranceDay: moment(reserveInfo?.start_date, "YYYY-MM-DD").format("dddd"),
              exitDate: miladiToJalali(reserveInfo?.end_date),
              exitDay: moment(reserveInfo?.end_date, "YYYY-MM-DD").format("dddd"),
              mainGuestsN: reserveInfo?.guests_count,
              extraGuestsN: reserveInfo?.extra_guests_count,
              duration: reserveInfo?.days_count,
              checkoutData: checkoutData,
              checkoutTotal: checkoutTotal,
              reserveTotalDiscountAmount: reserveTotalDiscountAmount,
              guestCommission: reserveInfo?.guest_commission,
              remainingAmount: reserveInfo?.remaining_amount || 0,
              paidAmount: reserveInfo?.paid_amount || 0,
              hostName: reserveInfo?.host.name,
              hostPhone: reserveInfo?.host.phone as string,
              hostImage: reserveInfo?.host.avatar_url,
              guestName: reserveInfo?.guest.name,
              guestPhone: reserveInfo?.guest.phone || "",
              guestImage: reserveInfo?.guest.avatar_url,
              resImage: reserveInfo?.product.image_url,
              resName: reserveInfo?.product.name,
              roomName:
                reserveInfo?.product.display_type === "suit"
                  ? undefined
                  : reserveInfo?.rooms[0].name, // optional
              province: reserveInfo?.product.province,
              city: reserveInfo?.product.city,
              fullAddress: reserveInfo?.product.address,
              resLat: reserveInfo?.product.latitude,
              resLong: reserveInfo?.product.longitude,
              bedRoomsN: reserveInfo?.product.rooms_count,
              bedsN: reserveInfo?.product.beds_count,
              standardCapacity: reserveInfo?.product.capacity,
              maxCapacity: reserveInfo?.product.max_capacity,
              rules: [
                {
                  icon: <i className="icon-BirthCertificate text-24 text-black" />,
                  text:
                    reserveInfo?.product?.rules.find(
                      (el) =>
                        el.category === "مقررات اقامتگاه" &&
                        el.name === "همراه داشتن مدارک محرمیت الزامیست"
                    )?.value === "بله"
                      ? "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی است."
                      : // "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی نیست."
                        "",
                },
                {
                  icon: <i className="icon-Timer text-24 text-black" />,
                  text:
                    !!reserveInfo?.product.checkin_from && !!reserveInfo?.product.checkin_to
                      ? ` زمان تحویل از ${reserveInfo?.product.checkin_from} تا ${reserveInfo?.product.checkin_to}`
                      : "",
                },
                {
                  icon: <i className="icon-Timer text-24 text-black" />,
                  text: !!reserveInfo?.product.checkout
                    ? `زمان تخلیه : ${reserveInfo?.product.checkout}`
                    : "",
                },
                {
                  icon: (
                    <Image
                      src="/assets/non-icomoon-icons/panje.svg"
                      width={24}
                      height={24}
                      alt=""
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                  ),
                  text:
                    reserveInfo?.product?.rules.find(
                      (el) =>
                        el.category === "مقررات اقامتگاه" &&
                        el.name === "ورود حیوان خانگی مجاز می باشد."
                    )?.value === "بله"
                      ? ""
                      : "آوردن حیوانات خانگی به این اقامتگاه ممنوع است.",
                },
                {
                  icon: (
                    <Image
                      src="/assets/non-icomoon-icons/smoke.svg"
                      width={24}
                      height={24}
                      alt=""
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                  ),
                  text:
                    reserveInfo?.product?.rules.find(
                      (el) =>
                        el.category === "مقررات اقامتگاه" &&
                        el.name === "استعمال دخانیات مجاز می باشد"
                    )?.value === "بله"
                      ? ""
                      : "استعمال دخانیات مجاز نمی باشد",
                },
                {
                  icon: (
                    <Image
                      src="/assets/non-icomoon-icons/celebration.svg"
                      width={24}
                      height={24}
                      alt=""
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                  ),
                  text:
                    reserveInfo?.product?.rules.find(
                      (el) =>
                        el.category === "مقررات اقامتگاه" &&
                        el.name === "برگزاری مراسم مجاز می باشد."
                    )?.value === "بله"
                      ? ""
                      : "برگزاری مراسم مجاز نمی باشد",
                },
                {
                  icon: (
                    <Image
                      src="/assets/non-icomoon-icons/group_off.svg"
                      width={24}
                      height={24}
                      alt=""
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                  ),
                  text:
                    reserveInfo?.product?.rules.find(
                      (el) =>
                        el.category === "مقررات اقامتگاه" &&
                        el.name === "پذیرش مهمان در هر ساعت از شبانه روز"
                    )?.value === "بله"
                      ? ""
                      : "امکان پذیرش گروه های مجردی فراهم نمی باشد",
                },
                {
                  icon: <i className="icon-Reserve text-24 text-black" />,
                  text: !!reserveInfo?.product?.min_reservable_days
                    ? `حداقل تعداد روز رزرو این اقامتگاه ${reserveInfo?.product?.min_reservable_days} روز است`
                    : "",
                },
              ],
              cancelReserveTitle: reserveInfo?.product.cancel_rule,
              before_start_time: Number(reserveInfo?.product.before_start_time),
              full_return_time: Number(reserveInfo?.product.full_return_time),
              host_share_future_nights: Number(reserveInfo?.product.host_share_future_nights),
              host_share_past_nights: Number(reserveInfo?.product.host_share_past_nights),
              host_share_total_amount: Number(reserveInfo?.product.host_share_total_amount),
            }}
          />
        </div>
      )}
    </div>
  );
}
export default FactorIndex;
