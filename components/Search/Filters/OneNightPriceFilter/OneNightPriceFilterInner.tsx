import RangeDisplay from "./RangeDisplay";
import RangeSlider from "./RangeSlider";
import { Dispatch, SetStateAction } from "react";

function OneNightPriceFilterInner({
  selectedMinValue,
  selectedMaxValue,
  setSelectedRangeValue,
}: {
  selectedMinValue: number | undefined;
  selectedMaxValue: number | undefined;
  setSelectedRangeValue: Dispatch<SetStateAction<[number, number] | undefined>>;
}) {
  return (
    <>
      <div className="mb-20">
        <RangeDisplay
          minValue={selectedMinValue || 100000}
          maxValue={selectedMaxValue || 18000000}
        />
      </div>

      <RangeSlider
        rangeMinimum={100000}
        rangeMaximum={18000000}
        selectedMinValue={selectedMinValue}
        selectedMaxValue={selectedMaxValue}
        rangeStep={100}
        onRangeChange={(min, max) => {
          setSelectedRangeValue([min, max]);
        }}
      />
    </>
  );
}
export default OneNightPriceFilterInner;
