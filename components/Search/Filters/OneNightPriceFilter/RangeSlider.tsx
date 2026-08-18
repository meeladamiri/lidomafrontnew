import classes from "styles/range-slider.module.css";
import { useEffect, useRef, useState } from "react";

function RangeSlider({
  rangeMinimum = 100000,
  rangeMaximum = 18000000,
  selectedMinValue,
  selectedMaxValue,
  rangeStep = 100,
  onRangeChange,
}: {
  rangeMinimum: number;
  rangeMaximum: number;
  selectedMinValue: number | undefined;
  selectedMaxValue: number | undefined;
  rangeStep: number;
  onRangeChange: (min: number, max: number) => void;
}) {
  const [minVal, setMinVal] = useState(selectedMinValue || rangeMinimum);
  const [maxVal, setMaxVal] = useState(selectedMaxValue || rangeMaximum);
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!!selectedMinValue) {
      setMinVal(selectedMinValue);
    }
  }, [selectedMinValue]);

  useEffect(() => {
    if (!!selectedMaxValue) {
      setMaxVal(selectedMaxValue);
    }
  }, [selectedMaxValue]);

  // Convert to percentage
  const getPercent = (value: number) =>
    Math.round(((value - rangeMinimum) / (rangeMaximum - rangeMinimum)) * 100);

  // Set width of the range to decrease from the rigth side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.right = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minVal]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxVal]);

  useEffect(() => {
    if (!!onRangeChange) {
      onRangeChange(minVal, maxVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minVal, maxVal]);

  return (
    <div className="w-full relative flex justify-center items-center bg-gray-FAFAFF h-48 rounded-10">
      <input
        type="range"
        min={rangeMinimum}
        max={rangeMaximum}
        step={rangeStep}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - rangeStep);
          setMinVal(value);
          event.target.value = value.toString();
        }}
        // ${minVal > (max - minVal) / rangeStep ? "z-5" : "z-3"} `
        className={`${classes.thumb} ${"w-[90%]"}  ${
          minVal == rangeMaximum - rangeStep ? "z-5" : "z-3"
        } `}
      />

      <input
        type="range"
        min={rangeMinimum}
        max={rangeMaximum}
        step={rangeStep}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + rangeStep);
          setMaxVal(value);
          event.target.value = value.toString();
        }}
        className={`${classes.thumb} ${"w-[90%]"} z-4`}
      />

      <div className={`relative w-[90%]`}>
        <div className="absolute rounded-5 h-[5px] bg-[#ced4da] w-full z-1"></div>
        <div ref={range} className="absolute rounded-5 h-[5px] bg-black z-2"></div>
      </div>
    </div>
  );
}

export default RangeSlider;
