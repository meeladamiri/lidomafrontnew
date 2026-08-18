import { IServerCalendarData } from "@/api/Calendar/Calendar";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Dispatch, SetStateAction, useState } from "react";
import Checkout from "../General/Checkout";
import { Button } from "../General/core/Button";
import Counter from "../General/Counter";
import YouHaveNotEnteredNOfPeopleYet from "../General/YouHaveNotEnteredNOfPeopleYet";
import { I_CheckoutData } from "@/interfaces/PropertyPages/Boomgardi/CheckoutData";

function ConfirmReserveDetailsBottomSheet({
  handleSmoothClose,
  isEditReserve = false,
  numberOfPeople,
  setNumberOfPeople,
  entranceDate,
  exitDate,
  guestName,
  guestPhoneNumber,
  openingThisBottomSheetFromObservePage,
  onTapOfEditGuestInfo,
  setShowChooseEnterAndExitDaysCalendarModal,
  resMaxCapacity,
  selectedRanges,
  checkoutData,
  checkoutTotal,
  orderTotalDiscountAmount,
  //
  n_of_discounted_special_days,
  n_of_discounted_peak_days,
  n_of_discounted_weekends,
  n_of_discounted_normaldays,
  //
  calendarData,
  weeklyDiscountAmount = 0,
  monthlyDiscountAmount = 0,
  onReadyToSubmitReserve,
  onClickOfReturnBtn,
  single_extra_guest_price,
  baseCapacityOfSelectedResOrRoom,
  onClickOfEditTravelDate,
}: {
  handleSmoothClose: THandleSmoothClose;
  isEditReserve?: boolean;
  numberOfPeople: number;
  setNumberOfPeople: Dispatch<SetStateAction<number>>;
  entranceDate: string;
  exitDate: string;
  guestName: string;
  guestPhoneNumber: string;
  openingThisBottomSheetFromObservePage: boolean;
  onTapOfEditGuestInfo: () => void;
  setShowChooseEnterAndExitDaysCalendarModal: Dispatch<SetStateAction<boolean>>;
  resMaxCapacity?: number;
  selectedRanges?: [moment.Moment, moment.Moment | null][];
  checkoutData?: I_CheckoutData;
  checkoutTotal: number;
  orderTotalDiscountAmount: number;
  //
  n_of_discounted_special_days: number;
  n_of_discounted_normaldays: number;
  n_of_discounted_weekends: number;
  n_of_discounted_peak_days: number;
  //
  calendarData?: { params?: IServerCalendarData };
  weeklyDiscountAmount?: number;
  monthlyDiscountAmount?: number;
  //
  onReadyToSubmitReserve: () => void;
  onClickOfReturnBtn: () => void;
  single_extra_guest_price: number;
  baseCapacityOfSelectedResOrRoom: number;
  onClickOfEditTravelDate: () => void;
}) {
  const [showNumberOfPeopleAlert, setShowNumberOfPeopleAlert] = useState(false);

  function handleSubmit() {
    if (numberOfPeople === 0) {
      setShowNumberOfPeopleAlert(true);
    } else {
      onReadyToSubmitReserve();
    }
  }

  return (
    <div className="relative max-h-[360px] md:h-auto md:max-h-none overflow-y-auto pb-54">
      <div className="flex items-center justify-between mb-24">
        <div className="flex items-center gap-x-12">
          <i className="icon-Calendar text-24 text-black" />
          <div className="">
            <p className="text-12 leading-21 font-l text-black">تاریخ سفر</p>
            <p className="text-14 leading-24 font-r text-black mt-4">
              {entranceDate} تا {exitDate}
            </p>
          </div>
        </div>

        <Button
          color="grey"
          onClick={() => {
            // if (openingThisBottomSheetFromObservePage) {
            //   handleSmoothClose();
            // } else {
            //   handleSmoothClose();

            //   setTimeout(() => {
            //     setShowChooseEnterAndExitDaysCalendarModal(true);
            //   }, 200); // bcz this bottom sheet is gonna close after 200ms;
            // }
            onClickOfEditTravelDate();
          }}
        >
          ویرایش
        </Button>
      </div>

      <div className="relative flex items-center justify-between mb-24">
        <div className="flex items-center gap-x-12">
          <i className="icon-Profile text-24 text-black" />
          <div className="">
            <p className="text-12 leading-21 font-l text-black">تعداد مسافران</p>
            <p
              className={`
                text-14 leading-24 font-r mt-4‍‍‍‍‍‍‍‍‍
                ${numberOfPeople === 0 ? "text-error-light" : "text-black"}
              `}
            >
              <span>
                {numberOfPeople > baseCapacityOfSelectedResOrRoom
                  ? baseCapacityOfSelectedResOrRoom
                  : numberOfPeople}{" "}
                نفر
              </span>
              {numberOfPeople > baseCapacityOfSelectedResOrRoom && (
                <span className="text-12">
                  + {numberOfPeople - baseCapacityOfSelectedResOrRoom} نفر اضافه
                </span>
              )}
            </p>
          </div>
        </div>

        {!!showNumberOfPeopleAlert && (
          <div className="absolute left-0 top-0 z-1 -translate-y-full">
            <YouHaveNotEnteredNOfPeopleYet />
          </div>
        )}

        <div className="w-[107px]">
          <Counter
            inputName={`number-of-people`}
            counterMinimum={0}
            counterMaximum={resMaxCapacity}
            customValue={numberOfPeople}
            onInc={() => {
              setNumberOfPeople((prev) => prev + 1);
              setShowNumberOfPeopleAlert(false);
            }}
            onDec={() => {
              setNumberOfPeople((prev) => prev - 1);
              setShowNumberOfPeopleAlert(false);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pb-16 mb-16 border-b-1 border-solid border-b-gray-CACFD3">
        <div className="flex items-center gap-x-12">
          <i className="icon-BirthCertificate text-24 text-black" />
          <div className="">
            <p className="text-12 leading-21 font-l text-black">اطلاعات مهمان</p>
            <p className="text-14 leading-24 font-r text-black mt-4">
              {guestName} {guestPhoneNumber}
            </p>
          </div>
        </div>

        <Button color="grey" onClick={() => onTapOfEditGuestInfo()}>
          ویرایش
        </Button>
      </div>

      {/* checkout */}
      <div>
        {!!selectedRanges &&
          selectedRanges.length === 1 &&
          !!selectedRanges[0][1] &&
          !!calendarData &&
          !!checkoutData &&
          !!checkoutTotal && (
            <Checkout
              data={[
                {
                  label: "روزهای وسط هفته : ",
                  valueOfKey: checkoutData?.weekDatesN || 0,
                  numberOfDiscountedDays: n_of_discounted_normaldays,
                  key: "شب",
                  per: (calendarData?.params as IServerCalendarData)?.prices.week_price || 0,
                  total:
                    (checkoutData?.weekDatesN || 0) *
                    ((calendarData?.params as IServerCalendarData)?.prices.week_price || 0),
                },
                {
                  label: "روزهای آخر هفته : ",
                  valueOfKey: checkoutData?.weekEndDatesN || 0,
                  numberOfDiscountedDays: n_of_discounted_weekends,
                  key: "شب",
                  per: (calendarData?.params as IServerCalendarData).prices.weekend_price || 0,
                  total:
                    (checkoutData?.weekEndDatesN || 0) *
                    ((calendarData?.params as IServerCalendarData).prices.weekend_price || 0),
                },
                {
                  label: "روزهای ایام پیک : ",
                  valueOfKey: checkoutData?.peakDatesN || 0,
                  numberOfDiscountedDays: n_of_discounted_peak_days,
                  key: "شب",
                  per: (calendarData?.params as IServerCalendarData).prices.peak_price || 0,
                  total:
                    (checkoutData?.peakDatesN || 0) *
                    ((calendarData?.params as IServerCalendarData).prices.peak_price || 0),
                },
                ...Object.entries(checkoutData?.specialDatesData || {}).map((specialDate) => {
                  return {
                    label: "روزهـــای خـاص : ",
                    valueOfKey: specialDate[1].repeated_frequency || 0,
                    numberOfDiscountedDays: specialDate[1].n_of_discounted_nights || 0,
                    key: "شب",
                    per: Number(specialDate[0]) || 0,
                    total: (Number(specialDate[0]) || 0) * (specialDate[1].repeated_frequency || 0),
                  };
                }),
                {
                  label: "نرخ نفر اضافه : ",
                  valueOfKey: checkoutData?.extraGuestsN || 0,
                  numberOfDiscountedDays: 0, // should be zero
                  key: "نفر",
                  per: checkoutData?.extraGuestsUnitPrice || 0,
                  total:
                    (checkoutData?.extraGuestsN || 0) * (checkoutData?.extraGuestsUnitPrice || 0),
                },
                // {
                //   label: "تخفیف میزبان : ",
                //   fullValue: !!hostDiscountData?.host_discount
                //     ? `${hostDiscountData?.host_discount} هزار تومان`
                //     : "",
                // },
                {
                  label: "تخفیف رزرو هفتگی : ",
                  fullValue: !!weeklyDiscountAmount
                    ? `${weeklyDiscountAmount?.toLocaleString()} تومان`
                    : "",
                },
                {
                  label: "تخفیف رزرو ماهانه : ",
                  fullValue: monthlyDiscountAmount
                    ? `${monthlyDiscountAmount?.toLocaleString()} تومان`
                    : "",
                },
                // {
                //   label: "تخفیف سایت : ",
                //   fullValue: !!websiteDiscountData?.website_discount
                //     ? `${websiteDiscountData?.website_discount} هزار تومان`
                //     : "",
                // },
                // {
                //   label: "کد تخفیف : ",
                //   fullValue: !!couponDiscountData?.coupon_discount
                //     ? `${couponDiscountData?.coupon_discount} هزار تومان`
                //     : "",
                // },
              ]}
              total={checkoutTotal}
              n_of_discounted_special_days={n_of_discounted_special_days}
              n_of_discounted_peak_days={n_of_discounted_peak_days}
              n_of_discounted_weekends={n_of_discounted_weekends}
              n_of_discounted_normaldays={n_of_discounted_normaldays}
              totalDiscountAmount={orderTotalDiscountAmount}
            />
          )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 right-0 left-0 pt-12 pb-16 px-20 bg-white md:rounded-br-20 md:rounded-bl-20">
        <div className="grid grid-cols-3 gap-x-12">
          <div className="col-span-1">
            <Button
              isFullWidth
              color="grey"
              // onClick={handleSmoothClose}
              onClick={() => {
                onClickOfReturnBtn();
              }}
            >
              برگشت
            </Button>
          </div>
          <div className="col-span-2">
            <Button
              isFullWidth
              type="submit"
              //   disabled={!profileImage}
              onClick={() => handleSubmit()}
            >
              {isEditReserve ? "ثبت ویرایش" : "درخواست رزرو"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmReserveDetailsBottomSheet;
