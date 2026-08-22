import Checkout from "@/components/General/Checkout";
import { useSuitPropertyPageData } from "@/providers/SuitPropertyPage";

function SuitBillCheckout() {
  const {
    checkoutData,
    checkoutTotal,
    monthlyDiscountAmount,
    weeklyDiscountAmount,
    discountedDaysStatistics,
    discountAmounts,
  } = useSuitPropertyPageData();

  return (
    <>
      <Checkout
        data={[
          {
            label: "روزهای وسط هفته : ",
            numberOfDiscountedDays: discountedDaysStatistics.n_of_discounted_normaldays,
            valueOfKey: checkoutData?.weekDatesN || 0,
            key: "شب",
            per: checkoutData?.weekDatesUnitPrice || 0,
            total: (checkoutData?.weekDatesN || 0) * (checkoutData?.weekDatesUnitPrice || 0),
          },
          {
            label: "روزهای آخر هفته : ",
            numberOfDiscountedDays: discountedDaysStatistics.n_of_discounted_weekends,
            valueOfKey: checkoutData?.weekEndDatesN || 0,
            key: "شب",
            per: checkoutData?.weekEndDatesUnitPrice || 0,
            total: (checkoutData?.weekEndDatesN || 0) * (checkoutData?.weekEndDatesUnitPrice || 0),
          },
          {
            label: "روزهای ایام پیک : ",
            numberOfDiscountedDays: discountedDaysStatistics.n_of_discounted_peak_days,
            valueOfKey: checkoutData?.peakDatesN || 0,
            key: "شب",
            per: checkoutData?.peakDatesUnitPrice || 0,
            total: (checkoutData?.peakDatesN || 0) * (checkoutData?.peakDatesUnitPrice || 0),
          },
          ...Object.entries(checkoutData?.specialDatesData || {}).map((specialDate) => {
            return {
              label: "روزهـــای خـاص : ",
              valueOfKey: specialDate[1].repeated_frequency || 0,
              numberOfDiscountedDays: specialDate[1].n_of_discounted_nights || 0,
              key: "شب",
              per: Number(specialDate[0]) || 0,
              total: (Number(specialDate[0]) || 0) * (specialDate[1].repeated_frequency || 0),
            };
          }),
          {
            label: "نرخ نفر اضافه : ",
            valueOfKey: checkoutData?.extraGuestsN || 0,
            numberOfDiscountedDays: 0, // should be zero
            key: "نفر",
            per: checkoutData?.extraGuestsUnitPrice || 0,
            total: (checkoutData?.extraGuestsN || 0) * (checkoutData?.extraGuestsUnitPrice || 0),
          },
          // {
          //   label: "تخفیف میزبان : ",
          //   fullValue: !!hostDiscountData?.host_discount
          //     ? `${hostDiscountData?.host_discount} هزار تومان`
          //     : "",
          // },
          {
            label: "تخفیف رزرو هفتگی : ",
            fullValue: !!weeklyDiscountAmount
              ? `${weeklyDiscountAmount?.toLocaleString("en-US")} تومان`
              : "",
          },
          {
            label: "تخفیف رزرو ماهانه : ",
            fullValue: monthlyDiscountAmount
              ? `${monthlyDiscountAmount?.toLocaleString("en-US")} تومان`
              : "",
          },
          // {
          //   label: "تخفیف سایت : ",
          //   fullValue: !!websiteDiscountData?.website_discount
          //     ? `${websiteDiscountData?.website_discount} هزار تومان`
          //     : "",
          // },
          // {
          //   label: "کد تخفیف : ",
          //   fullValue: !!couponDiscountData?.coupon_discount
          //     ? `${couponDiscountData?.coupon_discount} هزار تومان`
          //     : "",
          // },
        ]}
        total={checkoutTotal}
        //
        // special_days_total_discounted={discountAmounts.special_days_total_discount_amount}
        // peak_days_total_discounted={discountAmounts.peak_days_total_discount_amount}
        // weekends_total_discounted={discountAmounts.weekends_total_discount_amount}
        // normaldays_total_discounted={discountAmounts.normaldays_total_discount_amount}
        //
        n_of_discounted_special_days={discountedDaysStatistics.n_of_discounted_special_days}
        n_of_discounted_peak_days={discountedDaysStatistics.n_of_discounted_peak_days}
        n_of_discounted_weekends={discountedDaysStatistics.n_of_discounted_weekends}
        n_of_discounted_normaldays={discountedDaysStatistics.n_of_discounted_normaldays}
        //
        totalDiscountAmount={
          discountAmounts.special_days_total_discount_amount +
          discountAmounts.peak_days_total_discount_amount +
          discountAmounts.weekends_total_discount_amount +
          discountAmounts.normaldays_total_discount_amount +
          monthlyDiscountAmount +
          weeklyDiscountAmount
        }
      />
    </>
  );
}

export default SuitBillCheckout;
