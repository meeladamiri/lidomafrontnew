import dynamic from "next/dynamic";
import { Button } from "@/components/General/core/Button";
import { useEffect, useState } from "react";
import { useSuitPropertyPageData } from "@/providers/SuitPropertyPage";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { useGetCalendarData } from "Hooks/ObserveResidence/useGetCalendarData";
import { useRouter } from "next/router";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
const PercentBox = dynamic(() => import("@/components/General/PercentBox"), {
  ssr: true,
});
const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});
const ChooseEnterAndExitDaysCalendarModal = dynamic(
  () => import("../ChooseEnterAndExitDaysCalendarModal"),
  {
    ssr: true,
  }
);
const ConfirmGuestInfoForReserveBottomSheet = dynamic(
  () => import("../ConfirmGuestInfoForReserveBottomSheet"),
  {
    ssr: true,
  }
);
const ConfirmReserveDetailsBottomSheet = dynamic(
  () => import("../ConfirmReserveDetailsBottomSheet"),
  {
    ssr: true,
  }
);

const confirmGuestInfoInitV = {
  show: false,
  payload: {
    name: "",
    phoneNumber: "",
  },
};

const confirmReserveDetailsInitV = {
  show: false,
  payload: {
    openingConfirmReserveBottomSheetFromObservePage: false,
  },
};

