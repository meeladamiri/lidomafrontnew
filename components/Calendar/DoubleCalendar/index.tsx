import { IServerCalendarData, IServerCalendarData_discounted_day } from "@/api/Calendar/Calendar";
import moment from "moment-jalaali";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from "react";
import Calendar from "components/Calendar";
import OutsideClickHandler from "utilities/OutsideClickHandler";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";

moment.loadPersian({ dialect: "persian-modern" });
moment.locale("fa-IR");

interface IDoubleCalendar {
  showDoubleCalendar: boolean;
  setShowDoubleCalendar: Dispatch<SetStateAction<boolean>>;
  selectedRanges: [moment.Moment, moment.Moment | null][];
  setSelectedRanges: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  dateToWorkWith: moment.Moment;
  setDateToWorkWith: Dispatch<SetStateAction<moment.Moment>>;
  filled_dates: IServerCalendarData["filled_dates"][];
  reserved_dates: IServerCalendarData["reserved_dates"][];
  peak_dates: IServerCalendarData["peak_dates"];
  fast_days: IServerCalendarData["fast_days"][];
  discounted_days: IServerCalendarData_discounted_day[];
  special_dates: IServerCalendarData["special_dates"];
  prices: IServerCalendarData["prices"];
  min_reservable_days?: number;
  onlyShowCalendarDateNumber?: boolean;
  canOnlySelectOneRange?: boolean;
  onSelectOfRangeEndCb?: () => void;
  outsideClickHandlerExceptionRefs?: MutableRefObject<any>[];
  showHeader?: boolean;
  containerClassname?: string;
  componentHasOutsideClickHandler?: boolean;
  bottomActions?: JSX.Element;
  checkForAlreadyReservedDatesOrFilledDatesValidity?: boolean;
  noCoOperation: boolean;
  canOnlySelectOneDayWhenRangeIsDisabled?: boolean;
  onDaySelectCb?: () => void;
}

