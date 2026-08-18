import { useEffect, useState } from "react";
import moment from "moment-jalaali";
import dynamic from "next/dynamic";
import { Button } from "../../../General/core/Button";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import BillHeader from "../common/BillHeader";
// import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useRouter } from "next/router";
import { removeQueryParametersWithoutScrolling } from "@/utilities/URL/removeQueryParametersWithoutScrolling";
const BoomgardiBillCounter = dynamic(() => import("./BoomgardiBillCounter"), {
  ssr: true,
});
const BoomgardiBillCheckout = dynamic(() => import("../Boomgardi/BoomgardiBillCheckout"), {
  ssr: true,
});
const DoubleCalendar = dynamic(() => import("../../../Calendar/DoubleCalendar"), {
  ssr: false,
});

function BoomgardiBillAndReserveSettingsPaper() {
  const [showNumberOfPeopleAlert, setShowNumberOfPeopleAlert] = useState(false);

  const {
    selectedRanges,
    setSelectedRanges,
    showDoubleCalendar,
    setShowDoubleCalendar,
    dateToWorkWith,
    setDateToWorkWith,
    numberOfPeople,
    checkoutData,
    checkoutTotal,
    selectedRoomByUser,
    submitReserve,
  } = useBoomgardiPropertyPageData();

  const { data } = useGetObserveResidence();
  const router = useRouter();

  const resp: IObserveResidenceData = data?.params;
  const average_rating = resp?.residence_info.average_rating;
  const discount = resp?.residence_info.price_details.discount;
  const original_price = resp?.residence_info.price_details.original_price;
  const reviews_count = resp?.residence_info.reviews_count;
  const noCoOperation = resp?.residence_info.is_full;

  function handleReserveSubmit() {
    if (selectedRanges.length === 0 || (selectedRanges.length === 1 && !selectedRanges[0][1])) {
      setShowDoubleCalendar(true);
      return;
    } else if (selectedRanges.length === 1 && !!selectedRanges[0][1] && !selectedRoomByUser) {
      // Not sure what to do here. maybe Rezaeei will change here.
      setShowDoubleCalendar(true);
      return;
    } else if (selectedRanges.length === 1 && !!selectedRanges[0][1] && !!selectedRoomByUser) {
      // check if numberOfPeople is enetered.
      if (!numberOfPeople) {
        setShowNumberOfPeopleAlert(true);
      } else {
        //  submit the reserve request
        submitReserve();
      }
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end]);

  return (
    <div
      className={`
          sticky top-[95px] z-2 py-24 px-24 rounded-20 border-1 border-solid border-gray-CACFD3
          transition-all duration-75
          ${
            selectedRanges.length === 1 && !!selectedRanges?.[0]?.[1] && !selectedRoomByUser
              ? "opacity-30"
              : ""
          }
          ${showDoubleCalendar ? "opacity-100" : ""}
          hover:opacity-100
        `}
    >
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

        {!!showDoubleCalendar && (
          <div className="absolute -top-1 -left-26 w-[773px] z-1">
            <DoubleCalendar
              showDoubleCalendar={showDoubleCalendar}
              setShowDoubleCalendar={setShowDoubleCalendar}
              selectedRanges={selectedRanges}
              setSelectedRanges={setSelectedRanges}
              dateToWorkWith={dateToWorkWith}
              setDateToWorkWith={setDateToWorkWith}
              discounted_days={[]}
              fast_days={[]}
              filled_dates={[]}
              noCoOperation={noCoOperation}
              peak_dates={[]}
              reserved_dates={[]}
              special_dates={[]}
              prices={{
                extra_guests_price: 0,
                monthly_discount: 0,
                peak_price: 0,
                week_price: 0,
                weekend_price: 0,
                weekly_discount: 0,
              }}
              canOnlySelectOneRange={true}
              onlyShowCalendarDateNumber
              onSelectOfRangeEndCb={() => {
                // scroll to rooms listing section
                const roomsListingSection = document.querySelector("#rooms-listing-section");
                roomsListingSection?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              onDaySelectCb={() => {
                if (!!router?.query?.start && !!router?.query?.end) {
                  clearCalendarFilterFromUrlFilters();
                }
              }}
            />
          </div>
        )}
      </div>

      {selectedRanges.length === 1 && !!selectedRanges?.[0]?.[1] && !!selectedRoomByUser && (
        <BoomgardiBillCounter
          showNumberOfPeopleAlert={showNumberOfPeopleAlert}
          setShowNumberOfPeopleAlert={setShowNumberOfPeopleAlert}
        />
      )}

      <div className="mt-16 mb-16">
        <Button isFullWidth onClick={handleReserveSubmit}>
          {selectedRanges.length === 0 ||
          (selectedRanges.length === 1 && !selectedRanges[0][1]) ||
          (selectedRanges.length === 1 && !!selectedRanges[0][1] && !selectedRoomByUser) ? (
            "مشاهده اتاق های موجود"
          ) : (
            <p>
              درخواست رزرو
              <span className="text-12 font-r mr-4">(رایگان)</span>
            </p>
          )}
        </Button>
      </div>

      {/* checkout */}
      <div>
        {selectedRanges.length === 1 &&
          !!selectedRanges[0][1] &&
          // !!numberOfPeople &&
          !!selectedRoomByUser &&
          !!checkoutData &&
          !!checkoutTotal && <BoomgardiBillCheckout />}
      </div>
    </div>
  );
}

export default BoomgardiBillAndReserveSettingsPaper;
