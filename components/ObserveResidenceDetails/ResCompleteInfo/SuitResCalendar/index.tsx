import { IServerCalendarData, IServerCalendarData_discounted_day } from "@/api/Calendar/Calendar";
import CalendarHelp from "@/components/Calendar/CalendarHelp";
import Divider from "@/components/General/Divider";
import SquareSkeleton from "@/components/General/Skeletons/Square";
import { Button } from "@/components/General/core/Button";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { useSuitPropertyPageData } from "@/providers/SuitPropertyPage";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useGetCalendarData } from "Hooks/ObserveResidence/useGetCalendarData";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import moment from "moment-jalaali";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { removeQueryParametersWithoutScrolling } from "@/utilities/URL/removeQueryParametersWithoutScrolling";
const DoubleCalendar = dynamic(() => import("@/components/Calendar/DoubleCalendar"), {
  ssr: false,
});
const Calendar = dynamic(() => import("@/components/Calendar"), {
  ssr: false,
});

function SuitResCalendar() {
  const { query } = useRouter();
  const router = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const { data } = useGetObserveResidence();
  const {
    selectedRanges,
    setSelectedRanges,
    showDoubleCalendar,
    setShowDoubleCalendar,
    dateToWorkWith,
    setDateToWorkWith,
  } = useSuitPropertyPageData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end]);

  return (
    <>
      <section id="suitResCalendar" className="pb-24">
        <header>
          <h2 className="text-16 leading-28 text-zilgara font-m mb-24">نرخ و تقویم</h2>
        </header>

        {!!calendarData && calendarData?.params ? (
          <>
            {!!isDesktop ? (
              <div className="hidden md:block">
                <DoubleCalendar
                  showDoubleCalendar={showDoubleCalendar}
                  setShowDoubleCalendar={setShowDoubleCalendar}
                  selectedRanges={selectedRanges}
                  setSelectedRanges={setSelectedRanges}
                  dateToWorkWith={dateToWorkWith}
                  setDateToWorkWith={setDateToWorkWith}
                  min_reservable_days={data?.params?.residence_info?.min_reservable_days || 1}
                  discounted_days={calendarData?.params?.discounted_days}
                  fast_days={calendarData?.params?.fast_days}
                  filled_dates={calendarData?.params?.filled_dates}
                  noCoOperation={data?.params?.residence_info?.is_full}
                  peak_dates={calendarData?.params?.peak_dates}
                  reserved_dates={calendarData?.params?.reserved_dates}
                  special_dates={calendarData?.params?.special_dates}
                  prices={calendarData?.params?.prices}
                  canOnlySelectOneRange={true}
                  showHeader={false}
                  containerClassname="!shadow-none !p-0 !rounded-none"
                  componentHasOutsideClickHandler={false}
                  checkForAlreadyReservedDatesOrFilledDatesValidity
                  onDaySelectCb={() => {
                    if (!!router?.query?.start && !!router?.query?.end) {
                      clearCalendarFilterFromUrlFilters();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="md:hidden">
                <Calendar
                  dateToWorkWith={dateToWorkWith.clone()}
                  // setDateToWorkWith={setDateToWorkWith}
                  onMonthInc={() => {
                    setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                  }}
                  onMonthDec={() => {
                    setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                  }}
                  filledDays={calendarData?.params?.filled_dates?.map(
                    (filled_date: IServerCalendarData["filled_dates"]) =>
                      moment(filled_date, "YYYY-M-D")
                  )}
                  noCoOperation={data?.params?.residence_info?.is_full}
                  alreadyReservedDays={calendarData?.params?.reserved_dates.map(
                    (reserved_date: IServerCalendarData["reserved_dates"]) =>
                      moment(reserved_date, "YYYY-M-D")
                  )}
                  offDays={[]} // TODO
                  peakDays={getPeakDays((calendarData?.params as IServerCalendarData)?.peak_dates)}
                  fastReserveDays={calendarData?.params?.fast_days?.map(
                    (fast_day: IServerCalendarData["fast_days"]) => moment(fast_day, "YYYY-M-D")
                  )}
                  discounted_days={calendarData?.params?.discounted_days?.map(
                    (discounted_day: IServerCalendarData_discounted_day) => ({
                      ...discounted_day,
                      date: moment(discounted_day.date, "YYYY-M-D"),
                    })
                  )}
                  special_dates={calendarData?.params?.special_dates?.map(
                    (special_date: IServerCalendarData["special_dates"]) => [
                      moment(special_date[0], "YYYY-M-D"),
                      special_date[1],
                    ]
                  )}
                  prices={calendarData?.params?.prices}
                  isRangeEnabled={true}
                  minReservableDays={data?.params?.residence_info?.min_reservable_days || 1}
                  // SELECTING Props
                  selectedRanges={selectedRanges}
                  setSelectedRanges={setSelectedRanges}
                  // selectedIndividualDays={selectedIndividualDays}
                  // setSelectedIndividualDays={setSelectedIndividualDays}
                  showNavigateToPrevMonthBtn={true}
                  showNavigateToNextMonthBtn={true}
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
          </>
        ) : (
          // skeleton
          <SquareSkeleton
            borderRadiusClass="rounded-4"
            heightClass="h-[409px]"
            widthClass="w-full"
          />
        )}

        <div className="flex items-center justify-between mt-16">
          <CalendarHelp />

          {selectedRanges.length === 1 && (
            //  && !!selectedRanges[0][1]
            <Button
              onClick={() => {
                setSelectedRanges([]);
                if (!!router?.query?.start && !!router?.query?.end) {
                  clearCalendarFilterFromUrlFilters();
                }
              }}
              color="grey"
            >
              پاک کردن
            </Button>
          )}
        </div>
      </section>

      <Divider className="mb-24" />
    </>
  );
}
export default SuitResCalendar;
