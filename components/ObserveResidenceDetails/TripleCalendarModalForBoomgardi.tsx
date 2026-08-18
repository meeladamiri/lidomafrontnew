import ModalWrapper from "components/General/core/ModalWrapper";
import moment from "moment-jalaali";
import { Dispatch, SetStateAction, useState } from "react";
import Calendar from "../Calendar";
import { Button } from "../General/core/Button";

function TripleCalendarModalForBoomgardi({
  isModalOpen,
  handleClose,
  selectedRanges,
  setSelectedRanges,
  onSubmit,
  noCoOperation,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  //
  selectedRanges: [moment.Moment, moment.Moment | null][];
  setSelectedRanges: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  onSubmit: (givenSelectedRanges: [moment.Moment, moment.Moment | null][]) => void;
  noCoOperation: boolean;
}) {
  const [dateToWorkWith, _] = useState(moment(new Date()));

  const [localSelectedRanges, setLocalSelectedRanges] =
    useState<[moment.Moment, moment.Moment | null][]>(selectedRanges);

  return (
    <ModalWrapper
      headerTitle="تاریخ سفر"
      onClose={() => {
        // Lets reset the selectRanges. --> so we can see all rooms of boomgardi regardless of which day was selected.
        setSelectedRanges([]);
        handleClose();
      }}
      open={isModalOpen}
      modalClassname="!z-[12]" // to display this modal above the 'SelectRoomsModal' when user clicks on 'ویرایش تقویم' from inside 'ConfirmReserveDetailsBottomSheet'.
    >
      <div className="pb-54">
        <div className="py-8 px-16 bg-gray-F4F5F6 rounded-full w-full flex items-center justify-evenly mb-20">
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

        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone()}
            filledDays={[]}
            noCoOperation={noCoOperation}
            alreadyReservedDays={[]}
            offDays={[]} // TODO
            peakDays={[]}
            fastReserveDays={[]}
            discounted_days={[]}
            special_dates={[]}
            prices={{
              extra_guests_price: 0,
              monthly_discount: 0,
              peak_price: 0,
              week_price: 0,
              weekend_price: 0,
              weekly_discount: 0,
            }}
            onlyShowCalendarDateNumber
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
          />
        </div>

        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone().add(1, "jMonth")}
            filledDays={[]}
            noCoOperation={noCoOperation}
            alreadyReservedDays={[]}
            offDays={[]} // TODO
            peakDays={[]}
            fastReserveDays={[]}
            discounted_days={[]}
            special_dates={[]}
            prices={{
              extra_guests_price: 0,
              monthly_discount: 0,
              peak_price: 0,
              week_price: 0,
              weekend_price: 0,
              weekly_discount: 0,
            }}
            onlyShowCalendarDateNumber
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
          />
        </div>

        <div className="mb-24">
          <Calendar
            dateToWorkWith={dateToWorkWith.clone().add(2, "jMonth")}
            filledDays={[]}
            noCoOperation={noCoOperation}
            alreadyReservedDays={[]}
            offDays={[]} // TODO
            peakDays={[]}
            fastReserveDays={[]}
            discounted_days={[]}
            special_dates={[]}
            prices={{
              extra_guests_price: 0,
              monthly_discount: 0,
              peak_price: 0,
              week_price: 0,
              weekend_price: 0,
              weekly_discount: 0,
            }}
            onlyShowCalendarDateNumber
            isRangeEnabled={true}
            // SELECTING Props
            selectedRanges={localSelectedRanges}
            setSelectedRanges={setLocalSelectedRanges}
            showNavigateToPrevMonthBtn={false}
            showNavigateToNextMonthBtn={false}
            canOnlySelectOneRange
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 right-0 left-0 pt-12 pb-16 px-20 bg-white z-2">
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
                    onSubmit(localSelectedRanges);
                  }
                }
              }}
            >
              {localSelectedRanges.length === 0
                ? "انتخاب تاریخ ورود"
                : localSelectedRanges.length === 1
                ? !!localSelectedRanges[0][1]
                  ? "تأیید تاریخ"
                  : "انتخاب تاریخ خروج"
                : ""}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default TripleCalendarModalForBoomgardi;
