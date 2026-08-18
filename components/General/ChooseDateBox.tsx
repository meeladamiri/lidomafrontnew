import React, { Dispatch, SetStateAction } from "react";
import { Button } from "./core/Button";
import { momentToJalali } from "@/utilities/dateTools";

function ChooseDateBox({
  selectedRanges,
  setShowCalendarModal,
  placeholder,
}: {
  selectedRanges: [
    moment.Moment, // start day of range
    moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
  ][];
  setShowCalendarModal: Dispatch<SetStateAction<boolean>>;
  placeholder: string;
}) {
  return (
    <div className="rounded-16 p-12 border border-gray-E9E9EC flex items-center justify-between mb-24">
      <div className="flex items-center gap-x-13">
        <i className="icon-Calendar text-24"></i>
        <div className="flex-col justify-center items-center">
          <p className="text-12 leading-14 font-r text-gray-6C6A7D">{placeholder}</p>
          {!!selectedRanges && (
            <div className="flex items-center gap-x-2 pt-12">
              {selectedRanges.map((range) => (
                <React.Fragment key={range.toString()}>
                  {range[0] && <span>{momentToJalali(range[0])}</span>}
                  <i className="icon-CalendarFlash" />
                  {range[1] && <span>{momentToJalali(range[1])}</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={() => setShowCalendarModal(true)}
        rounded
        leftIcon={<i className="icon-FlashLeft"></i>}
        color="grey"
      >
        {selectedRanges.length ? "تغییر تاریخ" : "انتخاب تاریخ"}
      </Button>
    </div>
  );
}

export default ChooseDateBox;
