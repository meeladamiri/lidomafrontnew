import dynamic from "next/dynamic";
import moment from "moment-jalaali";
import { Button } from "../../../General/core/Button";
import BillHeader from "../common/BillHeader";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import { useSuitPropertyPageData } from "@/providers/SuitPropertyPage";
import SuitBillCounter from "./SuitBillCounter";
import { useRouter } from "next/router";
import { useGetCalendarData } from "Hooks/ObserveResidence/useGetCalendarData";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { useEffect } from "react";
import { removeQueryParametersWithoutScrolling } from "@/utilities/URL/removeQueryParametersWithoutScrolling";
const SuitBillCheckout = dynamic(() => import("./SuitBillCheckout"), {
  ssr: true,
});
const DoubleCalendar = dynamic(() => import("@/components/Calendar/DoubleCalendar"), {
  ssr: false,
});

function SuitBillAndReserveSettingsPaper() {
  const { query } = useRouter();
  const router = useRouter();

  const {
    selectedRanges,
    setSelectedRanges,
    showDoubleCalendar,
    setShowDoubleCalendar,
    dateToWorkWith,
    setDateToWorkWith,
    checkoutData,
    checkoutTotal,
    submitReserve,
    setNumberOfPeople,
  } = useSuitPropertyPageData();

  const { data } = useGetObserveResidence();

  const resp: IObserveResidenceData = data?.params;
  const average_rating = resp?.residence_info.average_rating;
  const discount = resp?.residence_info.price_details.discount;
  const original_price = resp?.residence_info.price_details.original_price;
  const reviews_count = resp?.residence_info.reviews_count;
  const min_reservable_days = resp?.residence_info?.min_reservable_days || 1;
  const noCoOperation = resp?.residence_info.is_full;

  const { data: calendarData } = useGetCalendarData({
    residenceOrRoomId: Number(query?.id),
    residenceType: ResidenceTypes_enum.PRODUCT, // bcz we are in suit
  });

  function clearCalendarFilterFromUrlFilters() {
    removeQueryParametersWithoutScrolling(router, [{ paramKey: "start" }, { paramKey: "end" }]);
  }

  useEffect(() => {
    if (!!router?.query?.start && !!router?.query?.end) {
      setSelectedRanges([
        [
          moment(router?.query?.start, "jYYYY/jMM/jDD"),
          moment(router?.query?.end, "jYYYY/jMM/jDD"),
        ],
      ]);
    }
    if (!!router?.query?.guests_count) {
      setNumberOfPeople(Number(router?.query?.guests_count));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end]);

  return (
    <div className="sticky top-[95px] z-2 py-24 px-24 rounded-20 border-1 border-solid border-gray-CACFD3">
      <BillHeader
        average_rating={average_rating}
        discount={discount}
        original_price={original_price}
        reviews_count={reviews_count}
      />

      <div className="relative pr-16 pl-8 py-10 border-1 border-solid border-gray-CACFD3 rounded-8 h-[70px]">
        <div
          className="grid grid-cols-2 cursor-pointer h-full"
          onClick={() => setShowDoubleCalendar(true)}
        >
          <div className={`col-span-1 flex items-center justify-between pl-8`}>
            <div className="flex items-center gap-x-8">
              <i className="icon-Calendar text-24 text-black" />

              <div>
                <p className="text-12 leading-16 text-gray-959FA7 font-l">تاریخ ورود</p>
                {selectedRanges.length === 1 && !!selectedRanges[0][0] && (
                  <p className="text-16 leading-24 text-black font-r mt-8">
                    {selectedRanges[0][0].format("jYYYY/jMM/jDD")}
                  </p>
                )}
              </div>
            </div>

            {selectedRanges.length === 1 && !!selectedRanges[0][0] && (
              <div
                onClick={(e) => {
                  // e.stopPropagation();
                  // e.preventDefault();

                  setSelectedRanges((prev) => {
                    // lets reset the 'selectedRanges' array;
                    return [];
                  });
                  clearCalendarFilterFromUrlFilters();
                }}
                className="flex items-center justify-center w-28 h-28 rounded-full bg-gray-F4F5F6 cursor-pointer"
              >
                <i className="icon-Plus text-20 text-black rotate-45" />
              </div>
            )}
          </div>
          <div className="col-span-1 flex items-center justify-between border-r-1 border-solid border-r-gray-CACFD3 pr-16">
            <div className="flex items-center gap-x-8">
              <i className="icon-Calendar text-24 text-black" />

              <div>
                <p className="text-12 leading-16 text-gray-959FA7 font-l">تاریخ خروج</p>
                {selectedRanges.length === 1 && !!selectedRanges[0][1] && (
                  <p className="text-16 leading-24 text-black font-r mt-8">
                    {selectedRanges[0][1].format("jYYYY/jMM/jDD")}
                  </p>
                )}
              </div>
            </div>

            {selectedRanges.length === 1 && !!selectedRanges[0][1] && (
              <div
                onClick={(e) => {
                  // e.stopPropagation();
                  // e.preventDefault();

                  setSelectedRanges((prev) => {
                    return [[prev[0][0], null]];
                  });
                  clearCalendarFilterFromUrlFilters();
                }}
                className="flex items-center justify-center w-28 h-28 rounded-full bg-gray-F4F5F6 cursor-pointer"
              >
                <i className="icon-Plus text-20 text-black rotate-45" />
              </div>
            )}
          </div>
        </div>

        {showDoubleCalendar && !!calendarData && calendarData?.params && (
          <div className="absolute -top-1 -left-26 w-[773px] z-1">
            <DoubleCalendar
              showDoubleCalendar={showDoubleCalendar}
              setShowDoubleCalendar={setShowDoubleCalendar}
              selectedRanges={selectedRanges}
              setSelectedRanges={setSelectedRanges}
              dateToWorkWith={dateToWorkWith}
              setDateToWorkWith={setDateToWorkWith}
              min_reservable_days={min_reservable_days || 1}
              discounted_days={calendarData?.params?.discounted_days}
              fast_days={calendarData?.params?.fast_days}
              filled_dates={calendarData?.params?.filled_dates}
              noCoOperation={noCoOperation}
              peak_dates={calendarData?.params?.peak_dates}
              reserved_dates={calendarData?.params?.reserved_dates}
              special_dates={calendarData?.params?.special_dates}
              prices={calendarData?.params?.prices}
              canOnlySelectOneRange={true}
              checkForAlreadyReservedDatesOrFilledDatesValidity
              onDaySelectCb={() => {
                if (!!router?.query?.start && !!router?.query?.end) {
                  clearCalendarFilterFromUrlFilters();
                }
              }}
            />
          </div>
        )}
      </div>

      <SuitBillCounter />

      <div className="mt-16 mb-16">
        <Button isFullWidth onClick={submitReserve}>
          <p>
            درخواست رزرو
            <span className="text-12 font-r mr-4">(رایگان)</span>
          </p>
        </Button>
      </div>

      <div>
        {selectedRanges.length === 1 &&
          !!selectedRanges[0][1] &&
          // !!numberOfPeople &&
          !!checkoutData &&
          !!checkoutTotal && <SuitBillCheckout />}
      </div>
    </div>
  );
}

export default SuitBillAndReserveSettingsPaper;
