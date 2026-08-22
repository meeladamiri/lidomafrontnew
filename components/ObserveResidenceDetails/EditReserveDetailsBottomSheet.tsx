import { IServerCalendarData } from "@/api/Calendar/Calendar";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Checkout, { WithFullname, WithKeyValue } from "../General/Checkout";
import { Button } from "../General/core/Button";
import Counter from "../General/Counter";
import { getManuallyCalculatedCheckoutData } from "@/utilities/getManuallyCalculatedCheckoutData";
import moment from "moment-jalaali";
import YouHaveNotEnteredNOfPeopleYet from "../General/YouHaveNotEnteredNOfPeopleYet";
import { IDiscountedDaysStatistics } from "@/interfaces/PropertyPages/Boomgardi/IDiscountedDaysStatistics";
import { IDiscountAmounts } from "@/interfaces/PropertyPages/Boomgardi/IDiscountAmounts";

const discountedDaysStatistics_InitV = {
  n_of_discounted_special_days: 0,
  n_of_discounted_peak_days: 0,
  n_of_discounted_weekends: 0,
  n_of_discounted_normaldays: 0,
};
const discountAmounts_InitV = {
  special_days_total_discount_amount: 0,
  peak_days_total_discount_amount: 0,
  weekends_total_discount_amount: 0,
  normaldays_total_discount_amount: 0,
};

