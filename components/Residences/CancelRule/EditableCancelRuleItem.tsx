import { TextField } from "@/components/General/core/TextField";
import { Radio } from "components/General/core/Radio";
import Image from "next/image";

interface IEditableCancelRuleItem {
  mainTitle: string;
  //
  fullReturnTime: number | null;
  beforeStartTime: number | null;
  hostShareTotalAmount: number | null;
  hostSharePastNights: number | null;
  hostShareFutureNights: number | null;
  //
  reserveCommission: number;
  cancelCommission: number;
  isSelected: boolean;
  onSelect: () => void;
  formik: any;
}

function EditableCancelRuleItem({
  mainTitle,
  fullReturnTime,
  beforeStartTime,
  hostShareTotalAmount,
  hostSharePastNights,
  hostShareFutureNights,
  reserveCommission,
  cancelCommission,
  isSelected,
  onSelect,
  formik,
}: IEditableCancelRuleItem) {
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
              <div className="text-14 leading-24 text-black font-r mb-8 flex items-center gap-x-8 flex-wrap gap-y-10">
                <p>تا</p>
                <div className="w-50 flex items-center justify-center h-24">
                  {isSelected ? (
                    <TextField
                      name={"full-return-time"}
                      formik={formik}
                      wrapperClassname="!py-4 !rounded-4 border-gray-D2D2D7"
                      inputClassname="!leading-16 !text-center"
                      inputmode="numeric"
                      noValidationErrorText
                    />
                  ) : (
                    <p>...........</p>
                  )}
                </div>
                <p>ساعت قبل از ورود مهمان</p>
              </div>
              <p className="text-12 leading-21 text-black font-l">پرداخت کامل وجه به مهمان</p>
            </div>

            {/* item 2 */}
            <div className="mb-24">
              <div className="text-14 leading-24 text-black font-r mb-8 flex items-center gap-x-8 flex-wrap gap-y-10">
                <p>تا</p>
                <div className="w-50 flex items-center justify-center h-24">
                  {isSelected ? (
                    <TextField
                      name={"before-start-time"}
                      formik={formik}
                      wrapperClassname="!py-4 !rounded-4 border-gray-D2D2D7"
                      inputClassname="!leading-16 !text-center"
                      inputmode="numeric"
                      noValidationErrorText
                    />
                  ) : (
                    <p>...........</p>
                  )}
                </div>
                <p>ساعت قبل از ورود مهمان</p>
              </div>
              <div className="text-12 leading-21 text-black font-l flex items-center gap-x-8 flex-wrap gap-y-10">
                <p>سهم میزبان :</p>
                <div className="w-50 flex items-center justify-center h-24">
                  {isSelected ? (
                    <TextField
                      name={"host-share-total-amount"}
                      formik={formik}
                      wrapperClassname="!py-4 !rounded-4 border-gray-D2D2D7 !px-4 !gap-x-4"
                      inputClassname="!leading-16 !text-center"
                      inputmode="numeric"
                      leftIcon={<span className="text-12 leading-21 text-black font-l">%</span>}
                      noValidationErrorText
                    />
                  ) : (
                    <p>...........</p>
                  )}
                </div>
                <p>مبلغ کل رزرو</p>
              </div>
            </div>

            {/* item 3 */}
            <div className="">
              <p className="text-14 leading-24 text-black font-r mb-8">از روز ورود تا خروج مهمان</p>
              <div className="text-12 leading-21 text-black font-l flex items-center gap-x-8 flex-wrap gap-y-10">
                <p>سهم میزبان :</p>
                <div className="w-50 flex items-center justify-center h-24">
                  {isSelected ? (
                    <TextField
                      name={"host-share-past-nights"}
                      formik={formik}
                      wrapperClassname="!py-4 !rounded-4 border-gray-D2D2D7 !px-4 !gap-x-4"
                      inputClassname="!leading-16 !text-center"
                      inputmode="numeric"
                      leftIcon={<span className="text-12 leading-21 text-black font-l">%</span>}
                      noValidationErrorText
                    />
                  ) : (
                    <p>...........</p>
                  )}
                </div>
                {/* سهم میزبان : 100% مبلغ شب های سپری شده + %10 مبلغ شب های باقیمانده */}
                <p>مبلغ شب های سپری شده +</p>
                <div className="w-50 flex items-center justify-center h-24">
                  {isSelected ? (
                    <TextField
                      name={"host-share-future-nights"}
                      formik={formik}
                      wrapperClassname="!py-4 !rounded-4 border-gray-D2D2D7 !px-4 !gap-x-4"
                      inputClassname="!leading-16 !text-center"
                      inputmode="numeric"
                      leftIcon={<span className="text-12 leading-21 text-black font-l">%</span>}
                      noValidationErrorText
                    />
                  ) : (
                    <p>...........</p>
                  )}
                </div>
                <p>مبلغ شب های باقیمانده</p>
              </div>
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

export default EditableCancelRuleItem;
