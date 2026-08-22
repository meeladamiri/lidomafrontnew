import { getNumberOfDaysFromD1ToD2BothInclusive } from "@/utilities/dateTools";
import {
  ICalculateCheckoutData,
  getManuallyCalculatedCheckoutData,
} from "@/utilities/getManuallyCalculatedCheckoutData";
import { Moment } from "moment-jalaali";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const DynamicPriceDetailsBottomSheet = dynamic(
  () => import("../General/PriceDetails/PriceDetailsBottomSheets/DynamicPriceDetailsBottomSheet"),
  {
    ssr: true,
  }
);
const BottomSheet = dynamic(() => import("../General/core/BottomSheet"), {
  ssr: true,
});

interface IFinalCheckoutTotal {
  calculatedCheckoutDataParams: ICalculateCheckoutData;
  basePrice: number;
}

function FinalCheckoutTotal({ calculatedCheckoutDataParams, basePrice }: IFinalCheckoutTotal) {
  const { finalCalculatedCheckoutTotal, checkoutPaperData } = getManuallyCalculatedCheckoutData(
    calculatedCheckoutDataParams
  );
  const [showPriceDetailsBottomSheet, setShowPriceDetailsBottomSheet] = useState(false);
  const numberOfNights =
    getNumberOfDaysFromD1ToD2BothInclusive(
      calculatedCheckoutDataParams.theRangeSelected[0],
      calculatedCheckoutDataParams.theRangeSelected[1] as Moment
    ) - 1;

  return (
    <>
      <div className="bg-gray-F4F5F6 rounded-8 py-4 px-8 flex items-center justify-between mt-8">
        <div className="flex items-center gap-x-4">
          <span className="text-11 text-black font-r">
            جمع مبلغ تا {calculatedCheckoutDataParams.numberOfPeople} نفر{" "}
            <span>{numberOfNights}</span> شب:
          </span>
          <span className="text-13 text-black font-m">
            {finalCalculatedCheckoutTotal?.toLocaleString("en-US")} تومان
          </span>
        </div>

        <i
          className="icon-Warning text-blue-main text-20"
          onClick={(e) => {
            // e.stopPropagation();
            // e.preventDefault();

            setShowPriceDetailsBottomSheet(true);
          }}
        />
      </div>

      {!!showPriceDetailsBottomSheet && (
        <BottomSheet
          open={showPriceDetailsBottomSheet}
          handleClose={() => setShowPriceDetailsBottomSheet(false)}
          headerTitle="جزئیات قیمت"
          body={({ handleSmoothClose }) => {
            return (
              <DynamicPriceDetailsBottomSheet
                handleSmoothClose={handleSmoothClose}
                dynamicKeyValuePairs={[
                  // { k: `${numberOfNights} شب قیمت پایه :`, v: basePrice * numberOfNights },
                  {
                    k: `${checkoutPaperData.weekDatesN} شب وسط هفته :`,
                    v: checkoutPaperData.weekDatesUnitPrice * checkoutPaperData.weekDatesN,
                  },
                  {
                    k: `${checkoutPaperData.weekEndDatesN} شب اخر هفته :`,
                    v: checkoutPaperData.weekEndDatesUnitPrice * checkoutPaperData.weekEndDatesN,
                  },
                  {
                    k: `${checkoutPaperData.peakDatesN} شب ایام پیک: `,
                    v: checkoutPaperData.peakDatesUnitPrice * checkoutPaperData.peakDatesN,
                  },
                  {
                    k: `قیمت نفر اضافه ${numberOfNights} شب :`,
                    v: checkoutPaperData.extraGuestsUnitPrice * checkoutPaperData.extraGuestsN,
                  },
                ]}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default FinalCheckoutTotal;