function DoubleCalendar({
  showDoubleCalendar,
  setShowDoubleCalendar,
  selectedRanges,
  setSelectedRanges,
  dateToWorkWith,
  setDateToWorkWith,
  filled_dates,
  reserved_dates,
  peak_dates,
  fast_days,
  discounted_days,
  special_dates,
  prices,
  min_reservable_days,
  onlyShowCalendarDateNumber = false,
  canOnlySelectOneRange = false,
  onSelectOfRangeEndCb,
  outsideClickHandlerExceptionRefs,
  showHeader = true,
  containerClassname,
  componentHasOutsideClickHandler = true,
  bottomActions,
  checkForAlreadyReservedDatesOrFilledDatesValidity = false,
  noCoOperation,
  canOnlySelectOneDayWhenRangeIsDisabled = false,
  onDaySelectCb,
}: IDoubleCalendar) {
  const [isRangeEnabled, setIsRangeEnabled] = useState<boolean>(true);

  const [isFirstRenderOfComp, setIsFirstRenderOfComp] = useState(true);

  useEffect(() => {
    if (
      !isFirstRenderOfComp &&
      !!selectedRanges &&
      selectedRanges.length === 1 &&
      !!selectedRanges[0][1]
    ) {
      setShowDoubleCalendar(false);

      if (!!onSelectOfRangeEndCb) {
        onSelectOfRangeEndCb();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRanges]);

  useEffect(() => {
    setIsFirstRenderOfComp(false);
  }, []);

  return (
    <OutsideClickHandler
      handleClick={() => {
        if (!!componentHasOutsideClickHandler) {
          setShowDoubleCalendar(false);
        }
      }}
      exceptionElementsRef={outsideClickHandlerExceptionRefs || []}
    >
      <div
        className={`
          w-full bg-white shadow-[0px_8px_32px_rgba(24,39,58,0.15)] rounded-20 p-24
          ${containerClassname || ""}
        `}
      >
        {!!showHeader && (
          <div className="flex items-end justify-between mb-40">
            <div>
              <p className="text-20 leading-28 text-black font-m mb-20">انتخاب تاریخ رزرو</p>

              {!!min_reservable_days && (
                <p className="flex items-center gap-x-8">
                  <span className="text-12 leading-16 text-black font-r">حداقل روز رزرو :</span>
                  <span className="text-14 leading-20 text-black font-r">
                    {min_reservable_days} روز
                  </span>
                </p>
              )}
            </div>

            <div className="border-1 border-solid border-gray-CACFD3 rounded-8 h-68 w-[388px] grid grid-cols-2">
              <div
                className={`
                col-span-1 pl-12 pr-16 py-8 flex items-center justify-between
                ${selectedRanges.length === 0 ? "border-1 border-solid border-black rounded-8" : ""}
              `}
              >
                <div className="flex items-center gap-x-10">
                  <i className="icon-Calendar text-24 text-black" />

                  <div className="">
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
                    onClick={() =>
                      setSelectedRanges((prev) => {
                        // lets reset the 'selectedRanges' array;
                        return [];
                      })
                    }
                    className="flex items-center justify-center w-28 h-28 rounded-full bg-gray-F4F5F6 cursor-pointer"
                  >
                    <i className="icon-Plus text-20 text-black rotate-45" />
                  </div>
                )}
              </div>

              <div
                className={`
                col-span-1 pl-12 pr-16 py-8 flex items-center justify-between
                ${
                  selectedRanges.length === 1 && !selectedRanges[0][1]
                    ? "border-1 border-solid border-black rounded-8"
                    : ""
                }
              `}
              >
                <div className="flex items-center gap-x-10">
                  <i className="icon-Calendar text-24 text-black" />

                  <div className="">
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
                    onClick={() =>
                      setSelectedRanges((prev) => {
                        return [[prev[0][0], null]];
                      })
                    }
                    className="flex items-center justify-center w-28 h-28 rounded-full bg-gray-F4F5F6 cursor-pointer"
                  >
                    <i className="icon-Plus text-20 text-black rotate-45" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-16">
          <div className="col-span-1">
            {/* {!!calendarData && calendarData?.params && ( */}
            <Calendar
              dateToWorkWith={dateToWorkWith.clone()}
              // setDateToWorkWith={setDateToWorkWith}
              onMonthInc={() => {
                setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
              }}
              onMonthDec={() => {
                setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
              }}
              // initialDateToWorkWith={initialDateToWorkWith}
              filledDays={filled_dates?.map((filled_date: IServerCalendarData["filled_dates"]) =>
                moment(filled_date, "YYYY-M-D")
              )}
              noCoOperation={noCoOperation}
              alreadyReservedDays={reserved_dates.map(
                (reserved_date: IServerCalendarData["reserved_dates"]) =>
                  moment(reserved_date, "YYYY-M-D")
              )}
              minReservableDays={min_reservable_days}
              offDays={[]} // TODO
              peakDays={getPeakDays(peak_dates)}
              fastReserveDays={fast_days?.map((fast_day: IServerCalendarData["fast_days"]) =>
                moment(fast_day, "YYYY-M-D")
              )}
              discounted_days={discounted_days?.map(
                (discounted_day: IServerCalendarData_discounted_day) => ({
                  ...discounted_day,
                  date: moment(discounted_day.date, "YYYY-M-D"),
                })
              )}
              special_dates={special_dates?.map((special_date) => {
                return [moment(special_date[0], "YYYY-M-D"), special_date[1]];
              })}
              prices={prices}
              isRangeEnabled={isRangeEnabled}
              // SELECTING Props
              selectedRanges={selectedRanges}
              setSelectedRanges={setSelectedRanges}
              // selectedIndividualDays={selectedIndividualDays}
              // setSelectedIndividualDays={setSelectedIndividualDays}
              showNavigateToPrevMonthBtn={true}
              showNavigateToNextMonthBtn={false}
              onlyShowCalendarDateNumber={onlyShowCalendarDateNumber}
              canOnlySelectOneRange={canOnlySelectOneRange}
              checkForAlreadyReservedDatesOrFilledDatesValidity={
                checkForAlreadyReservedDatesOrFilledDatesValidity
              }
              onDaySelectCb={onDaySelectCb}
            />
            {/* //   )} */}
          </div>

          <div className="col-span-1">
            {/* {!!calendarData && calendarData?.params && ( */}
            <Calendar
              // initialDateToWorkWith={initialDateToWorkWith.add(1, "jMonth")}
              dateToWorkWith={dateToWorkWith.clone().add(1, "jMonth")}
              // setDateToWorkWith={setDateToWorkWith}
              onMonthInc={() => {
                setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
              }}
              onMonthDec={() => {
                setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
              }}
              filledDays={filled_dates?.map((filled_date: IServerCalendarData["filled_dates"]) =>
                moment(filled_date, "YYYY-M-D")
              )}
              noCoOperation={noCoOperation}
              alreadyReservedDays={reserved_dates.map(
                (reserved_date: IServerCalendarData["reserved_dates"]) =>
                  moment(reserved_date, "YYYY-M-D")
              )}
              minReservableDays={min_reservable_days}
              offDays={[]} // TODO
              // peakDays={peak_dates?.map((peak_date: IServerCalendarData["peak_dates"]) =>
              //   moment(peak_date, "YYYY-M-D")
              // )}
              peakDays={getPeakDays(peak_dates)}
              fastReserveDays={fast_days?.map((fast_day: IServerCalendarData["fast_days"]) =>
                moment(fast_day, "YYYY-M-D")
              )}
              discounted_days={discounted_days?.map(
                (discounted_day: IServerCalendarData_discounted_day) => ({
                  ...discounted_day,
                  date: moment(discounted_day.date, "YYYY-M-D"),
                })
              )}
              special_dates={special_dates?.map((special_date) => [
                moment(special_date[0], "YYYY-M-D"),
                special_date[1],
              ])}
              prices={prices}
              isRangeEnabled={isRangeEnabled}
              // SELECTING Props
              selectedRanges={selectedRanges}
              setSelectedRanges={setSelectedRanges}
              // selectedIndividualDays={selectedIndividualDays}
              // setSelectedIndividualDays={setSelectedIndividualDays}
              showNavigateToPrevMonthBtn={false}
              showNavigateToNextMonthBtn={true}
              onlyShowCalendarDateNumber={onlyShowCalendarDateNumber}
              canOnlySelectOneRange={canOnlySelectOneRange}
              checkForAlreadyReservedDatesOrFilledDatesValidity={
                checkForAlreadyReservedDatesOrFilledDatesValidity
              }
              onDaySelectCb={onDaySelectCb}
            />
            {/* )} */}
          </div>
        </div>

        {!!bottomActions && <div>{bottomActions}</div>}
      </div>
    </OutsideClickHandler>
  );
}
export default DoubleCalendar;
