import { getPeakDays } from "./calendar/getPeakDays";
import { NormalWeekDays_abbr, WeekEnds_abbr } from "@/constants/WeekEnds";
import { getNumberOfDaysFromD1ToD2BothInclusive } from "./dateTools";
import moment, { Moment } from "moment-jalaali";
import { I_CheckoutData } from "@/interfaces/PropertyPages/Boomgardi/CheckoutData";

interface I_CalendarData_For_Calculating_CheckoutData {
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
  prices: {
    extra_guests_price: number;
    monthly_discount: number;
    peak_price: number;
    week_price: number;
    weekend_price: number;
    weekly_discount: number;
  };
  special_dates: [
    string, // date
    number // price
  ][];
}

export interface ICalculateCheckoutData {
  serverCalendarData: I_CalendarData_For_Calculating_CheckoutData;
  theRangeSelected: [moment.Moment, moment.Moment | null];
  numberOfPeople: number;
  baseCapacity: number;
  extraGuestUnitPrice: number;
  discountedDays: {
    date: Moment;
    amount: number; // in percentage
  }[];
}

export function getManuallyCalculatedCheckoutData({
  serverCalendarData,
  theRangeSelected,
  numberOfPeople,
  baseCapacity,
  extraGuestUnitPrice,
  discountedDays,
}: ICalculateCheckoutData) {
  const monthly_discount = serverCalendarData.prices.monthly_discount;
  const weekly_discount = serverCalendarData.prices.weekly_discount;

  const startDate = theRangeSelected[0];
  const endDate = theRangeSelected?.[1] as moment.Moment;

  const numberOfDaysFromD1ToD2BothInclusive = getNumberOfDaysFromD1ToD2BothInclusive(
    startDate,
    endDate
  );

  const numberOfNights = numberOfDaysFromD1ToD2BothInclusive - 1; // bcz number of nights is important

  let _sum_of_alldays_prices_without_discount = 0;

  // SUM OF PRICES CONSIDERING DISCOUNTS
  let _sum_of_special_dates_prices = 0;
  let _sum_of_peak_dates_prices = 0;
  let _sum_of_normal_week_days_prices = 0;
  let _sum_of_weekend_days_prices = 0;

  // DIFFERENT DAYS TOTAL DISCOUNT AMOUNTS
  let special_days_total_discount_amount = 0;
  let peak_days_total_discount_amount = 0;
  let weekends_total_discount_amount = 0;
  let normaldays_total_discount_amount = 0;

  // DIFFERENT DAYS COUNT
  let peakDatesN = 0;
  let weekEndDatesN = 0;
  let weekDatesN = 0;

  // DISCOUNTED DAYS COUNT FOR EACH CATEGORY
  let n_of_discounted_special_days = 0;
  let n_of_discounted_peak_days = 0;
  let n_of_discounted_weekends = 0;
  let n_of_discounted_normaldays = 0;

  const specialDatesData: I_CheckoutData["specialDatesData"] = {};

  const pointer = startDate.clone();
  while (pointer.isBefore(endDate)) {
    const formattedVersionOfDay = pointer.format("YYYY-MM-DD");
    const pointerDate_abbr = pointer.format("dd");

    const isSpecialDate = serverCalendarData.special_dates.find(
      (el) => el[0] === formattedVersionOfDay
    );

    const isPeakDate = getPeakDays(serverCalendarData.peak_dates).find(
      (el) => el.format("YYYY-MM-DD") === formattedVersionOfDay
    );

    if (!!isSpecialDate) {
      const specialdate_date = isSpecialDate[0];
      const specialdate_pure_price = isSpecialDate[1];

      const specialDate_momentVersion = moment(specialdate_date, "YYYY-MM-DD");

      const specialDateHasDiscount = discountedDays?.find((el) =>
        el.date.isSame(specialDate_momentVersion)
      );

      // console.log(
      //   "specialDateHasDiscount",
      //   specialDateHasDiscount?.date.format("jYYYY/jMM/jDD"),
      //   specialDateHasDiscount?.amount
      // );

      _sum_of_alldays_prices_without_discount =
        _sum_of_alldays_prices_without_discount + specialdate_pure_price;

      if (!!specialDateHasDiscount) {
        const amount_of_discount = specialdate_pure_price * (specialDateHasDiscount.amount / 100);

        const special_date_price_with_discount = specialdate_pure_price - amount_of_discount;

        _sum_of_special_dates_prices =
          _sum_of_special_dates_prices + special_date_price_with_discount;

        special_days_total_discount_amount =
          special_days_total_discount_amount + amount_of_discount;

        n_of_discounted_special_days = n_of_discounted_special_days + 1;

        specialDatesData[specialdate_pure_price] = !!specialDatesData[specialdate_pure_price]
          ? {
              n_of_discounted_nights:
                specialDatesData[specialdate_pure_price].n_of_discounted_nights + 1,
              repeated_frequency: specialDatesData[specialdate_pure_price].repeated_frequency + 1,
            }
          : {
              n_of_discounted_nights: 1,
              repeated_frequency: 1,
            };
      } else {
        const special_date_price_with_no_discount = specialdate_pure_price;
        _sum_of_special_dates_prices =
          _sum_of_special_dates_prices + special_date_price_with_no_discount;

        specialDatesData[specialdate_pure_price] = !!specialDatesData[specialdate_pure_price]
          ? {
              n_of_discounted_nights:
                specialDatesData[specialdate_pure_price].n_of_discounted_nights, // no change
              repeated_frequency: specialDatesData[specialdate_pure_price].repeated_frequency + 1,
            }
          : {
              n_of_discounted_nights: 0,
              repeated_frequency: 1,
            };
      }
    } else if (!!isPeakDate) {
      peakDatesN = peakDatesN + 1;

      const peakDateHasDiscount = discountedDays?.find((el) => el.date.isSame(isPeakDate));
      const peak_date_pure_price = serverCalendarData.prices.peak_price || 0;

      _sum_of_alldays_prices_without_discount =
        _sum_of_alldays_prices_without_discount + peak_date_pure_price;

      if (!!peakDateHasDiscount) {
        // peak_days_total_discount_amount
        const amount_of_discount = peak_date_pure_price * (peakDateHasDiscount.amount / 100);

        const peak_date_price_with_discount = peak_date_pure_price - amount_of_discount;

        _sum_of_peak_dates_prices = _sum_of_peak_dates_prices + peak_date_price_with_discount;

        peak_days_total_discount_amount = peak_days_total_discount_amount + amount_of_discount;

        n_of_discounted_peak_days = n_of_discounted_peak_days + 1;
      } else {
        const peak_date_price_with_no_discount = peak_date_pure_price;
        _sum_of_peak_dates_prices = _sum_of_peak_dates_prices + peak_date_price_with_no_discount;
      }
    } else if (WeekEnds_abbr.includes(pointerDate_abbr)) {
      weekEndDatesN = weekEndDatesN + 1;

      const weekendDateHasDiscount = discountedDays?.find((el) => el.date.isSame(pointer.clone()));
      const weekend_date_pure_price = serverCalendarData.prices.weekend_price || 0;

      _sum_of_alldays_prices_without_discount =
        _sum_of_alldays_prices_without_discount + weekend_date_pure_price;

      if (!!weekendDateHasDiscount) {
        const amount_of_discount = weekend_date_pure_price * (weekendDateHasDiscount.amount / 100);

        const weekend_date_price_with_discount = weekend_date_pure_price - amount_of_discount;

        _sum_of_weekend_days_prices =
          _sum_of_weekend_days_prices + weekend_date_price_with_discount;

        weekends_total_discount_amount = weekends_total_discount_amount + amount_of_discount;

        n_of_discounted_weekends = n_of_discounted_weekends + 1;
      } else {
        const weekend_date_price_with_no_discount = weekend_date_pure_price;
        _sum_of_weekend_days_prices =
          _sum_of_weekend_days_prices + weekend_date_price_with_no_discount;
      }
    } else if (NormalWeekDays_abbr.includes(pointerDate_abbr)) {
      weekDatesN = weekDatesN + 1;

      const normalweekDateHasDiscount = discountedDays?.find((el) =>
        el.date.isSame(pointer.clone())
      );
      const normalweek_date_pure_price = serverCalendarData.prices.week_price || 0;

      _sum_of_alldays_prices_without_discount =
        _sum_of_alldays_prices_without_discount + normalweek_date_pure_price;

      if (!!normalweekDateHasDiscount) {
        const amount_of_discount =
          normalweek_date_pure_price * (normalweekDateHasDiscount.amount / 100);

        const normalweek_date_price_with_discount = normalweek_date_pure_price - amount_of_discount;

        _sum_of_normal_week_days_prices =
          _sum_of_normal_week_days_prices + normalweek_date_price_with_discount;

        normaldays_total_discount_amount = normaldays_total_discount_amount + amount_of_discount;

        n_of_discounted_normaldays = n_of_discounted_normaldays + 1;
      } else {
        const normalweek_date_price_with_no_discount = normalweek_date_pure_price;
        _sum_of_normal_week_days_prices =
          _sum_of_normal_week_days_prices + normalweek_date_price_with_no_discount;
      }
    }

    // console.log("results after one loop: ", {
    //   _sum_of_special_dates_prices,
    //   _sum_of_peak_dates_prices,
    //   _sum_of_normal_week_days_prices,
    //   _sum_of_weekend_days_prices,
    // });

    pointer.add(1, "day");
  }

  // console.log("while loop ended: ", {
  //   _sum_of_special_dates_prices,
  //   _sum_of_peak_dates_prices,
  //   _sum_of_normal_week_days_prices,
  //   _sum_of_weekend_days_prices,
  // });

  // console.log("serverCalendarData", serverCalendarData);

  const total_price_tmp =
    _sum_of_normal_week_days_prices +
    // weekDatesN * (serverCalendarData.prices.week_price || 0) +
    _sum_of_weekend_days_prices +
    // weekEndDatesN * (serverCalendarData.prices.weekend_price || 0) +
    _sum_of_peak_dates_prices +
    // peakDatesN * (serverCalendarData.prices.peak_price || 0);
    _sum_of_special_dates_prices;

  // console.log("total_price_tmp", total_price_tmp);

  const allExtraPeoplesPrice =
    numberOfPeople > baseCapacity
      ? (numberOfPeople - baseCapacity) * extraGuestUnitPrice * numberOfNights
      : 0;

  const price_to_calculate_weeklyORmonthly_discount_with =
    _sum_of_alldays_prices_without_discount + allExtraPeoplesPrice;

  // console.log("allExtraPeoplesPrice", allExtraPeoplesPrice);

  const calculatedCheckoutTotal = total_price_tmp + allExtraPeoplesPrice;

  // console.log("calculatedCheckoutTotal", calculatedCheckoutTotal);

  const monthlyDiscountAmount =
    !!monthly_discount && numberOfNights > 29
      ? price_to_calculate_weeklyORmonthly_discount_with * (monthly_discount / 100)
      : 0;

  // console.log("monthlyDiscountAmount", monthlyDiscountAmount);

  let weeklyDiscountAmount = 0;

  if (monthlyDiscountAmount === 0) {
    weeklyDiscountAmount =
      !!weekly_discount &&
      !!theRangeSelected?.[0] &&
      !!theRangeSelected?.[1] &&
      numberOfNights >= 7 &&
      numberOfNights <= 29
        ? price_to_calculate_weeklyORmonthly_discount_with * (weekly_discount / 100)
        : 0;
  }

  // console.log("weeklyDiscountAmount", weeklyDiscountAmount);

  const finalCalculatedCheckoutTotal =
    calculatedCheckoutTotal - monthlyDiscountAmount - weeklyDiscountAmount;

  // console.log("finalCalculatedCheckoutTotal", finalCalculatedCheckoutTotal);

  const checkoutPaperData = {
    specialDatesData,
    peakDatesN,
    peakDatesUnitPrice: serverCalendarData.prices.peak_price || 0,
    weekEndDatesN,
    weekEndDatesUnitPrice: serverCalendarData.prices.weekend_price || 0,
    weekDatesN,
    weekDatesUnitPrice: serverCalendarData.prices.week_price || 0,
    extraGuestsN: numberOfPeople > baseCapacity ? numberOfPeople - baseCapacity : 0,
    extraGuestsUnitPrice: numberOfNights * extraGuestUnitPrice,
  };

  return {
    finalCalculatedCheckoutTotal,
    monthlyDiscountAmount,
    weeklyDiscountAmount,
    checkoutPaperData,
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
  };
}
