import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TextField } from "../core/TextField";
import moment from "moment-jalaali";
import { useRouter } from "next/router";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { Button } from "../core/Button";
import dynamic from "next/dynamic";
import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
const PopularDestinations = dynamic(() => import("@/components/Home/PopularDestinations/index"), {
  ssr: true,
});
const SelectNumberOfPeople = dynamic(() => import("@/components/Home/SelectNumberOfPeople"), {
  ssr: true,
});
const DoubleCalendar = dynamic(() => import("@/components/Calendar/DoubleCalendar"), {
  ssr: false,
});

moment.loadPersian({ dialect: "persian-modern" });
moment.locale("fa-IR");

function MainSearchBox({
  containerClassname,
  fillInputsFromUrl = false,
  setShowMainSearchBox,
  noCoOperation,
}: {
  containerClassname?: string;
  fillInputsFromUrl?: boolean;
  setShowMainSearchBox?: Dispatch<SetStateAction<boolean>>;
  noCoOperation: boolean;
}) {
  const router = useRouter();

  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const toggleCitiesDropdownRef = useRef<any>();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [dateToWorkWith, setDateToWorkWith] = useState<moment.Moment>(moment(new Date()));
  const toggleCalendarDropdownRef = useRef<any>();
  const toggleCalendarDropdownRef2 = useRef<any>();

  const [showNumberOfPeopleDropdown, setShowNumberOfPeopleDropdown] = useState(false);
  const toggleNumberOfPeopleDropdownRef = useRef<any>();

  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  const [selectedCityOrProvince, setSelectedCityOrProvince] = useState<string>("");
  const [searchCityOrProvinceText, setSearchCityOrProvinceText] = useState<string>("");
  // Call your custom hook at the top level of the component
  const persianCityName = useGetPersianCityname();

  useEffect(() => {
    if (!!fillInputsFromUrl) {
      if (!!router?.query?.id) {
        setSelectedCityOrProvince(router?.query?.id as string);
        setSearchCityOrProvinceText(persianCityName);
      }

      const start_day = router?.query?.start; // ex: "1401/12/24"
      const end_day = router?.query?.end; // ex: "1402/01/13"

      if (!!start_day && !!end_day) {
        const moment_start_day = moment(start_day, "jYYYY/jMM/jDD");
        const moment_end_day = moment(end_day, "jYYYY/jMM/jDD");
        setSelectedRanges([[moment_start_day, moment_end_day]]);
      } else {
        setSelectedRanges([]);
      }

      if (!!router?.query?.guests_count) {
        setNumberOfPeople(Number(router?.query?.guests_count));
      } else {
        setNumberOfPeople(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillInputsFromUrl, router]);

  return (
    <div
      id="MainSearchBox"
      className={`
          max-w-[888px] bg-white mx-auto rounded-full shadow-[0px_4px_24px_rgba(24,39,58,0.08)] group/wrapper
          transition-all duration-200
          ${
            showCitiesDropdown || showCalendar || showNumberOfPeopleDropdown
              ? "!bg-gray-airbnb"
              : ""
          }
          ${containerClassname || ""}
        `}
    >
      <div
        className={`
            grid grid-cols-10 relative
          `}
      >
        <div
          className={`
              group py-12 pr-40 col-span-3
              transition-all duration-200
              hover:bg-gray-airbnb
             rounded-tr-full rounded-br-full hover:rounded-tl-full hover:rounded-bl-full
              ${
                !!showCitiesDropdown
                  ? "rounded-full shadow-[0px_8px_24px_rgba(24,39,58,0.15)] bg-white hover:!bg-white"
                  : ""
              }
            `}
          onClick={() => setShowCitiesDropdown((prev) => !prev)}
          ref={toggleCitiesDropdownRef}
        >
          <div
            className={`
                border-solid border-l-gray-C4CAD3 border-l-1 flex items-center gap-x-16 group-hover:border-l-none
                ${!!showCitiesDropdown ? "border-l-none" : ""}
              `}
          >
            <div className="">
              <p
                className={`
                    text-14 leading-20 text-black font-r mb-8
                  `}
              >
                شهر یا اقامتگاه مورد نظر
              </p>

              <TextField
                name="select-city-or-province-to-travel"
                placeholder="انتخاب مقصد"
                autoComplete={false}
                wrapperClassname="!p-0 !border-none !bg-transparent"
                customValue={searchCityOrProvinceText}
                customOnChange={(value) => {
                  setSearchCityOrProvinceText(value);
                }}
                inputClassname={`
                      ${"text-14 leading-20 text-black font-m"}
                      placeholder:text-12 placeholder:leading-16 placeholder:font-r placeholder:text-gray-959FA7
                      !bg-transparent
                    `}
              />
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="grid grid-cols-10">
            <div
              onClick={() => setShowCalendar((prev) => !prev)}
              ref={toggleCalendarDropdownRef}
              className={`
                  col-span-5 py-12 pr-16 flex items-center gap-x-16
                  transition-all duration-200
                  hover:bg-gray-airbnb hover:rounded-full 
                  ${
                    !!showCalendar && selectedRanges.length === 0
                      ? "shadow-[0px_8px_24px_rgba(24,39,58,0.15)] bg-white hover:!bg-white rounded-full"
                      : ""
                  }
                `}
            >
              <div className="grow">
                <p className="text-14 leading-20 text-black font-r mb-8">تاریخ رفت</p>

                <span
                  className={`
                      ${
                        selectedRanges.length === 1
                          ? "text-14 leading-20 text-black font-m"
                          : "text-12 leading-16 text-gray-959FA7 font-r"
                      }
                    `}
                >
                  {selectedRanges.length === 1
                    ? selectedRanges[0][0].format("jYYYY/jMM/jDD")
                    : "انتخاب تاریخ"}
                </span>
              </div>
            </div>
            <div
              onClick={() => setShowCalendar((prev) => !prev)}
              ref={toggleCalendarDropdownRef2}
              className={`
                  col-span-5 py-12 flex items-center pr-12
                  transition-all duration-200
                  hover:bg-gray-airbnb hover:rounded-full
                  ${
                    showCalendar && selectedRanges.length === 1
                      ? "shadow-[0px_8px_24px_rgba(24,39,58,0.15)] bg-white hover:!bg-white rounded-full"
                      : ""
                  }
                `}
            >
              <div className="grow pl-4 ">
                <p className="text-14 leading-20 text-black font-r mb-8">تاریخ برگشت</p>

                <span
                  className={`
                      ${
                        selectedRanges.length === 1 && !!selectedRanges[0][1]
                          ? "text-14 leading-20 text-black font-m"
                          : "text-12 leading-16 text-gray-959FA7 font-r"
                      }
                    `}
                >
                  {selectedRanges.length === 1 && !!selectedRanges[0][1]
                    ? selectedRanges[0][1].format("jYYYY/jMM/jDD")
                    : "انتخاب تاریخ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setShowNumberOfPeopleDropdown((prev) => !prev)}
          ref={toggleNumberOfPeopleDropdownRef}
          className={`
group pl-12 py-12 col-span-3 hover:bg-gray-airbnb
rounded-tl-full rounded-bl-full hover:rounded-tr-full hover:rounded-br-full 
transition-all duration-200
${
  showNumberOfPeopleDropdown
    ? "shadow-[0px_8px_24px_rgba(24,39,58,0.15)] bg-white hover:!bg-white rounded-tr-full rounded-br-full"
    : ""
}
`}
        >
          <div
            className={`
flex items-center justify-between
border-r-1 border-solid border-r-gray-C4CAD3 pr-16 group-hover:border-r-transparent
${showNumberOfPeopleDropdown ? "border-r-transparent" : ""}
`}
          >
            <div className="flex items-center gap-x-16">
              <div className="">
                <p className="text-14 leading-20 text-black font-r mb-8">تعداد نفرات</p>

                <span
                  className={`${
                    !!numberOfPeople
                      ? "text-14 leading-20 text-black font-m"
                      : "text-12 leading-16 text-gray-959FA7 font-r"
                  }`}
                >
                  {!!numberOfPeople ? `${numberOfPeople} نفر` : "چند نفر هستید ؟"}
                </span>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const baseUrl = "/search";
                router.push(
                  `${baseUrl}${!!selectedCityOrProvince ? `/${selectedCityOrProvince}` : ""}${
                    (selectedRanges.length === 1 && !!selectedRanges[0][1]) || !!numberOfPeople
                      ? "?"
                      : ""
                  }${
                    selectedRanges.length === 1 && !!selectedRanges[0][1]
                      ? `start=${selectedRanges[0][0].format(
                          "jYYYY/jMM/jDD"
                        )}&end=${selectedRanges[0][1].format("jYYYY/jMM/jDD")}&`
                      : ``
                  }${!!numberOfPeople ? `guests_count=${numberOfPeople}` : ""}`
                );

                if (!!setShowMainSearchBox) {
                  setShowMainSearchBox(false);
                }
              }}
              className={`
       w-[44px] h-[44px] rounded-full flex items-center gap-x-12 bg-primary-main cursor-pointer
       overflow-x-hidden
       transition-all duration-200
       hover:w-[123px] hover:pl-24 hover:pr-16 hover:justify-start
       ${
         showCitiesDropdown || showCalendar || showNumberOfPeopleDropdown
           ? "!w-[123px] pl-24 pr-16"
           : "justify-center pr-12"
       }
`}
            >
              <i className="icon-Search text-white text-24" />
              <p
                className={`
         text-16 leading-24 text-white font-m
         transition-all duration-200
         ${showCitiesDropdown || showCalendar || showNumberOfPeopleDropdown ? "w-auto " : "w-0 "}
       `}
              >
                جستجو
              </p>
            </div>
          </div>
        </div>

        {!!showCitiesDropdown && (
          <OutsideClickHandler
            handleClick={() => setShowCitiesDropdown(false)}
            exceptionElementsRef={[toggleCitiesDropdownRef]}
          >
            <PopularDestinations
              selectedCityOrProvince={selectedCityOrProvince}
              setSelectedCityOrProvince={setSelectedCityOrProvince}
              onSelectOfCityOrProvinceCb={() => {
                setShowCitiesDropdown(false);
                setShowCalendar(true);
              }}
              searchCityOrProvinceText={searchCityOrProvinceText}
              setSearchCityOrProvinceText={setSearchCityOrProvinceText}
              setShowCitiesDropdown={setShowCitiesDropdown}
              setShowMainSearchBox={setShowMainSearchBox as Dispatch<SetStateAction<boolean>>}
            />
          </OutsideClickHandler>
        )}

        {!!showCalendar && (
          <div className="absolute z-2 right-0 left-0 -bottom-8 translate-y-full ">
            <DoubleCalendar
              showDoubleCalendar={showCalendar}
              setShowDoubleCalendar={setShowCalendar}
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
              onlyShowCalendarDateNumber={true}
              canOnlySelectOneRange={true}
              onSelectOfRangeEndCb={() => {
                setShowNumberOfPeopleDropdown(true);
              }}
              outsideClickHandlerExceptionRefs={[
                toggleCalendarDropdownRef,
                toggleCalendarDropdownRef2,
              ]}
              showHeader={false}
              bottomActions={
                <div className="mt-16 flex items-center justify-between">
                  <Button
                    color="grey"
                    onClick={() => {
                      if (selectedRanges.length === 0) {
                        setShowCalendar(false);
                        setShowNumberOfPeopleDropdown(true);
                      } else {
                        setSelectedRanges([]);
                      }
                    }}
                  >
                    {selectedRanges.length === 0 ? "رد شدن" : "پاک کردن"}
                  </Button>

                  <Button
                    variant="outlined"
                    color="grey"
                    disabled={
                      selectedRanges.length === 0 ||
                      (selectedRanges.length === 1 && !selectedRanges[0][1])
                    }
                    onClick={() => {
                      if (selectedRanges.length === 1 && !!selectedRanges[0][1]) {
                        setShowCalendar(false);
                      }
                    }}
                  >
                    تأیید تاریخ
                  </Button>
                </div>
              }
            />
          </div>
        )}

        {!!showNumberOfPeopleDropdown && (
          <OutsideClickHandler
            handleClick={() => setShowNumberOfPeopleDropdown(false)}
            exceptionElementsRef={[toggleNumberOfPeopleDropdownRef]}
          >
            <div className="absolute left-0 -bottom-8 translate-y-full w-[296px] z-2">
              <SelectNumberOfPeople
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
              />
            </div>
          </OutsideClickHandler>
        )}
      </div>
    </div>
  );
}

export default MainSearchBox;
