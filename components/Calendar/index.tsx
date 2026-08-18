import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { getAllUniqueSelectedDays_Array } from "@/utilities/calendar/getAllUniqueSelectedDays_Array";
import exception from "@/utilities/exception";
import { IServerCalendarData, IServerCalendarData_discounted_day } from "api/Calendar/Calendar";
import { WeekEnds_abbr } from "constants/WeekEnds";
import moment from "moment-jalaali";
import { Dispatch, SetStateAction, useState } from "react";
import {
  getFirstDayOfMonthInShamsiAbbr,
  getNumberOfDaysInMonth,
  miladiToJalaliFullYearNumberFullMonthname,
} from "utilities/dateTools";
import { jalaliDays } from "utilities/dateTools2";
import { CalendarItemBox } from "./CalendarItemBox";
import { isInvalidDateToBeChosen } from "@/utilities/calendar/isInvalidDateToBeChosen";
import { determineSelectability } from "@/utilities/calendar/determineSelectability";
// import { getHolidays } from "@/api/Calendar/getHolidays";
import { Months_Of_Year } from "@/constants/Months_Of_Year";

interface ICalendar {
  isRangeEnabled?: boolean;
  // initialDateToWorkWith?: Date | moment.Moment;
  dateToWorkWith: moment.Moment;
  setDateToWorkWith?: Dispatch<SetStateAction<moment.Moment>>;
  // setDateToWorkWith: Dispatch<SetStateAction<moment.Moment>>;
  onMonthInc?: () => void;
  onMonthDec?: () => void;
  filledDays: moment.Moment[];
  alreadyReservedDays: moment.Moment[];
  offDays: moment.Moment[];
  peakDays: moment.Moment[];
  fastReserveDays: moment.Moment[];
  discounted_days: {
    amount: IServerCalendarData_discounted_day["amount"];
    date: moment.Moment;
    discount_id: IServerCalendarData_discounted_day["discount_id"];
    type: IServerCalendarData_discounted_day["type"];
  }[];
  special_dates: [
    moment.Moment,
    number // price
  ][];
  // prices: {
  //   peak_price: number;
  //   week_price: number;
  //   weekend_price: number;
  // };
  prices: IServerCalendarData["prices"];
  // SELECTING Props
  selectedRanges?: [moment.Moment, moment.Moment | null][];
  setSelectedRanges?: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  selectedIndividualDays?: moment.Moment[];
  setSelectedIndividualDays?: Dispatch<SetStateAction<moment.Moment[]>>;
  canSelectDay?: boolean;
  showNavigateToPrevMonthBtn?: boolean;
  showNavigateToNextMonthBtn?: boolean;
  minReservableDays?: number;
  canOnlySelectOneRange?: boolean;
  onlyShowCalendarDateNumber?: boolean;
  checkForAlreadyReservedDatesOrFilledDatesValidity?: boolean;
  noCoOperation: boolean;
  aspectRatio1by1?: boolean;
  canSelectMonth?: boolean;
  color?: "primary" | "blue";
  rounded?: boolean;
  hasBorderDashed?: boolean;
  makeBgConsistentInSelectedRanges?: boolean;
  wrapperClassname?: string;
  canNavigateToAllPrevMonth?: boolean;
  canSelectPassedDay?: boolean;
  canOnlySelectOneDayWhenRangeIsDisabled?: boolean;
  onDaySelectCb?: () => void;
  showToday?: boolean;
}

