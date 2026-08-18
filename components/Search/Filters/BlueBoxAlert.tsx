import React, { Dispatch, SetStateAction } from "react";

function BlueBoxAlert({
  setBlueBoxHasBeenShown,
}: {
  setBlueBoxHasBeenShown: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="px-20 md:px-0 absolute top-[calc(100%)] sm:w-[380px] md:w-[380px] w-full right-0 md:right-[unset]">
      <div className="px-12 py-8 bg-blue-main flex items-center justify-between gap-24 rounded-10 shadow-[0_4px_16px_0px_rgba(0,122,255,0.24)]">
        <span className="text-13 text-white font-r leading-22">
          جهت مشاهده دقیق قیمت ها و اقامتگاه های دارای ظرفیت، تاریخ سفر را انتخاب کنید
        </span>
        <i
          onClick={() => setBlueBoxHasBeenShown(true)}
          className="icon-Close text-24 text-white cursor-pointer"
        ></i>
      </div>
    </div>
  );
}

export default BlueBoxAlert;