function SuitMobileBottomFloater() {
  const router = useRouter();
  const { query } = useRouter();
  const [showConfirmReserveDetailsBottomSheet, setShowConfirmReserveDetailsBottomSheet] = useState(
    confirmReserveDetailsInitV
  );
  const [showConfirmGuestInfoForReserveBottomSheet, setShowConfirmGuestInfoForReserveBottomSheet] =
    useState(confirmGuestInfoInitV);
  const [showChooseEnterAndExitDaysCalendarModal, setShowChooseEnterAndExitDaysCalendarModal] =
    useState<boolean>(false);

  const { data: calendarData } = useGetCalendarData({
    residenceOrRoomId: Number(query?.id),
    residenceType: ResidenceTypes_enum.PRODUCT, // bcz we are in suit
  });

  const {
    selectedRanges,
    setSelectedRanges,
    guestInfo,
    setGuestInfo,
    numberOfPeople,
    setNumberOfPeople,
    checkoutData,
    checkoutTotal,
    weeklyDiscountAmount,
    monthlyDiscountAmount,
    submitReserve,
    discountedDaysStatistics,
    discountAmounts,
  } = useSuitPropertyPageData();
  const { data } = useGetObserveResidence();

  const resp: IObserveResidenceData = data?.params;
  const discount = resp?.residence_info?.price_details?.discount;
  const original_price = resp?.residence_info?.price_details?.original_price;

  useEffect(() => {
    if (!!router?.query?.guests_count) {
      setNumberOfPeople(Number(router?.query?.guests_count));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end]);

  return (
    <>
      <div
        className="fixed bottom-0 right-0 left-0 z-2 bg-white px-20 py-16"
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            {!!discount && (
              <div className="flex items-center flex-row-reverse gap-x-8 mb-6">
                <PercentBox value={discount} />
                <p className="text-12 leading-16 text-gray-959FA7 font-l line-through">
                  {original_price?.toLocaleString("en-US")} تومان
                </p>
              </div>
            )}

            <p className="flex items-center gap-x-4">
              <span className="text-14 leading-20 text-gray-959FA7 font-r">از :</span>
              <span className="text-16 leading-24 text-black font-m">
                {(!discount
                  ? original_price
                  : original_price - original_price * (discount / 100)
                )?.toLocaleString("en-US")}{" "}
                تومان
              </span>
            </p>
          </div>

          <Button
            className="px-36"
            onClick={() => {
              if (selectedRanges.length === 0) {
                setShowChooseEnterAndExitDaysCalendarModal(true);
              } else if (selectedRanges.length === 1) {
                if (!selectedRanges[0][1]) {
                  return;
                } else {
                  // show 'confirm reserve details bottom sheet'
                  setShowConfirmReserveDetailsBottomSheet({
                    show: true,
                    payload: {
                      openingConfirmReserveBottomSheetFromObservePage: true,
                    },
                  });
                }
              }
            }}
            disabled={selectedRanges.length === 1 && !selectedRanges[0][1]}
          >
            {selectedRanges.length === 0
              ? "انتخاب تاریخ"
              : selectedRanges.length === 1
              ? !!selectedRanges[0][1]
                ? "درخواست رزرو"
                : "انتخاب تاریخ خروج"
              : ""}
          </Button>
        </div>
      </div>

      {!!showConfirmReserveDetailsBottomSheet.show && (
        <BottomSheet
          open={!!showConfirmReserveDetailsBottomSheet.show}
          handleClose={() => setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV)}
          headerTitle={"جزئیات رزرو"}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ConfirmReserveDetailsBottomSheet
                handleSmoothClose={handleSmoothClose}
                //
                n_of_discounted_special_days={discountedDaysStatistics.n_of_discounted_special_days}
                n_of_discounted_peak_days={discountedDaysStatistics.n_of_discounted_peak_days}
                n_of_discounted_weekends={discountedDaysStatistics.n_of_discounted_weekends}
                n_of_discounted_normaldays={discountedDaysStatistics.n_of_discounted_normaldays}
                orderTotalDiscountAmount={
                  discountAmounts.special_days_total_discount_amount +
                  discountAmounts.peak_days_total_discount_amount +
                  discountAmounts.weekends_total_discount_amount +
                  discountAmounts.normaldays_total_discount_amount +
                  monthlyDiscountAmount +
                  weeklyDiscountAmount
                }
                // payload={showFacilityDetailsBottomSheet.payload}
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
                entranceDate={`
          ${parseInt(selectedRanges?.[0]?.[0]?.format("jDD"))} 
          ${selectedRanges?.[0]?.[0]?.format("jMMMM")}
          `}
                exitDate={`
          ${parseInt((selectedRanges?.[0]?.[1] as moment.Moment)?.format("jDD"))} 
          ${(selectedRanges?.[0]?.[1] as moment.Moment)?.format("jMMMM")}
          `}
                guestName={guestInfo.name}
                guestPhoneNumber={guestInfo.phone}
                openingThisBottomSheetFromObservePage={
                  showConfirmReserveDetailsBottomSheet.payload
                    .openingConfirmReserveBottomSheetFromObservePage
                }
                setShowChooseEnterAndExitDaysCalendarModal={
                  setShowChooseEnterAndExitDaysCalendarModal
                }
                onClickOfReturnBtn={() => {
                  if (
                    showConfirmReserveDetailsBottomSheet.payload
                      .openingConfirmReserveBottomSheetFromObservePage
                  ) {
                    handleSmoothClose();
                  } else {
                    handleSmoothClose();

                    setShowChooseEnterAndExitDaysCalendarModal(true);
                  }
                }}
                onClickOfEditTravelDate={() => {
                  // if (
                  //   showConfirmReserveDetailsBottomSheet.payload
                  //     .openingConfirmReserveBottomSheetFromObservePage
                  // ) {
                  //   handleSmoothClose();
                  // } else {
                  //   handleSmoothClose();
                  //   setTimeout(() => {
                  //     setShowChooseEnterAndExitDaysCalendarModal(true);
                  //   }, 200); // bcz this bottom sheet is gonna close after 200ms;
                  // }
                  handleSmoothClose();
                  setTimeout(() => {
                    setShowChooseEnterAndExitDaysCalendarModal(true);
                  }, 200); // bcz this bottom sheet is gonna close after 200ms;
                }}
                onTapOfEditGuestInfo={() => {
                  handleSmoothClose();
                  setShowConfirmGuestInfoForReserveBottomSheet({
                    show: true,
                    payload: { name: guestInfo.name, phoneNumber: guestInfo.phone },
                  });
                }}
                resMaxCapacity={resp?.residence_info?.max_capacity}
                //
                selectedRanges={selectedRanges}
                checkoutData={checkoutData}
                checkoutTotal={checkoutTotal}
                calendarData={calendarData}
                weeklyDiscountAmount={weeklyDiscountAmount}
                monthlyDiscountAmount={monthlyDiscountAmount}
                //
                onReadyToSubmitReserve={() => submitReserve()}
                baseCapacityOfSelectedResOrRoom={resp?.residence_info?.capacity || 0}
                single_extra_guest_price={resp?.residence_info?.price_details?.extra_price || 0}
              />
            );
          }}
        />
      )}

      {!!showConfirmGuestInfoForReserveBottomSheet.show && (
        <BottomSheet
          open={!!showConfirmGuestInfoForReserveBottomSheet.show}
          handleClose={() => setShowConfirmGuestInfoForReserveBottomSheet(confirmGuestInfoInitV)}
          headerTitle={"اطلاعات مهمان"}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ConfirmGuestInfoForReserveBottomSheet
                handleSmoothClose={handleSmoothClose}
                onTapOfReturnBtn={() => {
                  handleSmoothClose();

                  setShowConfirmReserveDetailsBottomSheet({
                    show: true,
                    payload: {
                      openingConfirmReserveBottomSheetFromObservePage: true,
                    },
                  });
                }}
                guestName={showConfirmGuestInfoForReserveBottomSheet.payload.name}
                guestPhoneNumber={showConfirmGuestInfoForReserveBottomSheet.payload.phoneNumber}
                onFormSubmit={(newGuestName: string) => {
                  setGuestInfo((prev) => ({
                    ...prev,
                    name: newGuestName,
                  }));
                  handleSmoothClose();

                  setShowConfirmReserveDetailsBottomSheet({
                    show: true,
                    payload: {
                      openingConfirmReserveBottomSheetFromObservePage: true,
                    },
                  });
                }}
              />
            );
          }}
        />
      )}

      {!!showChooseEnterAndExitDaysCalendarModal && (
        <ChooseEnterAndExitDaysCalendarModal
          isModalOpen={showChooseEnterAndExitDaysCalendarModal}
          handleClose={() => setShowChooseEnterAndExitDaysCalendarModal(false)}
          min_reservable_days={resp?.residence_info.min_reservable_days || 1}
          discounted_days={calendarData?.params?.discounted_days}
          fast_days={calendarData?.params?.fast_days}
          filled_dates={calendarData?.params?.filled_dates}
          noCoOperation={resp?.residence_info.is_full}
          peak_dates={calendarData?.params?.peak_dates}
          reserved_dates={calendarData?.params?.reserved_dates}
          special_dates={calendarData?.params?.special_dates}
          prices={calendarData?.params?.prices}
          selectedRanges={selectedRanges}
          setSelectedRanges={setSelectedRanges}
          checkForAlreadyReservedDatesOrFilledDatesValidity
          // dateToWorkWith={dateToWorkWith}
          // setDateToWorkWith={setDateToWorkWith}
          onSubmit={(givenSelectedRanges: [moment.Moment, moment.Moment | null][]) => {
            setSelectedRanges(givenSelectedRanges);
            // close the modal
            setShowChooseEnterAndExitDaysCalendarModal(false);
            // open up 'confirm reserve details bottom sheet'
            setShowConfirmReserveDetailsBottomSheet({
              show: true,
              payload: {
                openingConfirmReserveBottomSheetFromObservePage: false,
              },
            });
          }}
        />
      )}
    </>
  );
}

export default SuitMobileBottomFloater;
