import { IServerCalendarData, IServerCalendarData_discounted_day } from "@/api/Calendar/Calendar";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";
import ModalWrapper from "components/General/core/ModalWrapper";
import moment from "moment-jalaali";
import { Dispatch, SetStateAction, useState } from "react";
import Calendar from "../Calendar";
import { Button } from "../General/core/Button";

function ChooseEnterAndExitDaysCalendarModal({
  isModalOpen,
  handleClose,
  selectedRanges,
  setSelectedRanges,
  // dateToWorkWith,
  // setDateToWorkWith,
  filled_dates,
  reserved_dates,
  peak_dates,
  fast_days,
  discounted_days,
  special_dates,
  prices,
  min_reservable_days,
  onSubmit,
  noCoOperation,
  checkForAlreadyReservedDatesOrFilledDatesValidity = false
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  //
  selectedRanges: [moment.Moment, moment.Moment | null][];
  setSelectedRanges: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  // dateToWorkWith: moment.Moment;
  // setDateToWorkWith: Dispatch<SetStateAction<moment.Moment>>;
  filled_dates: IServerCalendarData["filled_dates"][];
  reserved_dates: IServerCalendarData["reserved_dates"][];
  peak_dates: IServerCalendarData["peak_dates"];
  fast_days: IServerCalendarData["fast_days"][];
  discounted_days: IServerCalendarData_discounted_day[];
  special_dates: IServerCalendarData["special_dates"];
  prices: any;
  min_reservable_days: number | undefined;
  onSubmit: (givenSelectedRanges: [moment.Moment, moment.Moment][]) => void;
  noCoOperation: boolean;
  checkForAlreadyReservedDatesOrFilledDatesValidity?: boolean
}) {
  const [dateToWorkWith, _] = useState(moment(new Date()));

  const [localSelectedRanges, setLocalSelectedRanges] =
    useState<[moment.Moment, moment.Moment | null][]>(selectedRanges);

  return (
    <ModalWrapper
      headerTitle="تاریخ سفر"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname="md:w-[420px]"
      bodyContainerClassname="pt-[124px] md:pt-0 md:pb-0"
      headerExtraEl={
        <div className="px-20 pb-20 bg-white">
          <div className="py-8 px-16 bg-gray-F4F5F6 rounded-full w-full flex items-center justify-evenly">
            <div className="flex items-center gap-x-4">
              <span className="text-14 leading-24 font-l text-black">ورود :</span>
              <span className="text-14 leading-24 font-r text-black">
                {localSelectedRanges.length === 1
                  ? localSelectedRanges[0][0].format("jYYYY/jMM/jDD")
                  : "انتخاب کنید"}
              </span>
            </div>

            <i className="icon-CalendarFlash text-24 text-black" />

            <div className="flex items-center gap-x-4">
              <span className="text-14 leading-24 font-l text-black">خروج :</span>
              <span className="text-14 leading-24 font-r text-black">
                {localSelectedRanges.length === 1 && localSelectedRanges[0][1]
                  ? localSelectedRanges[0][1].format("jYYYY/jMM/jDD")
                  : "انتخاب کنید"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-54">
        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone()}
            // setDateToWorkWith={setDateToWorkWith}
            // onMonthInc={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
            // }}
            // onMonthDec={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
            // }}
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
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            // selectedIndividualDays={selectedIndividualDays}
            // setSelectedIndividualDays={setSelectedIndividualDays}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
            checkForAlreadyReservedDatesOrFilledDatesValidity={checkForAlreadyReservedDatesOrFilledDatesValidity}
          />
        </div>

        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone().add(1, "jMonth")}
            // setDateToWorkWith={setDateToWorkWith}
            // onMonthInc={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
            // }}
            // onMonthDec={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
            // }}
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
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            // selectedIndividualDays={selectedIndividualDays}
            // setSelectedIndividualDays={setSelectedIndividualDays}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
            checkForAlreadyReservedDatesOrFilledDatesValidity={checkForAlreadyReservedDatesOrFilledDatesValidity}
          />
        </div>

        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone().add(2, "jMonth")}
            // setDateToWorkWith={setDateToWorkWith}
            // onMonthInc={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
            // }}
            // onMonthDec={() => {
            //   setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
            // }}
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
            special_dates={special_dates?.map((special_date) => {
              return [moment(special_date[0], "YYYY-M-D"), special_date[1]];
            })}
            prices={prices}
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            // selectedIndividualDays={selectedIndividualDays}
            // setSelectedIndividualDays={setSelectedIndividualDays}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
            checkForAlreadyReservedDatesOrFilledDatesValidity={checkForAlreadyReservedDatesOrFilledDatesValidity}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed md:sticky bottom-0 right-0 left-0 pt-12 pb-16 px-20 md:px-0 bg-white z-2">
        <div className="grid grid-cols-3 gap-x-12">
          <div className="col-span-1">
            <Button
              isFullWidth
              color="grey"
              onClick={() => {
                if (localSelectedRanges.length === 0) {
                  handleClose();
                } else if (localSelectedRanges.length === 1) {
                  // clear selected range
                  setLocalSelectedRanges([]);
                }
              }}
            >
              {localSelectedRanges.length === 0
                ? "انصراف"
                : localSelectedRanges.length === 1
                ? "پاک کردن"
                : ""}
            </Button>
          </div>
          <div className="col-span-2">
            <Button
              isFullWidth
              type="submit"
              disabled={
                localSelectedRanges.length === 0 ||
                (localSelectedRanges.length === 1 && !localSelectedRanges[0][1])
              }
              onClick={() => {
                if (localSelectedRanges.length === 0) {
                  return;
                } else if (localSelectedRanges.length === 1) {
                  if (!localSelectedRanges[0][1]) {
                    return;
                  } else {
                    onSubmit(localSelectedRanges as [moment.Moment, moment.Moment][]);
                  }
                }
              }}
            >
              {localSelectedRanges.length === 0
                ? "تاریخ ورود را انتخاب کنید"
                : localSelectedRanges.length === 1
                ? !!localSelectedRanges[0][1]
                  ? "تأیید تاریخ"
                  : "تاریخ خروج را انتخاب کنید"
                : ""}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default ChooseEnterAndExitDaysCalendarModal;
