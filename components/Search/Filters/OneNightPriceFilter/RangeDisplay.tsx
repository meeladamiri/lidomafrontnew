import RangeDisplayItem from "./RangeDisplayItem";

function RangeDisplay({ minValue, maxValue }: { minValue: number; maxValue: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-12">
      <div className="col-span-1">
        <RangeDisplayItem k="از" v={`${minValue?.toLocaleString("en-US")} تومان`} />
      </div>

      <div className="col-span-1">
        <RangeDisplayItem k="تا" v={`${maxValue?.toLocaleString("en-US")} تومان`} />
      </div>
    </div>
  );
}
export default RangeDisplay;
