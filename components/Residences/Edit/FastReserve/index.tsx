import { useQuery } from "@tanstack/react-query";
import { getCalendarData, IServerCalendarData } from "api/Calendar/Calendar";
import Calendar from "components/Calendar";
import CalendarHelp from "components/Calendar/CalendarHelp";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import DropDown from "components/General/core/DropDown";
import Cart from "components/General/core/DropDown/DropdownCart";
import ModalHeader from "components/General/core/ModalHeader";
import { Switch } from "components/General/core/Switch";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import moment from "moment-jalaali";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import FastOrUnfastConfirmBottomSheet from "./FastOrUnfastConfirmBottomSheet";
import { getAllUniqueSelectedDays_Array } from "utilities/calendar/getAllUniqueSelectedDays_Array";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";
import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import {
  getResidencesList,
  IServerResidence,
  IServerRoom,
} from "@/api/Residences/getResidencesList";

function EditResidenceFastReserveSettings() {
  const router = useRouter();
  const [selectedResidenceValue, setSelectedResidenceValue] = useState<number | "all">(); // as residenceId
  const [residencesList, setResidencesList] = useState<IServerResidence[]>();
  // const [allRoomsList, setAllRoomsList] = useState<IServerRoom[]>();
  const [eligibleRoomsToBeListed, setEligibleRoomsToBeListed] = useState<IServerRoom[]>();

  const [dateToWorkWith, setDateToWorkWith] = useState<moment.Moment>(moment(new Date()));

  const [calendarData, setCalendarData] = useState<IServerCalendarData>();
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);

  const [showFastOrUnfastConfirmBottomSheet, setShowFastOrUnfastConfirmBottomSheet] =
    useState(false);

  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [selectedIndividualDays, setSelectedIndividualDays] = useState<moment.Moment[]>([]);

  const {
    isSuccess: residencesIsSuccess,
    isLoading: residencesIsLoading,
    data,
  } = useQuery(["getResidencesList"], () => getResidencesList());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const allResidences: IServerResidence[] = data?.params?.residences;
        setResidencesList(allResidences);

        // setAllRoomsList(data?.params?.rooms);

        const allRooms: IServerRoom[] = data?.params?.rooms;
        setEligibleRoomsToBeListed(
          allRooms.filter(
            (room) => allResidences.find((res) => res.id === room.parent_id)?.res_type !== "suit"
          )
        );
      }
    }
  }, [data]);

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    isFetching: calendarDataIsFetching,
    data: dataOfCalendar,
  } = useQuery(
    ["getCalendarData", selectedResidenceValue],
    () => {
      return getCalendarData({
        residenceId: selectedResidenceValue as number | "all",
        // TODO: Waiting for backend reply for 'what value should be sent when "all" is selected'
        residenceType: router?.query?.residenceType as ResidenceTypes_enum,
      });
    },
    {
      enabled: !!selectedResidenceValue && selectedResidenceValue !== "all",
    }
  );

  useEffect(() => {
    if (!!dataOfCalendar) {
      if (dataOfCalendar?.status === "error") {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: dataOfCalendar?.err_msg || defaultError },
        ]);
      } else {
        const serverCalendarData: IServerCalendarData = dataOfCalendar?.params;

        setCalendarData(serverCalendarData);
      }
    }
  }, [dataOfCalendar]);

  useEffect(() => {
    if (router?.query?.residenceId) {
      if (router?.query?.residenceId === "all") {
        setSelectedResidenceValue("all");
      } else {
        setSelectedResidenceValue(Number(router?.query?.residenceId));
      }
    }
  }, [router?.query?.residenceId]);

  function resetAllSelectedDays() {
    setSelectedIndividualDays([]);
    setSelectedRanges([]);
  }

  function getNumberOfAllUniqueSelectedDays() {
    const allUniqueSelectedDays_Array = getAllUniqueSelectedDays_Array(
      selectedIndividualDays,
      selectedRanges
    );
    return allUniqueSelectedDays_Array.length;
  }

  function getBtnText() {
    const incompleteRangeData = selectedRanges.find((selectedRange) => selectedRange[1] === null);
    if (incompleteRangeData) {
      return "در انتظار انتخاب انتهای بازه";
    }

    const numberOfAllUniqueSelectedDays = getNumberOfAllUniqueSelectedDays();

    return `بروزرسانی ${numberOfAllUniqueSelectedDays} روز`;
  }

  useEffect(() => {
    resetAllSelectedDays();
  }, [router?.query?.residenceId, router?.query?.residenceType]);

  return (
    <div className="relative pt-80 md:pt-0">
      <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
        <ModalHeader headerTitle={"تنظیمات رزرو آنی"} onBackClick={() => router.back()} />
      </div>

      <div className="">
        {calendarDataIsFetching ||
        residencesIsLoading ||
        (!calendarData && selectedResidenceValue !== "all") ||
        (!residencesList && !eligibleRoomsToBeListed) ? (
          <TinyLoader />
        ) : (
          <>
            <div className="pb-[88px] md:pb-0">
              {((!!residencesList && !!residencesList.length) ||
                (!!eligibleRoomsToBeListed && !!eligibleRoomsToBeListed.length)) && (
                <DropDown
                  currntValue={selectedResidenceValue || 0}
                  onChange={(e, value, allChildProps) => {
                    // setSelectedResidenceValue(value as number | "all")
                    router.replace(
                      `/residences/fast-reserve/edit?residenceId=${value}&residenceType=${allChildProps?.type}`
                    );
                  }}
                >
                  {[
                    <Cart
                      key={new Date().getMilliseconds()}
                      value={"all"}
                      title={"انتخاب همه اقامتگاه ها"}
                      subText={`${
                        (
                          residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) ||
                          []
                        ).length + (eligibleRoomsToBeListed || []).length
                      } اقامتگاه`}
                      iconSrc={"icon-LocationHome"}
                      type="all"
                    />,
                    ...(
                      residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) || []
                    ).map((residence: any, index: number) => {
                      return (
                        <Cart
                          key={index}
                          value={residence?.id}
                          title={residence?.name}
                          subText={`کد اقامتگاه : ${residence?.reference}`}
                          imgSrc={residence?.image_url}
                          type={ResidenceTypes_enum.PRODUCT}
                        />
                      );
                    }),
                    ...(eligibleRoomsToBeListed || []).map((room: any, index: number) => {
                      return (
                        <Cart
                          key={index}
                          value={room.id}
                          title={room.name}
                          subText={`کد اتاق : ${room.id}`}
                          imgSrc={room.image_url}
                          type={ResidenceTypes_enum.ROOM}
                        />
                      );
                    }),
                  ]}
                </DropDown>
              )}

              <div className="mb-16 mt-16">
                <Calendar
                  // initialDateToWorkWith
                  dateToWorkWith={dateToWorkWith}
                  // setDateToWorkWith={setDateToWorkWith}
                  onMonthInc={() => {
                    setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                  }}
                  onMonthDec={() => {
                    setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                  }}
                  filledDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).filled_dates.map((filled_date) =>
                          moment(filled_date, "YYYY-M-D")
                        )
                  }
                  noCoOperation={false}
                  alreadyReservedDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).reserved_dates.map((reserved_date) =>
                          moment(reserved_date, "YYYY-M-D")
                        )
                  }
                  offDays={[]} // TODO
                  peakDays={getPeakDays(
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData)?.peak_dates
                  )}
                  fastReserveDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).fast_days.map((fast_day) =>
                          moment(fast_day, "YYYY-M-D")
                        )
                  }
                  discounted_days={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).discounted_days.map(
                          (discounted_day) => ({
                            ...discounted_day,
                            date: moment(discounted_day.date, "YYYY-M-D"),
                          })
                        )
                  }
                  special_dates={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).special_dates.map((special_date) => [
                          moment(special_date[0], "YYYY-M-D"),
                          special_date[1],
                        ])
                  }
                  prices={
                    selectedResidenceValue === "all"
                      ? {
                          extra_guests_price: 0,
                          monthly_discount: 0,
                          peak_price: 0,
                          week_price: 0,
                          weekend_price: 0,
                          weekly_discount: 0,
                        }
                      : (calendarData as IServerCalendarData)?.prices
                  }
                  onlyShowCalendarDateNumber={selectedResidenceValue === "all"}
                  isRangeEnabled={isRangeEnabled}
                  // SELECTING Props
                  selectedRanges={selectedRanges}
                  setSelectedRanges={setSelectedRanges}
                  selectedIndividualDays={selectedIndividualDays}
                  setSelectedIndividualDays={setSelectedIndividualDays}
                />
              </div>

              <div className="flex items-center justify-between mb-24">
                <CalendarHelp />

                <Switch
                  name={"range-select"}
                  label={"انتخاب بازه ای"}
                  checked={isRangeEnabled}
                  onChange={(e) => {
                    setIsRangeEnabled(e.target.checked);
                  }}
                />
              </div>

              <div className="mt-24">
                <span className="text-14 leading-24 text-black font-m ml-4">توجه : </span>
                <span className="text-12 leading-21 text-black font-l">
                  در صورت تمایل به فعالسازی رزرو آنی، از خالی بودن اقامتگاه در روزهای انتخاب شده
                  اطمینان حاصل کنید. در غیر اینصورت و در صورت لغو رزرو پس از قطعی شدن، رتبه اقامتگاه
                  شما و احتمال رزرو آن کاهش پیدا خواهد کرد
                </span>
              </div>
            </div>

            <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto">
              {!selectedIndividualDays.length && !selectedRanges.length ? (
                <Button isFullWidth color="grey">
                  حداقل یک روز را انتخاب کنید
                </Button>
              ) : (
                <div className="grid grid-cols-3 gap-x-12">
                  <div className="col-span-1">
                    <Button
                      isFullWidth
                      color="grey"
                      onClick={() => resetAllSelectedDays()}
                      className="!px-10"
                    >
                      پاک کردن
                    </Button>
                  </div>
                  <div className="col-span-2">
                    <Button
                      isFullWidth
                      disabled={!!selectedRanges.find((selectedRange) => selectedRange[1] === null)}
                      className="!px-4"
                      type="submit"
                      onClick={() => setShowFastOrUnfastConfirmBottomSheet(true)}
                    >
                      {getBtnText()}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <BottomSheet
              open={showFastOrUnfastConfirmBottomSheet}
              handleClose={() => setShowFastOrUnfastConfirmBottomSheet(false)}
              headerTitle="رزرو آنی"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <FastOrUnfastConfirmBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    datesToFastOrUnfast={getAllUniqueSelectedDays_Array(
                      selectedIndividualDays,
                      selectedRanges
                    )}
                    isAllResidencesSelected={selectedResidenceValue === "all"}
                    payload={{
                      eligibleRoomsIds:
                        eligibleRoomsToBeListed
                          ?.filter((room) => room?.state === ResidenceStates_enum.ACTIVE)
                          ?.map((r) => r.id as number) || [],
                      productIds:
                        residencesList
                          ?.filter((res) => res?.state === ResidenceStates_enum.ACTIVE)
                          ?.map((res) => res.id) || [],
                    }}
                    resetAllSelectedDays={resetAllSelectedDays}
                  />
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
export default EditResidenceFastReserveSettings;
