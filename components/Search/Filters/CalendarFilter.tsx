import moment from "moment-jalaali";
import AnimatedPingAlert from "../AnimatedPingAlert";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { useMediaQuery } from "@/utilities/useMediaQuery";

const DoubleCalendar = dynamic(() => import("@/components/Calendar/DoubleCalendar"), {
  ssr: false,
});
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});
// const BlueBoxAlert = dynamic(() => import("@/components/Search/Filters/BlueBoxAlert"), {
//   ssr: true,
// });

moment.loadPersian({ dialect: "persian-modern" });
moment.locale("fa-IR");

function CalendarFilter({
  setShowChooseEnterAndExitDaysCalendarModal,
  tmpSelectedRanges,
  setTmpSelectedRanges,
  noCoOperation,
}: {
  setShowChooseEnterAndExitDaysCalendarModal: Dispatch<SetStateAction<boolean>>;
  tmpSelectedRanges: [
    moment.Moment, // start day of range
    moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
  ][];
  setTmpSelectedRanges: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  noCoOperation: boolean;
}) {
  const router = useRouter();
  const [showDoubleCalendar, setShowDoubleCalendar] = useState<boolean>(false);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [dateToWorkWith, setDateToWorkWith] = useState<moment.Moment>(moment(new Date()));
  const calendarFilterWrapperRef = useRef<any>(null);
  // const [blueBoxHasBeenShown, setBlueBoxHasBeenShown] = useState<boolean>(false);
  // const [pageIsLoaded, setPageIsLoaded] = useState<boolean>(false);

  const selectedRanges: [
    moment.Moment, // start day of range
    moment.Moment
  ][] =
    !!router?.query?.start && !!router?.query?.end
      ? [
          [
            moment(router?.query?.start, "jYYYY/jMM/jDD"),
            moment(router?.query?.end, "jYYYY/jMM/jDD"),
          ],
        ]
      : [];

  function clearCalendarFilterFromUrlFilters() {
    removeQueryParameters(router, [
      { paramKey: "start" },
      { paramKey: "end" },
      { paramKey: "page" },
    ]);
  }

  useEffect(() => {
    if (!!router?.query?.start && !!router?.query?.end) {
      setTmpSelectedRanges([
        [
          moment(router?.query?.start, "jYYYY/jMM/jDD"),
          moment(router?.query?.end, "jYYYY/jMM/jDD"),
        ],
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end]);

  // useEffect(() => {
  //   // callback function to call when event triggers
  //   const onPageLoad = () => {
  //     // console.log("page loaded");
  //     setPageIsLoaded(true);
  //   };

  //   // Check if the page has already loaded
  //   if (document.readyState === "complete") {
  //     onPageLoad();
  //   } else {
  //     window.addEventListener("load", onPageLoad, false);
  //     // Remove the event listener when component unmounts
  //     return () => window.removeEventListener("load", onPageLoad);
  //   }
  // }, []);

  return (
    <>
      <div className="relative shrink-0">
        <div
          className={`
        px-8 cursor-pointer h-32
        border-1 border-solid
        rounded-50 flex items-center
        ${
          !!selectedRanges?.[0]?.[0] && !!selectedRanges?.[0]?.[1]
            ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
            : "border-gray-CACFD3"
        }
      `}
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-label="انتخاب تاریخ رفت و برگشت"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).click();
            }
          }}
          onClick={() => {
            // setBlueBoxHasBeenShown(true);
            if (!!isDesktop) {
              setShowDoubleCalendar((prev) => !prev);
            } else {
              setShowChooseEnterAndExitDaysCalendarModal(true);
            }
          }}
          ref={calendarFilterWrapperRef}
        >
          {!!selectedRanges?.[0]?.[0] && !!selectedRanges?.[0]?.[1] ? null : <AnimatedPingAlert />}

          <div className="flex items-center gap-x-6 pl-8">
            <i className="icon-CalendarFill text-16" />

            <p className="text-12 leading-16 font-m text-black text-nowrap">
              {!!selectedRanges?.[0]?.[0] && !!selectedRanges?.[0]?.[1]
                ? `${selectedRanges[0][0].format("jDD jMMMM")} 
              تا 
                  ${selectedRanges[0][1].format("jDD jMMMM")}`
                : "انتخاب تاریخ"}
            </p>
          </div>

          {!!selectedRanges?.[0]?.[0] && !!selectedRanges?.[0]?.[1] && (
            <CloseBtn
              onClose={(e) => {
                e.preventDefault();
                e.stopPropagation();

                clearCalendarFilterFromUrlFilters();
                setTmpSelectedRanges([]);
                // setBlueBoxHasBeenShown(true);
              }}
            />
          )}
        </div>
        {!!showDoubleCalendar && (
          <div className="absolute top-42 -right-1 w-[773px] z-1">
            <DoubleCalendar
              showDoubleCalendar={showDoubleCalendar}
              setShowDoubleCalendar={setShowDoubleCalendar}
              outsideClickHandlerExceptionRefs={[calendarFilterWrapperRef]}
              selectedRanges={tmpSelectedRanges}
              setSelectedRanges={setTmpSelectedRanges}
              dateToWorkWith={dateToWorkWith}
              setDateToWorkWith={setDateToWorkWith}
              min_reservable_days={undefined}
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
                // // Just to make sure -- i know this condition is redundant
                if (!!tmpSelectedRanges?.[0]?.[0] && !!tmpSelectedRanges?.[0]?.[1]) {
                  // remove possible previous 'start' and 'end' params from url, then add new ones.
                  removeSomeQueryParameters_Then_AddSomeQueryParameters(
                    router,
                    ["start", "end", "page"],
                    [
                      ["start", tmpSelectedRanges[0][0].format("jYYYY/jMM/jDD")],
                      ["end", tmpSelectedRanges[0][1].format("jYYYY/jMM/jDD")],
                    ]
                  );
                }
              }}
            />
          </div>
        )}
      </div>
      {/* {!router?.query?.start && !router?.query?.end && !!pageIsLoaded && !blueBoxHasBeenShown && (
        <BlueBoxAlert setBlueBoxHasBeenShown={setBlueBoxHasBeenShown} />
      )} */}
    </>
  );
}

export default CalendarFilter;
