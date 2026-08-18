import Image from "next/image";

interface IReadonlyCancelRuleItem {
  mainTitle?: string;
  //
  fullReturnTime: number | null;
  beforeStartTime: number | null;
  hostShareTotalAmount: number | null;
  hostSharePastNights: number | null;
  hostShareFutureNights: number | null;
  //
  reserveCommission?: number;
  cancelCommission?: number;
  showAroundBorder?: boolean;
  showLidomaCommissions?: boolean;
}

function ReadonlyCancelRuleItem({
  mainTitle,
  fullReturnTime,
  beforeStartTime,
  hostShareTotalAmount,
  hostSharePastNights,
  hostShareFutureNights,
  reserveCommission,
  cancelCommission,
  showAroundBorder = false,
  showLidomaCommissions = false,
}: IReadonlyCancelRuleItem) {
  return (
    <div
      className={`
        ${!!showAroundBorder ? "border-1 border-solid border-gray-C4CAD3 rounded-12 p-12" : ""}
    `}
    >
      {!!mainTitle && <div className="mb-24">{mainTitle}</div>}

      <div>
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
              <p className="text-14 leading-24 text-black font-r mb-8">
                {/* تا {fullReturnTime} ساعت قبل از ورود مهمان */}
                تا 72 ساعت قبل از ورود مهمان
              </p>
              <p className="text-12 leading-21 text-black font-l">
                {/* پرداخت کامل وجه به مهمان */}
                با کسر ٪۲۰ از مبلغ کل رزرو، مابقی مبلغ پرداخت شده عودت داده می شود
              </p>
            </div>

            {/* item 2 */}
            <div className="mb-24">
              <p className="text-14 leading-24 text-black font-r mb-8">
                {/* تا {beforeStartTime} ساعت قبل از ورود مهمان */}
                تا روز شروع اقامت مهمان
              </p>
              <p className="text-12 leading-21 text-black font-l">
                {/* سهم میزبان : {hostShareTotalAmount}% مبلغ کل رزرو */}
                کل مبلغ ۲ شب اول و 10 درصد از مابقی شب ها از مبلغ پرداختی کسر و مابقی عودت داده می
                شود.
              </p>
            </div>

            {/* item 3 */}
            <div className="">
              <p className="text-14 leading-24 text-black font-r mb-8">از روز ورود تا خروج مهمان</p>
              <p className="text-12 leading-21 text-black font-l">
                {/* سهم میزبان : {hostSharePastNights}% مبلغ شب های سپری شده + %{hostShareFutureNights}{" "}
                مبلغ شب های باقیمانده */}
                مبلغ شب های سپری شده و ۲ شب اول از شب های باقی مانده و 20 درصد از مابقی شب ها از
                مبلغ پرداختی کسر و مابقی عودت داده می شود
              </p>
            </div>
          </div>
        </div>
      </div>

      {!!showLidomaCommissions && (
        <div className="mt-24 pt-12 border-t-1 border-dashed border-gray-C4CAD3">
          <div className="py-8 px-16 bg-gray-F5F9FF rounded-50 text-12 leading-21 text-black font-r text-center">
            کمیسیون لیدوماتریپ: {reserveCommission}% بابت رزرو + {cancelCommission}% بابت لغو
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadonlyCancelRuleItem;
