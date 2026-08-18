import { Radio } from "components/General/core/Radio";
import Image from "next/image";

interface ICancelRuleItem {
  mainTitle: string;
  //
  // fullReturnTime: number | null;
  // beforeStartTime: number | null;
  // hostShareTotalAmount: number | null;
  // hostSharePastNights: number | null;
  // hostShareFutureNights: number | null;
  firstTitle: string;
  firstDesc: string;
  secondTitle: string;
  secondDesc: string;
  thirdTitle: string;
  thirdDesc: string;
  //
  reserveCommission: number;
  cancelCommission: number;
  isSelected: boolean;
  onSelect: () => void;
}

function CancelRuleItem({
  mainTitle,
  // fullReturnTime,
  // beforeStartTime,
  // hostShareTotalAmount,
  // hostSharePastNights,
  // hostShareFutureNights,
  firstTitle,
  firstDesc,
  secondTitle,
  secondDesc,
  thirdTitle,
  thirdDesc,
  //
  reserveCommission,
  cancelCommission,
  isSelected,
  onSelect,
}: ICancelRuleItem) {
  return (
    <div className="border-1 border-solid border-gray-C4CAD3 rounded-12 p-12">
      <div className="mb-32">
        <Radio
          name={mainTitle}
          checked={isSelected}
          label={mainTitle}
          value={mainTitle}
          onChange={() => {
            onSelect();
          }}
          // formik={formik}
          wrapperClassnames=""
          look="selected"
        />
      </div>

      <div className="pb-24 border-b-1 border-dashed border-gray-C4CAD3 mb-12">
        <div className="flex items-center">
          {/* border */}
          <div className="mr-8 ml-12 w-14 h-[226px] relative">
            <Image
              src={"/assets/cancel-reserve-rule-border-2.svg"}
              alt={""}
              fill
              sizes="100vw"
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <div>
            {/* item 1 */}
            <div className="mb-24">
              <p className="text-14 leading-24 text-black font-r mb-8">{firstTitle}</p>
              <p className="text-12 leading-21 text-black font-l">{firstDesc}</p>
            </div>

            {/* item 2 */}
            <div className="mb-24">
              <p className="text-14 leading-24 text-black font-r mb-8">{secondTitle}</p>
              <p className="text-12 leading-21 text-black font-l">{secondDesc}</p>
            </div>

            {/* item 3 */}
            <div className="">
              <p className="text-14 leading-24 text-black font-r mb-8">{thirdTitle}</p>
              <p className="text-12 leading-21 text-black font-l">{thirdDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-16 bg-gray-F5F9FF rounded-50 text-12 leading-21 text-black font-r text-center">
        کمیسیون لیدوماتریپ: {reserveCommission}% بابت رزرو + {cancelCommission}% بابت لغو
      </div>
    </div>
  );
}

export default CancelRuleItem;
