import { useMemo } from "react";
import moment from "moment-jalaali";
import dynamic from "next/dynamic";
const FastReserveDot = dynamic(() => import("./FastReserveDot"), {
  ssr: true,
});
const DiscountDot = dynamic(() => import("./DiscountDot"), {
  ssr: true,
});

export function CalendarItemBox({
  isRangeEnabled,
  dateObjectItself,
  canSelectDay = true,
  isRangeFirstPoint,
  isRangeLastPoint,
  isInBetweenTheRange,
  // setSelectedRanges,
  // setSelectedIndividualDays,
  isSelectedIndividually,
  dateNumber,
  discountP,
  isFastReserve,
  isPeakDay,
  isOffDay,
  isAlreadyReserved,
  isFilled,
  noCoOperation,
  isPassedDay,
  specialDateInfo,
  prices,
  isWeekEnd,
  onclick,
  isThisDatesPrevDateFilledOrReserved,
  isThisDatesNextDateFilledOrReserved,
  onlyShowCalendarDateNumber = false,
  selectedRanges,
  checkForAlreadyReservedDatesOrFilledDatesValidity = false,
  canBeSeleceted,
  aspectRatio1by1,
  color = "primary",
  rounded = false,
  hasBorderDashed = true,
  canSelectPassedDay = false,
  showToday = false,
}: // getImmediateFilledOrReservedDateOfSelecetdRangesFirstPoint,
{
  isRangeEnabled?: boolean;
  dateObjectItself?: moment.Moment;
  canSelectDay?: boolean;
  isRangeFirstPoint?: boolean;
  isRangeLastPoint?: boolean;
  isInBetweenTheRange?: boolean;
  // setSelectedRanges?: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  // setSelectedIndividualDays?: Dispatch<SetStateAction<moment.Moment[]>>;
  isSelectedIndividually?: boolean;
  dateNumber: number;
  discountP: number;
  isFastReserve: boolean;
  isPeakDay: boolean;
  isOffDay: boolean;
  isAlreadyReserved: boolean;
  isFilled: boolean;
  noCoOperation: boolean;
  isPassedDay: boolean; // ino khodam dakhele cmponent khodam hal mikonam
  specialDateInfo: { is: boolean; specialDay_price: number };
  prices: {
    peak_price: number;
    week_price: number;
    weekend_price: number;
  };
  isWeekEnd?: boolean;
  onclick?: () => void;
  isThisDatesPrevDateFilledOrReserved?: boolean;
  isThisDatesNextDateFilledOrReserved?: boolean;
  onlyShowCalendarDateNumber?: boolean;
  selectedRanges?: [moment.Moment, moment.Moment | null][];
  checkForAlreadyReservedDatesOrFilledDatesValidity?: boolean;
  canBeSeleceted?: boolean;
  aspectRatio1by1?: boolean;
  color?: "primary" | "blue";
  rounded?: boolean;
  hasBorderDashed?: boolean;
  canSelectPassedDay?: boolean;
  showToday?: boolean;
  // getImmediateFilledOrReservedDateOfSelecetdRangesFirstPoint?: () => null | moment.Moment;
}) {
  // All the box variants have dateNumber;
  // Let's give precendance to texts rather than 'prices and discount'; (In rendering)

  // NOTE: precidence of 'variables' affecting the price is clear in below function;
  const actualPrice: number = useMemo(() => {
    if (!!specialDateInfo.is) {
      return specialDateInfo.specialDay_price;
    }

    if (isPeakDay) {
      return prices.peak_price;
    }

    if (isWeekEnd) {
      return prices.weekend_price;
    } else {
      return prices.week_price;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialDateInfo?.is, specialDateInfo?.specialDay_price, isPeakDay, isWeekEnd]);

  // console.log({
  //   dateNumber,
  //   isThisDatesPrevDateFilledOrReserved,
  //   isThisDatesNextDateFilledOrReserved,
  // });

  return (
    <div
      onClick={() => {
        if (isPassedDay && !canSelectPassedDay) return;

        if (!!canSelectDay) {
          if (isRangeEnabled) {
            if (isRangeFirstPoint || isInBetweenTheRange || isRangeLastPoint) return;
            if (!!onclick) onclick();
          } else {
            if (!!onclick) onclick();
          }
        }
      }}
      className={`
            ${
              showToday
                ? dateObjectItself?.isSame(moment(), "day")
                  ? "border !border-blue-main rounded-[100%]"
                  : ""
                : ""
            }
            ${
              aspectRatio1by1 ? "aspect-square" : "h-48"
            } w-full flex flex-col items-center justify-center relative text-black
            ${hasBorderDashed ? "border-1 border-dashed border-[rgba(28,50,79,0.38)]" : ""}
            ${!rounded ? "rounded-6" : ""}
             cursor-pointer
            ${
              !canSelectPassedDay &&
              !!isPassedDay &&
              "opacity-40 !cursor-not-allowed !pointer-events-none"
            }
            ${!isPassedDay && !!isFilled && "bg-[rgba(25,59,103,0.05)] !border-none !cursor-not-allowed"}
            ${!isPassedDay && !!isAlreadyReserved && "bg-[rgba(0,211,0,0.15)] !border-none"}
            ${!!isOffDay && "!text-error-light"}
            ${!isPassedDay && !!isPeakDay && "!border-solid border-error-light"}
            ${!!isRangeFirstPoint && `!text-white !border-none`}
            ${
              !!isRangeFirstPoint &&
              (!!rounded
                ? "rounded-tr-[100%] rounded-br-[100%] after:absolute after:z-1 after:top-1/2 after:left-1/2 after:w-full after:h-full after:content-[''] after:inline-block after:rounded-[100%] after:-translate-x-1/2 after:-translate-y-1/2"
                : "!rounded-tr-16 !rounded-br-16")
            }
            ${
              !!isRangeFirstPoint &&
              !!rounded &&
              (color === "blue"
                ? "!bg-blue-light after:bg-blue-main"
                : "!bg-secondary-main after:bg-primary-main")
            }
            ${!!isRangeFirstPoint && (color === "blue" ? "bg-blue-main" : "bg-primary-main")}
            ${!!isRangeLastPoint && `!text-white !border-none`}
            ${
              !!isRangeLastPoint &&
              (!!rounded
                ? "rounded-tl-[100%] rounded-bl-[100%] after:absolute after:z-1 after:top-1/2 after:left-1/2 after:w-full after:h-full after:content-[''] after:inline-block after:rounded-[100%] after:-translate-x-1/2 after:-translate-y-1/2"
                : "!rounded-tl-16 !rounded-bl-16")
            }
            ${
              !!isRangeLastPoint &&
              !!rounded &&
              (color === "blue"
                ? "!bg-blue-light after:bg-blue-main"
                : "!bg-secondary-main after:bg-primary-main")
            }
            ${!!isRangeLastPoint && (color === "blue" ? "bg-blue-main" : "bg-primary-main")}
            ${
              !!isInBetweenTheRange &&
              `${
                color === "blue"
                  ? "!bg-blue-light text-blue-main"
                  : "!bg-secondary-main !text-black"
              } !border-none`
            }
            ${
              !!isSelectedIndividually &&
              `${
                color === "blue"
                  ? "!bg-blue-main !text-white !border-none"
                  : "!bg-primary-main !text-white !border-none"
              } ${rounded ? "rounded-[100%]" : ""}`
            }
        `}
      style={{
        background: noCoOperation
          ? ""
          : !isPassedDay &&
            !!isRangeEnabled &&
            !!selectedRanges &&
            !!checkForAlreadyReservedDatesOrFilledDatesValidity
          ? !!isAlreadyReserved || !!isFilled
            ? selectedRanges.length === 0
              ? // !isThisDatesPrevDateFilledOrReserved && !isThisDatesNextDateFilledOrReserved
                //   ? // asked from reazaee
                //     ""
                //   :
                !isThisDatesPrevDateFilledOrReserved
                ? isAlreadyReserved
                  ? "linear-gradient(135deg, rgba(0,211,0,0.15) 50%, rgba(255,255,255,1) 50%)"
                  : // isFilled
                    "linear-gradient(135deg, rgba(25,59,103,0.05) 50%, rgba(255,255,255,1) 50%)"
                : // : !isThisDatesNextDateFilledOrReserved
                  // ? isAlreadyReserved
                  //   ? "linear-gradient(135deg, rgba(255,255,255,1) 50%, rgba(0,211,0,0.15) 50%)"
                  //   : "linear-gradient(135deg, rgba(255,255,255,1) 50%, rgba(25,59,103,0.05) 50%)"
                  // okay
                  ""
              : selectedRanges.length === 1 && !selectedRanges?.[0]?.[1]
              ? dateObjectItself?.isBefore(selectedRanges[0][0])
                ? ""
                : !canBeSeleceted
                ? "repeating-linear-gradient(-45deg, rgb(255, 255, 255), rgb(255, 255, 255) 3px, rgba(215, 215, 215, 0.8) 0px, rgba(215, 215, 215, 0.8) 6px)"
                : // : // can be selcted
                  // isFilled
                  // ? "linear-gradient(135deg, rgba(25,59,103,0.05) 50%, rgba(255,255,255,1) 50%)"
                  // : isAlreadyReserved
                  // ? "linear-gradient(135deg, rgba(0,211,0,0.15) 50%, rgba(255,255,255,1) 50%)"
                  "#fff"
              : selectedRanges.length === 1 && !!selectedRanges?.[0]?.[1]
              ? ""
              : ""
            : !canBeSeleceted
            ? "repeating-linear-gradient(-45deg, rgb(255, 255, 255), rgb(255, 255, 255) 3px, rgba(215, 215, 215, 0.8) 0px, rgba(215, 215, 215, 0.8) 6px)"
            : ""
          : "",
      }}
    >
      {/* <div className={!isPassedDay && !!isOffDay ? "text-black" : ""}> */}
      <CalendarDateNumber dateNumber={dateNumber} />
      {/* {!isPassedDay &&
      !!isRangeEnabled &&
      !!selectedRanges &&
      !!checkForAlreadyReservedDatesOrFilledDatesValidity &&
      (!!isAlreadyReserved || !!isFilled) &&
      !canBeSeleceted ? null : (
        
      )} */}
      {/* </div> */}

      {!onlyShowCalendarDateNumber && !isPassedDay && (
        <>
          {!isFilled && !!discountP && (
            <p className="text-8 leading-10 font-l text-[rgba(28,48,74,0.5)] line-through">
              {actualPrice?.toLocaleString("en-US")}
            </p>
          )}

          {isFilled ? (
            // For removing text when this day, is the immediate filled day (considered from first point of selected range)
            !!selectedRanges &&
            selectedRanges?.length === 1 &&
            !selectedRanges?.[0]?.[1] &&
            canBeSeleceted &&
            checkForAlreadyReservedDatesOrFilledDatesValidity &&
            !dateObjectItself?.isBefore(selectedRanges[0][0]) ? null : (
              <p className="text-10 leading-12 font-l text-[rgba(28,48,74,0.5)] mt-2">پر شده</p>
            )
          ) : isAlreadyReserved ? (
            // For removing text when this day, is the immediate reserved day (considered from first point of selected range)

            !!selectedRanges &&
            selectedRanges?.length === 1 &&
            !selectedRanges?.[0]?.[1] &&
            canBeSeleceted &&
            checkForAlreadyReservedDatesOrFilledDatesValidity &&
            !dateObjectItself?.isBefore(selectedRanges[0][0]) ? null : (
              <p className="text-10 leading-12 font-l text-success mt-2">رزرو</p>
            )
          ) : (
            // Calculated Price -- Any other 'text' will be rendered in the above condition.
            <p
              className={`
                text-10 leading-12 font-l mt-2
                ${!isPassedDay && !!isOffDay && "text-black"}
              `}
            >
              {!!discountP
                ? Number(
                    (actualPrice - actualPrice * (discountP / 100)).toFixed(0)
                  ).toLocaleString("en-US")
                : actualPrice?.toLocaleString("en-US")}
            </p>
          )}

          {!isFilled && !!isFastReserve && <FastReserveDot />}
          {!isFilled && !!discountP && <DiscountDot />}
        </>
      )}
    </div>
  );
}

function CalendarDateNumber({ dateNumber }: { dateNumber: number }) {
  return (
    <div
      className={`
            text-16 leading-14 font-r mb-2 z-2
        `}
    >
      {dateNumber}
    </div>
  );
}
