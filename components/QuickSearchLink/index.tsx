import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "../General/core/Button";
import WhereYouWannaGoTextField from "../Search/WhereYouWannaGoSearchBox/WhereYouWannaGoTextField";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import PopularDestinations from "../Home/PopularDestinations";
// import ModalWrapper from "../General/core/ModalWrapper";
// import Calendar from "../Calendar";
// import { Switch } from "../General/core/Switch";
import moment, { Moment } from "moment-jalaali";
import SelectNumberOfPeople from "../Home/SelectNumberOfPeople";
import { getAllUniqueSelectedDays_Array } from "@/utilities/calendar/getAllUniqueSelectedDays_Array";
import React from "react";
import { useRouter } from "next/router";
import ChooseEnterAndExitDaysCalendarModal from "../ObserveResidenceDetails/ChooseEnterAndExitDaysCalendarModal";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import ChooseDateBox from "../General/ChooseDateBox";

function QuickSearchLink() {
  const router = useRouter();

  const [showChooseEnterAndExitDaysCalendarModal, setShowChooseEnterAndExitDaysCalendarModal] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const toggleCitiesDropdownRef = useRef<any>();
  // const [dateToWorkWith, setDateToWorkWith] = useState<Moment>(moment(new Date()));
  // const [isRangeEnabled, setIsRangeEnabled] = useState(true);
  const [tmpSelectedRanges, setTmpSelectedRanges] = useState<
    [moment.Moment, moment.Moment | null][]
  >([]);
  // const [selectedIndividualDays, setSelectedIndividualDays] = useState<moment.Moment[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);

  // function resetAllSelectedDays() {
  // setSelectedIndividualDays([]);
  //   setTmpSelectedRanges([]);
  // }
  const [selectedCityOrProvince, setSelectedCityOrProvince] = useState<string>("");

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

  return (
    <>
      <div className="py-[56px]">
        <div className="CustomContainer">
          <Image
            src={"/assets/QuickSearchLink.webp"}
            unoptimized
            alt={"لینک جستجوی سریع"}
            className="rounded-12 md:w-full md:h-[300px]"
            width={460}
            height={504}
            style={{
              objectFit: "contain",
            }}
            priority
          />
          <div className="relative">
            <div
              onClick={() => setShowCitiesDropdown((prev) => !prev)}
              ref={toggleCitiesDropdownRef}
              className="pt-28 pb-16"
            >
              <WhereYouWannaGoTextField
                placeholderText="مقصدتان کجاست ؟"
                readonly={false}
                value={searchText}
                onChange={(value) => setSearchText(value)}
              />
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
                  }}
                  searchCityOrProvinceText={searchText}
                  setSearchCityOrProvinceText={setSearchText}
                  setShowCitiesDropdown={setShowCitiesDropdown}
                  // wrapperClassname="!h-[230px] !w-[300px]"
                />
              </OutsideClickHandler>
            )}
          </div>
          {/* <div className="rounded-16 p-12 border border-gray-E9E9EC flex items-center justify-between mb-16">
            <div className="flex items-center gap-x-13">
              <i className="icon-Calendar text-24"></i>
              <div className="flex-col justify-center items-center">
                <p className="text-12 leading-14 font-r text-gray-6C6A7D">تاریخ ایام نوروز</p>
                {!!tmpSelectedRanges && (
                  <div className="flex items-center gap-x-2 pt-12">
                    {tmpSelectedRanges.map((range) => (
                      <React.Fragment key={range.toString()}>
                        {range[0] && <span>{momentToJalali(range[0])}</span>}
                        <i className="icon-CalendarFlash" />
                        {range[1] && <span>{momentToJalali(range[1])}</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowChooseEnterAndExitDaysCalendarModal(true)}
              leftIcon={<i className="icon-FlashLeft"></i>}
              color="grey"
            >
              {tmpSelectedRanges.length ? "تغییر تاریخ" : "انتخاب تاریخ"}
            </Button>
          </div> */}
          <ChooseDateBox
            placeholder="تاریخ سفر"
            setShowCalendarModal={setShowChooseEnterAndExitDaysCalendarModal}
            selectedRanges={tmpSelectedRanges}
          />
          <SelectNumberOfPeople
            wrapperClassname="shadow-[unset] border border-gray-E9E9EC !rounded-16"
            numberOfPeople={numberOfPeople}
            setNumberOfPeople={setNumberOfPeople}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const baseUrl = "/search";
              router.push(
                `${baseUrl}/${selectedCityOrProvince}?${
                  tmpSelectedRanges.length === 1 && !!tmpSelectedRanges[0][1]
                    ? `start=${tmpSelectedRanges[0][0].format(
                        "jYYYY/jMM/jDD"
                      )}&end=${tmpSelectedRanges[0][1].format("jYYYY/jMM/jDD")}&`
                    : ``
                }${!!numberOfPeople ? `guests_count=${numberOfPeople}` : ""}`
              );
            }}
            disabled={
              !(
                !!getAllUniqueSelectedDays_Array([], tmpSelectedRanges).length &&
                !!numberOfPeople &&
                !!searchText
              )
            }
            className="mt-32"
            color="primary"
            isFullWidth
          >
            جستجوی اقامتگاه ها
          </Button>
        </div>
      </div>
      {/* {showCalendarModal && (
        <ModalWrapper
          headerTitle="نرخ نوروز 1403"
          onClose={() => {
            setShowCalendarModal(false);
          }}
          open={showCalendarModal}
          modalClassname="md:w-[420px]"
          bodyContainerClassname="pt-[124px] md:pt-0 md:pb-0"
        >
          <Calendar
            canNavigateToAllPrevMonth={true}
            canSelectPassedDay={true}
            wrapperClassname="bg-white"
            // color="blue"
            rounded={true}
            hasBorderDashed={false}
            makeBgConsistentIntmpSelectedRanges={true}
            aspectRatio1by1
            setDateToWorkWith={setDateToWorkWith}
            dateToWorkWith={dateToWorkWith}
            onMonthInc={() => {
              setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
            }}
            onMonthDec={() => {
              setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
            }}
            isRangeEnabled={isRangeEnabled}
            filledDays={[]}
            alreadyReservedDays={[]}
            peakDays={[]}
            fastReserveDays={[]}
            discounted_days={[]}
            special_dates={[]}
            offDays={[]}
            prices={{
              extra_guests_price: 0,
              monthly_discount: 0,
              peak_price: 0,
              week_price: 0,
              weekend_price: 0,
              weekly_discount: 0,
            }}
            canSelectDay={true}
            showNavigateToPrevMonthBtn={true}
            showNavigateToNextMonthBtn={true}
            onlyShowCalendarDateNumber={true}
            noCoOperation={false}
            tmpSelectedRanges={tmpSelectedRanges}
            setTmpSelectedRanges={setTmpSelectedRanges}
            // selectedIndividualDays={selectedIndividualDays}
            // setSelectedIndividualDays={setSelectedIndividualDays}
            checkForAlreadyReservedDatesOrFilledDatesValidity={true}
            canSelectMonth={true}
            canOnlySelectOneRange
          />
          <div className="flex items-center justify-between mt-16">
            <Switch
              name={"range-select"}
              label={"بازه ای"}
              checked={isRangeEnabled}
              onChange={(e) => {
                setIsRangeEnabled(e.target.checked);
              }}
            />
            <div className="flex items-center gap-x-8">
              <Button
                rounded
                color="grey"
                onClick={() => resetAllSelectedDays()}
                className="!px-10"
              >
                انصراف
              </Button>
              <Button
                onClick={() => {
                  setShowCalendarModal(false);
                }}
                rounded
                color="primary"
              >
                تایید تاریخ
              </Button>
            </div>
          </div>
        </ModalWrapper>
      )} */}
      {!!showChooseEnterAndExitDaysCalendarModal && (
        <ChooseEnterAndExitDaysCalendarModal
          isModalOpen={showChooseEnterAndExitDaysCalendarModal}
          handleClose={() => setShowChooseEnterAndExitDaysCalendarModal(false)}
          min_reservable_days={undefined}
          discounted_days={[]}
          fast_days={[]}
          filled_dates={[]}
          noCoOperation={false}
          peak_dates={[]}
          reserved_dates={[]}
          special_dates={[]}
          prices={{}}
          selectedRanges={tmpSelectedRanges}
          setSelectedRanges={setTmpSelectedRanges}
          onSubmit={(giventmpSelectedRanges: [Moment, Moment][]) => {
            removeSomeQueryParameters_Then_AddSomeQueryParameters(
              router,
              ["start", "end"],
              [
                ["start", giventmpSelectedRanges[0][0].format("jYYYY/jMM/jDD")],
                ["end", giventmpSelectedRanges?.[0]?.[1].format("jYYYY/jMM/jDD")],
              ]
            );

            setShowChooseEnterAndExitDaysCalendarModal(false);
          }}
        />
      )}
    </>
  );
}

export default QuickSearchLink;
