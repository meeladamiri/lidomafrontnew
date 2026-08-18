import { Switch } from "@/components/General/core/Switch";
import { Dispatch, SetStateAction } from "react";

// I wish i could name this function 'FastAndFurious'; XD
function FastAndNationalCard({
  tmpFast,
  setTmpFast,
}: {
  tmpFast: boolean | undefined;
  setTmpFast: Dispatch<SetStateAction<boolean | undefined>>;
}) {
  return (
    <>
      <div className="mb-24">
        <Switch
          name={"fast-switch"}
          label={
            <div className="flex items-center gap-x-8">
              <i className="icon-FlashFill text-24 text-black" />
              <p className="text-14 leading-24 text-black font-r">اقامتگاه های رزرو آنی و قطعی</p>
            </div>
          }
          checked={!!tmpFast}
          onChange={(e) => {
            if (!!e.target.checked) {
              setTmpFast(true);
            } else {
              setTmpFast(false);
            }
          }}
          wrapperClassnames="justify-between"
        />
        <p className="text-12 leading-21 text-gray-616E7C font-l">
          سریع و بدون نیاز به تأیید میزبان این اقامتگاه ها را رزرو کنید.
        </p>
      </div>
    </>
  );
}

export default FastAndNationalCard;