function Calendar({
  isRangeEnabled,
  // initialDateToWorkWith,
  dateToWorkWith,
  setDateToWorkWith,
  onMonthInc,
  onMonthDec,
  filledDays,
  alreadyReservedDays,
  offDays,
  peakDays,
  fastReserveDays,
  discounted_days,
  special_dates,
  prices,
  // SELECTING Props
  selectedRanges,
  setSelectedRanges,
  selectedIndividualDays,
  setSelectedIndividualDays,
  canSelectDay = true,
  showNavigateToPrevMonthBtn = true,
  showNavigateToNextMonthBtn = true,
  minReservableDays,
  canOnlySelectOneRange,
  onlyShowCalendarDateNumber,
  checkForAlreadyReservedDatesOrFilledDatesValidity = false,
  noCoOperation,
  aspectRatio1by1,
  canSelectMonth = false,
  color = "primary",
  rounded = false,
  hasBorderDashed = true,
  makeBgConsistentInSelectedRanges = false,
  wrapperClassname,
  canNavigateToAllPrevMonth = false,
  canSelectPassedDay = false,
  canOnlySelectOneDayWhenRangeIsDisabled = false,
  onDaySelectCb,
  showToday = false,
}: ICalendar) {
  // NOTE: In this 'Calendar' component, all dates are in 'moment.Moment' type;
  //       We will stick to 'moment.Moment' in any part of it (props, state management, ...)

  const [dateKey, setDateKey] = useState(new Date());
  const [showMonthSelectBox, setShowMonthSelectBox] = useState<boolean>(false);

  function getMonthDaysList(date: moment.Moment): moment.Moment[] {
    const numberOfDaysInMonth = getNumberOfDaysInMonth(date);

    const firstDayOfTheMonth = moment(date).startOf("jMonth");

    const daysList: moment.Moment[] = [];
    daysList.push(firstDayOfTheMonth); // push first day of the month

    for (let day = 1; day < numberOfDaysInMonth; day++) {
      const cloned = firstDayOfTheMonth.clone();
      daysList.push(cloned.add(day, "day"));
    }

    return daysList;
  }

  // const { isSuccess: getHolidaysDataSuccess, isLoading: getHolidaysDataIsLoading } = useQuery(
  //   ["getHolidays", dateToWorkWith?.jYear()],
  //   () => {
  //     return getHolidays({
  //       year: dateToWorkWith?.jYear(),
  //     });
  //   },
  //   {
  //     onSuccess: (data) => {
  //       if (data?.status === "error") {
  //         exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
  //       } else {
  //         const ddd = data?.params;

  //         // setCalendarData(serverCalendarData);
  //       }
  //     },
  //     onError: (err) => {},
  //     enabled: !!dateToWorkWith,
  //   }
  // );

  return (
    <div className={`${wrapperClassname || ""}`}>
      {/* header */}
      <div className="mb-20">
        <div className="relative h-[49px] pb-8 mb-8 border-b-1 border-solid border-b-black">
          {!!showNavigateToPrevMonthBtn && (
            <div
              className={`
                absolute right-0 top-0 w-40 h-40 rounded-full
                border-1 border-solid border-black text-black
                flex items-center justify-center cursor-pointer
                ${
                  !canNavigateToAllPrevMonth
                    ? dateToWorkWith.diff(new Date(), "month") < 0
                      ? "opacity-40 !cursor-not-allowed pointer-events-none"
                      : ""
                    : ""
                }
              `}
              onClick={() => {
                // console.log(dateToWorkWith.subtract(1, "jMonth").format("jYYYY/jMM/jDD"));
                // setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                if (!!onMonthDec) {
                  onMonthDec();
                }
                setDateKey(new Date());
              }}
            >
              <i className="icon-FlashRight text-24" />
            </div>
          )}
          {canSelectMonth ? (
            <div
              className="cursor-pointer absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 flex gap-x-8 items-center"
              onClick={() => setShowMonthSelectBox(!showMonthSelectBox)}
            >
              <p className="text-15 leading-28 text-black font-m" key={dateKey.getTime()}>
                {miladiToJalaliFullYearNumberFullMonthname(dateToWorkWith)}
              </p>
              {showMonthSelectBox ? (
                <i className="icon-FlashUp text-24 text-black" />
              ) : (
                <i className="icon-FlashDown text-24 text-black" />
              )}
            </div>
          ) : (
            <p
              className="text-16 leading-28 text-black font-m absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"
              key={dateKey.getTime()}
            >
              {miladiToJalaliFullYearNumberFullMonthname(dateToWorkWith)}
            </p>
          )}
          {!!showNavigateToNextMonthBtn && (
            <div
              className="absolute left-0 top-0 w-40 h-40 rounded-full border-1 border-solid border-black flex items-center justify-center cursor-pointer"
              onClick={() => {
                // console.log(dateToWorkWith.subtract(1, "jMonth").format("jYYYY/jMM/jDD"));
                // setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                if (!!onMonthInc) {
                  onMonthInc();
                }
                setDateKey(new Date());
              }}
            >
              <i className="icon-FlashLeft text-24 text-black" />
            </div>
          )}
          {showMonthSelectBox && (
            <div className="bg-white grid grid-cols-2 gap-x-4 gap-y-20 absolute z-10 pb-[88px] pt-20 w-full top-[49px]">
              {Months_Of_Year.map((month, index) => (
                <p
                  onClick={() => {
                    setDateToWorkWith?.((prev) => {
                      return prev.clone().jMonth(index);
                    });
                    setShowMonthSelectBox(false);
                  }}
                  className="cursor-pointer text-14 text-gray-616E7C leading-20 font-r"
                  key={index}
                >
                  {month}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-x-4">
          {jalaliDays.map((jalaliDays, idx) => (
            <p key={jalaliDays.abbr_v} className="text-14 leading-24 text-black font-r text-center">
              {jalaliDays.abbr_v}
            </p>
          ))}
          {/* <p></p> */}
        </div>
      </div>

      {/* calendar */}
      <div>
        <div
          className={`
            grid grid-cols-7 gap-y-4
            ${!makeBgConsistentInSelectedRanges ? "gap-x-4" : ""}
          `}
        >
          {/* mapping empty days */}
          {Array.from({
            length:
              (jalaliDays.find((el) => el.abbr_v === getFirstDayOfMonthInShamsiAbbr(dateToWorkWith))
                ?.dayNumber as number) - 1,
          }).map((_, idx) => (
            <div key={idx} className="col-span-1"></div>
          ))}
          {/* mapping all days of the month */}
          {getMonthDaysList(dateToWorkWith).map((date: moment.Moment, idx: number) => {
            const isDiscounted_day = discounted_days.find((el) => el.date.isSame(date));

            const dayAbbr = date.format("dd");
            const isWeekEnd = WeekEnds_abbr.includes(dayAbbr);

            return (
              <div className="col-span-1" key={idx}>
                <CalendarItemBox
                  showToday={showToday}
                  canSelectPassedDay={canSelectPassedDay}
                  color={color}
                  rounded={rounded}
                  hasBorderDashed={hasBorderDashed}
                  // selectedTypeStyle={selectedTypeStyle}
                  // type={type}
                  dateNumber={idx + 1}
                  dateObjectItself={date}
                  isFastReserve={!!fastReserveDays.find((el) => el.isSame(date))}
                  isPeakDay={!!peakDays.find((el) => el.isSame(date))}
                  isOffDay={dayAbbr === "ج"} // TODO -- Waiting for backend response.
                  isAlreadyReserved={!!alreadyReservedDays.find((el) => el.isSame(date))}
                  isFilled={!!noCoOperation ? true : !!filledDays.find((el) => el.isSame(date))}
                  noCoOperation={noCoOperation}
                  isPassedDay={date.isBefore(new (moment as any)(), "day")}
                  isWeekEnd={isWeekEnd}
                  prices={prices}
                  onlyShowCalendarDateNumber={onlyShowCalendarDateNumber}
                  specialDateInfo={{
                    is: !!special_dates.find((el) => el[0].isSame(date)),
                    specialDay_price: special_dates.find((el) => el[0].isSame(date))?.[1] || 0,
                  }}
                  checkForAlreadyReservedDatesOrFilledDatesValidity={
                    checkForAlreadyReservedDatesOrFilledDatesValidity
                  }
                  isThisDatesPrevDateFilledOrReserved={
                    !!filledDays.find((el) => el.isSame(date.clone().subtract(1, "day"))) ||
                    !!alreadyReservedDays.find((el) => el.isSame(date.clone().subtract(1, "day")))
                  }
                  isThisDatesNextDateFilledOrReserved={
                    !!filledDays.find((el) => el.isSame(date.clone().add(1, "day"))) ||
                    !!alreadyReservedDays.find((el) => el.isSame(date.clone().add(1, "day")))
                  }
                  canBeSeleceted={
                    !!isRangeEnabled && selectedRanges?.length === 1 && !selectedRanges?.[0]?.[1]
                      ? determineSelectability(
                          selectedRanges[0][0],
                          date,
                          filledDays,
                          alreadyReservedDays
                        )
                      : true
                  }
                  // getImmediateFilledOrReservedDateOfSelecetdRangesFirstPoint={() => {
                  //   return immediateFilledOrReservedDateOfSelecetdRangesFirstPoint(
                  //     selectedRanges!?.[0]?.[0],
                  //     filledDays,
                  //     alreadyReservedDays
                  //   );
                  // }}
                  discountP={
                    !!isDiscounted_day
                      ? isDiscounted_day.type === "percentage"
                        ? isDiscounted_day.amount
                        : // Note: Backend never uses 'fixed_price' by the way;
                          0
                      : 0
                  }
                  // SELECTING Props
                  onclick={() => {
                    if (!!canSelectDay) {
                      if (isRangeEnabled) {
                        if (
                          !!canOnlySelectOneRange &&
                          selectedRanges?.length === 1 &&
                          !!selectedRanges[0][1]
                        ) {
                          // return;
                          // Create a range with its 'first day' being selected and its 'end day' is not yet selected;
                          setSelectedRanges?.([[date, null]]);
                        }

                        const incompleteRangeData = selectedRanges?.find(
                          (selectedRange) => selectedRange[1] === null
                        );

                        if (!!incompleteRangeData) {
                          // There is a range which its 'first day' is already selected and this ClickEvent should set this range's 'end day'

                          // Check if the 'selcted end day' isSameOrBefore the 'start day'
                          if (date.isSameOrBefore(incompleteRangeData[0])) {
                            // console.log("the 'selcted end day' isSameOrBefore the 'start day'");
                            return;
                          }

                          // check for checkForAlreadyReservedDatesOrFilledDatesValidity
                          if (
                            !!checkForAlreadyReservedDatesOrFilledDatesValidity &&
                            isInvalidDateToBeChosen(
                              incompleteRangeData[0],
                              date,
                              alreadyReservedDays,
                              filledDays
                            )
                          ) {
                            // exception.message([
                            //   {
                            //     title: "داخل بازه انتخابی، روز رزرو شده یا پرشده وجود دارد.",
                            //     type: EXCEPTIONTYPES.ERROR,
                            //   },
                            // ]);
                            return;
                          }

                          if (!!minReservableDays) {
                            // check for mimimum reservable days
                            // nOfDaysFromBeginingOfRangeTillEndOfRange (Both inclusively)
                            const nOfDaysFromBeginingOfRangeTillEndOfRange =
                              getAllUniqueSelectedDays_Array([], [[incompleteRangeData[0], date]]);

                            if (
                              nOfDaysFromBeginingOfRangeTillEndOfRange.length - 1 <
                              minReservableDays
                            ) {
                              exception.message([
                                {
                                  type: EXCEPTIONTYPES.ERROR,
                                  title: `حداقل روز قابل رزرو ${minReservableDays} روز می باشد.`,
                                },
                              ]);
                              return;
                            }
                          }

                          setSelectedRanges?.((prev) => {
                            const firstDayOfIncompleteRange = incompleteRangeData[0];
                            const fullRanges = prev.filter((range) => range[1] !== null);

                            return [...fullRanges, [firstDayOfIncompleteRange, date]];
                          });
                        } else {
                          if (
                            !!checkForAlreadyReservedDatesOrFilledDatesValidity &&
                            (!!alreadyReservedDays.find((el) => el.isSame(date)) ||
                              !!filledDays.find((el) => el.isSame(date)))
                          ) {
                            // exception.message([
                            //   {
                            //     title: "روز از قبل رزرو شده یا پرشده را نمیتوانید انتخاب کنید.",
                            //     type: EXCEPTIONTYPES.ERROR,
                            //   },
                            // ]);
                            return;
                          }
                          // Create a range with its 'first day' being selected and its 'end day' is not yet selected;
                          setSelectedRanges?.((prev) => [...prev, [date, null]]);
                        }
                      } else {
                        if (!!canOnlySelectOneDayWhenRangeIsDisabled) {
                          if (!!selectedIndividualDays && selectedIndividualDays?.length >= 1) {
                            return;
                          }
                        }
                        // Check if the date is in 'any of the selected ranges' or not.
                        const isInsideOfAnyRange = selectedRanges?.find(
                          (selectedRange) =>
                            date.isSameOrAfter(selectedRange[0]) &&
                            date.isSameOrBefore(selectedRange[1])
                        );
                        if (!!isInsideOfAnyRange) {
                          // The intended date to be added to 'selectedIndividualDays' is actually in 'one of the selected ranges'
                          return;
                        }

                        const alreadySelected = selectedIndividualDays?.find(
                          (selectedIndividualDay) => selectedIndividualDay.isSame(date)
                        );

                        if (alreadySelected) {
                          setSelectedIndividualDays?.((prev) =>
                            prev.filter((el) => !el.isSame(date))
                          );
                        } else {
                          setSelectedIndividualDays?.((prev) => [...prev, date]);
                        }
                      }
                      if (!!onDaySelectCb) {
                        onDaySelectCb();
                      }
                    }
                  }}
                  isRangeEnabled={isRangeEnabled}
                  selectedRanges={selectedRanges}
                  canSelectDay={!!canSelectDay && !noCoOperation}
                  // setSelectedRanges={setSelectedRanges}
                  // setSelectedIndividualDays={setSelectedIndividualDays}
                  isRangeFirstPoint={
                    !!selectedRanges?.find((selectedRange) => selectedRange[0].isSame(date))
                  }
                  isRangeLastPoint={
                    !!selectedRanges?.find(
                      (selectedRange) => selectedRange[1] !== null && selectedRange[1].isSame(date)
                    )
                  }
                  isInBetweenTheRange={
                    !!selectedRanges?.find(
                      (selectedRange) =>
                        date.isAfter(selectedRange[0]) && date.isBefore(selectedRange[1])
                    )
                  }
                  isSelectedIndividually={!!selectedIndividualDays?.find((el) => el.isSame(date))}
                  aspectRatio1by1={aspectRatio1by1}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default Calendar;