function EditReserveDetailsBottomSheet({
  handleSmoothClose,
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
  calendarData,
  onReadyToSubmitReserve,
  onClickOfReturnBtn,
  single_extra_guest_price,
  baseCapacityOfSelectedResOrRoom,
  initialNumberOfPeople,
  initialEntranceDate,
  initialExitDate,
}: {
  handleSmoothClose: THandleSmoothClose;
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
  checkoutData?: (WithFullname | WithKeyValue)[];
  checkoutTotal: number;
  calendarData?: { params?: IServerCalendarData };
  //
  onReadyToSubmitReserve: () => void;
  onClickOfReturnBtn: () => void;
  single_extra_guest_price: number;
  baseCapacityOfSelectedResOrRoom: number;
  initialNumberOfPeople: number;
  initialEntranceDate: moment.Moment;
  initialExitDate: moment.Moment;
}) {
  const [showNumberOfPeopleAlert, setShowNumberOfPeopleAlert] = useState(false);
  const [discountedDaysStatistics, setDiscountedDaysStatistics] =
    useState<IDiscountedDaysStatistics>(discountedDaysStatistics_InitV);
  const [discountAmounts, setDiscountAmounts] = useState<IDiscountAmounts>(discountAmounts_InitV);

  const [manuallyCalculatedCheckoutData, setManuallyCalculatedCheckoutData] = useState<{
    specialDatesData: {
      [key: string]: {
        repeated_frequency: number;
        n_of_discounted_nights: number;
      };
    };
    peakDatesN: number;
    peakDatesUnitPrice: number;
    weekEndDatesN: number;
    weekEndDatesUnitPrice: number;
    weekDatesN: number;
    weekDatesUnitPrice: number;
    extraGuestsN: number;
    extraGuestsUnitPrice: number;
  }>();
  const [manuallyCalculatedCheckoutCheckoutTotal, setManuallyCalculatedCheckoutCheckoutTotal] =
    useState<number>(0);
  const [manuallyCalculatedWeeklyDiscountAmount, setManuallyCalculatedWeeklyDiscountAmount] =
    useState<number>(0);
  const [manuallyCalculatedMonthlyDiscountAmount, setManuallyCalculatedMonthlyDiscountAmount] =
    useState<number>(0);

  function handleSubmit() {
    if (numberOfPeople === 0) {
      setShowNumberOfPeopleAlert(true);
    } else {
      onReadyToSubmitReserve();
    }
  }

  useEffect(() => {
    if (
      selectedRanges?.length === 1 &&
      !!selectedRanges?.[0]?.[1] &&
      !!calendarData &&
      !!calendarData?.params
      // numberOfPeople !== 0 &&
      //   !!observeResidenceData
    ) {
      const serverCalendarData = calendarData?.params;

      const {
        checkoutPaperData,
        finalCalculatedCheckoutTotal,
        monthlyDiscountAmount,
        weeklyDiscountAmount,
        n_of_discounted_normaldays,
        n_of_discounted_peak_days,
        n_of_discounted_special_days,
        n_of_discounted_weekends,
        normaldays_total_discount_amount,
        peak_days_total_discount_amount,
        special_days_total_discount_amount,
        weekends_total_discount_amount,
      } = getManuallyCalculatedCheckoutData({
        serverCalendarData: serverCalendarData, //
        theRangeSelected: selectedRanges[0],
        numberOfPeople,
        baseCapacity: baseCapacityOfSelectedResOrRoom || 0, //
        extraGuestUnitPrice: single_extra_guest_price || 0, //
        discountedDays: serverCalendarData.discounted_days.map((discounted_day) => ({
          date: moment(discounted_day.date, "YYYY-MM-DD"),
          amount: discounted_day.amount,
        })),
      });

      setManuallyCalculatedCheckoutData(checkoutPaperData);
      setManuallyCalculatedWeeklyDiscountAmount(weeklyDiscountAmount);
      setManuallyCalculatedMonthlyDiscountAmount(monthlyDiscountAmount);
      setManuallyCalculatedCheckoutCheckoutTotal(finalCalculatedCheckoutTotal);

      setDiscountAmounts({
        special_days_total_discount_amount,
        peak_days_total_discount_amount,
        weekends_total_discount_amount,
        normaldays_total_discount_amount,
      });
      setDiscountedDaysStatistics({
        n_of_discounted_special_days,
        n_of_discounted_peak_days,
        n_of_discounted_weekends,
        n_of_discounted_normaldays,
      });
    }
  }, [
    selectedRanges,
    calendarData,
    numberOfPeople,
    baseCapacityOfSelectedResOrRoom,
    single_extra_guest_price,
  ]);

  const user_has_edited_the_reserve =
    !selectedRanges?.[0]?.[0]?.isSame(initialEntranceDate) ||
    !selectedRanges?.[0]?.[1]?.isSame(initialExitDate) ||
    numberOfPeople !== initialNumberOfPeople;

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
            if (openingThisBottomSheetFromObservePage) {
              handleSmoothClose();
            } else {
              handleSmoothClose();

              setTimeout(() => {
                setShowChooseEnterAndExitDaysCalendarModal(true);
              }, 200); // bcz this bottom sheet is gonna close after 200ms;
            }
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
          //   !!calendarData &&
          !!checkoutData &&
          !!checkoutTotal &&
          !!numberOfPeople && (
            <Checkout
              data={
                user_has_edited_the_reserve
                  ? // user has edited reserve info (either numberOfPeople or the selectedRange)
                    [
                      {
                        label: "روزهای وسط هفته : ",
                        numberOfDiscountedDays: 0,
                        valueOfKey: manuallyCalculatedCheckoutData?.weekDatesN || 0,
                        key: "شب",
                        per: manuallyCalculatedCheckoutData?.weekDatesUnitPrice || 0,
                        total:
                          (manuallyCalculatedCheckoutData?.weekDatesN || 0) *
                          (manuallyCalculatedCheckoutData?.weekDatesUnitPrice || 0),
                      },
                      {
                        label: "روزهای آخر هفته : ",
                        numberOfDiscountedDays: 0,
                        valueOfKey: manuallyCalculatedCheckoutData?.weekEndDatesN || 0,
                        key: "شب",
                        per: manuallyCalculatedCheckoutData?.weekEndDatesUnitPrice || 0,
                        total:
                          (manuallyCalculatedCheckoutData?.weekEndDatesN || 0) *
                          (manuallyCalculatedCheckoutData?.weekEndDatesUnitPrice || 0),
                      },
                      {
                        label: "روزهای ایام پیک : ",
                        numberOfDiscountedDays: 0,
                        valueOfKey: manuallyCalculatedCheckoutData?.peakDatesN || 0,
                        key: "شب",
                        per: manuallyCalculatedCheckoutData?.peakDatesUnitPrice || 0,
                        total:
                          (manuallyCalculatedCheckoutData?.peakDatesN || 0) *
                          (manuallyCalculatedCheckoutData?.peakDatesUnitPrice || 0),
                      },
                      ...Object.entries(manuallyCalculatedCheckoutData?.specialDatesData || {}).map(
                        (specialDate) => {
                          return {
                            label: "روزهـــای خـاص : ",
                            valueOfKey: specialDate[1].repeated_frequency || 0,
                            numberOfDiscountedDays: specialDate[1].n_of_discounted_nights || 0,
                            key: "شب",
                            per: Number(specialDate[0]) || 0,
                            total:
                              (Number(specialDate[0]) || 0) *
                              (specialDate[1].repeated_frequency || 0),
                          };
                        }
                      ),
                      {
                        label: "نرخ نفر اضافه : ",
                        numberOfDiscountedDays: 0,
                        valueOfKey: manuallyCalculatedCheckoutData?.extraGuestsN || 0,
                        key: "نفر",
                        per: manuallyCalculatedCheckoutData?.extraGuestsUnitPrice || 0,
                        total:
                          (manuallyCalculatedCheckoutData?.extraGuestsN || 0) *
                          (manuallyCalculatedCheckoutData?.extraGuestsUnitPrice || 0),
                      },
                      // {
                      //   label: "تخفیف میزبان : ",
                      //   fullValue: !!hostDiscountData?.host_discount
                      //     ? `${hostDiscountData?.host_discount} هزار تومان`
                      //     : "",
                      // },
                      {
                        label: "تخفیف رزرو هفتگی : ",
                        fullValue: !!manuallyCalculatedWeeklyDiscountAmount
                          ? `${manuallyCalculatedWeeklyDiscountAmount?.toLocaleString("en-US")} تومان`
                          : "",
                      },
                      {
                        label: "تخفیف رزرو ماهانه : ",
                        fullValue: manuallyCalculatedMonthlyDiscountAmount
                          ? `${manuallyCalculatedMonthlyDiscountAmount?.toLocaleString("en-US")} تومان`
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
                    ]
                  : checkoutData
              }
              total={
                user_has_edited_the_reserve
                  ? manuallyCalculatedCheckoutCheckoutTotal
                  : checkoutTotal
              }
              n_of_discounted_special_days={
                user_has_edited_the_reserve
                  ? discountedDaysStatistics.n_of_discounted_special_days
                  : 0
              }
              n_of_discounted_peak_days={
                user_has_edited_the_reserve ? discountedDaysStatistics.n_of_discounted_peak_days : 0
              }
              n_of_discounted_weekends={
                user_has_edited_the_reserve ? discountedDaysStatistics.n_of_discounted_weekends : 0
              }
              n_of_discounted_normaldays={
                user_has_edited_the_reserve
                  ? discountedDaysStatistics.n_of_discounted_normaldays
                  : 0
              }
              //
              totalDiscountAmount={
                user_has_edited_the_reserve
                  ? discountAmounts.special_days_total_discount_amount +
                    discountAmounts.peak_days_total_discount_amount +
                    discountAmounts.weekends_total_discount_amount +
                    discountAmounts.normaldays_total_discount_amount +
                    manuallyCalculatedMonthlyDiscountAmount +
                    manuallyCalculatedWeeklyDiscountAmount
                  : 0
              }
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
              ثبت ویرایش
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditReserveDetailsBottomSheet;
