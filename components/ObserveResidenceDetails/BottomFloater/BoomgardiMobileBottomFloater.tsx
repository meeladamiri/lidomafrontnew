import { Button } from "../../General/core/Button";
import dynamic from "next/dynamic";
import moment from "moment-jalaali";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
import { THandleSmoothClose } from "../../General/core/BottomSheet";
import { IServerCalendarData } from "@/api/Calendar/Calendar";
import { useEffect, useState } from "react";
import { IAvailableRoom } from "@/api/Boomgardi";
import { useGetCalendarData } from "Hooks/ObserveResidence/useGetCalendarData";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { useRouter } from "next/router";
// import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { removeQueryParametersWithoutScrolling } from "@/utilities/URL/removeQueryParametersWithoutScrolling";
const PercentBox = dynamic(() => import("../../General/PercentBox"), {
  ssr: true,
});
const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});
const ConfirmReserveDetailsBottomSheet = dynamic(
  () => import("../ConfirmReserveDetailsBottomSheet"),
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
const TripleCalendarModalForBoomgardi = dynamic(
  () => import("../TripleCalendarModalForBoomgardi"),
  {
    ssr: true,
  }
);
const SelectRoomsModal = dynamic(() => import("../SelectRoomsModal"), {
  ssr: true,
});

interface I_ConfirmGuestInfo {
  show: boolean;
  payload: {
    name: string;
    phoneNumber: string;
    selectedRoomByUser: IAvailableRoom | undefined;
  };
}

const confirmGuestInfoInitV: I_ConfirmGuestInfo = {
  show: false,
  payload: {
    name: "",
    phoneNumber: "",
    selectedRoomByUser: undefined,
  },
};

const confirmReserveDetailsInitV = {
  show: false,
  payload: {
    openingConfirmReserveBottomSheetFromObservePage: false,
  },
};

function BoomgardiMobileBottomFloater() {
  const {
    showTripleCalendar,
    setShowTripleCalendar,
    numberOfPeople,
    setNumberOfPeople,
    selectedRanges,
    setSelectedRanges,
    guestInfo,
    setGuestInfo,
    checkoutData,
    checkoutTotal,
    weeklyDiscountAmount,
    monthlyDiscountAmount,
    selectedRoomByUser,
    setSelectedRoomByUser,
    submitReserve,
    discountedDaysStatistics,
    discountAmounts,
  } = useBoomgardiPropertyPageData();
  const { data } = useGetObserveResidence();
  const router = useRouter();
  const { data: calendarData } = useGetCalendarData({
    residenceOrRoomId: selectedRoomByUser?.id,
    residenceType: ResidenceTypes_enum.ROOM, // bcz we are in boomgardi
  });
  const resp: IObserveResidenceData = data?.params;

  const discount = resp?.residence_info?.price_details?.discount;
  const original_price = resp?.residence_info?.price_details?.original_price;

  // Modal states
  const [showSelectingRoomsModal, setShowSelectingRoomsModal] = useState(false);
  const [showConfirmGuestInfoForReserveBottomSheet, setShowConfirmGuestInfoForReserveBottomSheet] =
    useState(confirmGuestInfoInitV);
  const [showConfirmReserveDetailsBottomSheet, setShowConfirmReserveDetailsBottomSheet] = useState(
    confirmReserveDetailsInitV
  );

  function clearCalendarFilterFromUrlFilters() {
    removeQueryParametersWithoutScrolling(router, [{ paramKey: "start" }, { paramKey: "end" }]);
  }

  useEffect(() => {
    if (!!router?.query?.start && !!router?.query?.end) {
      setSelectedRanges([
        [
          moment(router?.query?.start, "jYYYY/jMM/jDD"),
          moment(router?.query?.end, "jYYYY/jMM/jDD"),
        ],
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.start, router?.query?.end, showTripleCalendar]);

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
              selectedRanges.length === 1 && !!selectedRanges[0][1]
                ? setShowSelectingRoomsModal(true)
                : setShowTripleCalendar(true)
            }}
          >
            {selectedRanges.length === 1 && !!selectedRanges[0][1] ? "انتخاب اتاق" : "انتخاب تاریخ"}
          </Button>
        </div>
      </div>

      {!!showConfirmReserveDetailsBottomSheet.show && (
        <BottomSheet
          open={!!showConfirmReserveDetailsBottomSheet.show}
          handleClose={() => {
            setSelectedRoomByUser(undefined);
            setShowConfirmReserveDetailsBottomSheet(confirmReserveDetailsInitV);
          }}
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
                //
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
                // TODO: In bashe?
                openingThisBottomSheetFromObservePage={
                  showConfirmReserveDetailsBottomSheet.payload
                    .openingConfirmReserveBottomSheetFromObservePage
                }
                setShowChooseEnterAndExitDaysCalendarModal={setShowTripleCalendar}
                onClickOfReturnBtn={() => {
                  if (
                    showConfirmReserveDetailsBottomSheet.payload
                      .openingConfirmReserveBottomSheetFromObservePage
                  ) {
                    handleSmoothClose();
                  } else {
                    handleSmoothClose();

                    setShowSelectingRoomsModal(true);
                  }
                }}
                onClickOfEditTravelDate={() => {
                  setShowConfirmReserveDetailsBottomSheet((prev) => {
                    return {
                      // ...prev,
                      show: false,
                      payload: {
                        openingConfirmReserveBottomSheetFromObservePage: false,
                      },
                    };
                  });
                  //
                  setShowTripleCalendar(true);
                }}
                onTapOfEditGuestInfo={() => {
                  setShowConfirmGuestInfoForReserveBottomSheet({
                    show: true,
                    payload: {
                      name: guestInfo.name,
                      phoneNumber: guestInfo.phone,
                      selectedRoomByUser,
                    },
                  });
                  handleSmoothClose();
                }}
                resMaxCapacity={selectedRoomByUser?.max_capacity || 1}
                //
                selectedRanges={selectedRanges}
                checkoutData={checkoutData}
                checkoutTotal={checkoutTotal}
                calendarData={calendarData}
                weeklyDiscountAmount={weeklyDiscountAmount}
                monthlyDiscountAmount={monthlyDiscountAmount}
                //
                onReadyToSubmitReserve={() => {
                  submitReserve();
                }}
                single_extra_guest_price={
                  (calendarData?.params as IServerCalendarData)?.prices.extra_guests_price || 0
                }
                baseCapacityOfSelectedResOrRoom={selectedRoomByUser?.capacity as number}
              />
            );
          }}
        />
      )}

      {!!showConfirmGuestInfoForReserveBottomSheet.show && (
        <BottomSheet
          open={!!showConfirmGuestInfoForReserveBottomSheet.show}
          handleClose={() => {
            setSelectedRoomByUser(
              showConfirmGuestInfoForReserveBottomSheet?.payload?.selectedRoomByUser
            );

            setShowConfirmGuestInfoForReserveBottomSheet(confirmGuestInfoInitV);
            setShowConfirmReserveDetailsBottomSheet({
              show: true,
              payload: {
                openingConfirmReserveBottomSheetFromObservePage: false,
              },
            });
          }}
          headerTitle={"اطلاعات مهمان"}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ConfirmGuestInfoForReserveBottomSheet
                handleSmoothClose={() => {
                  handleSmoothClose();
                }}
                onTapOfReturnBtn={() => {
                  handleSmoothClose();
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

      {!!showTripleCalendar && (
        <TripleCalendarModalForBoomgardi
          isModalOpen={showTripleCalendar}
          handleClose={() => setShowTripleCalendar(false)}
          selectedRanges={selectedRanges}
          setSelectedRanges={setSelectedRanges}
          noCoOperation={resp?.residence_info?.is_full}
          onSubmit={(givenSelectedRanges: [moment.Moment, moment.Moment | null][]) => {
            setSelectedRanges(givenSelectedRanges);
            if (!!givenSelectedRanges?.[0]?.[0] && !!givenSelectedRanges?.[0]?.[1]) {
              // remove possible previous 'start' and 'end' params from url, then add new ones.
              removeSomeQueryParameters_Then_AddSomeQueryParameters(
                router,
                ["start", "end"],
                [
                  ["start", givenSelectedRanges[0][0].format("jYYYY/jMM/jDD")],
                  ["end", givenSelectedRanges[0][1].format("jYYYY/jMM/jDD")],
                ]
              );
            }
            // close the modal
            setShowTripleCalendar(false);
            // open up 'select rooms modal'
            // when selectedRange is changed, the api is called again to fetch available rooms for that range.
            // so when selectedRange is changed, user should select the room again. maybe the prevoius selected room is not available to be reserved for the new selectedRange.
            setShowSelectingRoomsModal(true);

            // setSelectedRanges(givenSelectedRanges);
            // // close the modal
            // setShowTripleCalendar(false);
            // if (!selectedRoomByUser) {
            //   // open up 'select rooms modal'
            //   setShowSelectingRoomsModal(true);
            // } else {
            //   setShowConfirmReserveDetailsBottomSheet({
            //     show: true,
            //     payload: {
            //       openingConfirmReserveBottomSheetFromObservePage: false,
            //     },
            //   });
            // }
          }}
        />
      )}

      {!!showSelectingRoomsModal && (
        <SelectRoomsModal
          isModalOpen={showSelectingRoomsModal}
          handleClose={() => setShowSelectingRoomsModal(false)}
          // onClickOfChangeTravelDate={() => {
          //   setShowSelectingRoomsModal(false);
          //   setShowTripleCalendar(true);
          // }}
          onRoomSelect={(selectedRoom: IAvailableRoom) => {
            setSelectedRoomByUser(selectedRoom);
            // setShowSelectingRoomsModal(false);
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

export default BoomgardiMobileBottomFloater;
