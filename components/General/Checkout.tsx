import PageTitle from "components/General/PageTitle";
// import NewTooltip from "./NewTooltip";

interface ICheckoutBase {
  label: string;
}

export interface WithFullname extends ICheckoutBase {
  fullValue: string;
}
export interface WithKeyValue extends ICheckoutBase {
  key: string;
  valueOfKey: number;
  per: number;
  total: number;
  numberOfDiscountedDays: number;
}

function Checkout({
  showTotal = true,
  total,
  data,
  //
  // special_days_total_discounted,
  // peak_days_total_discounted,
  // weekends_total_discounted,
  // normaldays_total_discounted,
  //
  n_of_discounted_special_days,
  n_of_discounted_peak_days,
  n_of_discounted_weekends,
  n_of_discounted_normaldays,
  totalDiscountAmount,
  hostShare,
  websiteShare,
  // vatAmount,
}: {
  showTotal?: boolean;
  total: number;
  data: (WithFullname | WithKeyValue)[];
  //
  // special_days_total_discounted: number;
  // peak_days_total_discounted: number;
  // weekends_total_discounted: number;
  // normaldays_total_discounted: number;
  //
  n_of_discounted_special_days: number;
  n_of_discounted_peak_days: number;
  n_of_discounted_weekends: number;
  n_of_discounted_normaldays: number;
  //
  totalDiscountAmount: number; // sum of any possible discounts
  hostShare?: number;
  websiteShare?: number;
  // vatAmount?: number;
}) {
  const n_of_all_discounted_days =
    n_of_discounted_special_days +
    n_of_discounted_peak_days +
    n_of_discounted_weekends +
    n_of_discounted_normaldays;

  return (
    <>
      <PageTitle
        icon={<i className="icon-Details text-24" />}
        title="جزئیات صورتحساب"
        containerClassname="mb-24"
      />

      <div>
        <div className="">
          {data.map((item, i: number) => {
            // According to figma, Do not render the item if it is 0; (So the calculation will result in 0)
            if (
              ("valueOfKey" in item && !item.valueOfKey) ||
              ("fullValue" in item && !item.fullValue)
            ) {
              return null;
            }

            return (
              <div key={i} className="flex items-center justify-between mb-12 last:mb-0">
                <p className="text-10 leading-17 font-l text-zilgara flex items-center gap-x-2">
                  <span>{item.label}</span>
                  {"numberOfDiscountedDays" in item && !!item?.numberOfDiscountedDays && (
                    <span className="text-10 leading-21 text-error-light">
                      ({item?.numberOfDiscountedDays} شب با تخفیف)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-x-2 text-10 leading-17 font-l text-zilgara">
                  {"fullValue" in item ? ( // "fullValue" diffrantiates "WithFullname" and "WithKeyValue" interfaces.
                    <span>{item.fullValue}</span>
                  ) : (
                    <>
                      <span>
                        {item.valueOfKey} {item.key}
                      </span>
                      <i className="icon-Close text-12 text-black" />
                      <span>{item.per.toLocaleString("en-US")} تومان</span>
                      <span>=</span>
                      <span>{item.total.toLocaleString("en-US")} تومان</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!!showTotal && (
          <div className="flex items-start justify-between border-b-1 border-t-1 py-16 my-16">
            <p className="text-15 leading-20 text-black">
              مجموع صورتحساب :{" "}
              {!!n_of_all_discounted_days ? (
                <span className="text-10 leading-21 text-error-light">
                  ({n_of_all_discounted_days} شب با تخفیف)
                </span>
              ) : null}
            </p>
            <div className="flex flex-col">
              {!!totalDiscountAmount && (
                <p className="text-12 leading-21 font-l text-gray-600 line-through text-left">
                  {(total + totalDiscountAmount)?.toLocaleString("en-US")} تومان
                </p>
              )}

              <span className="text-13 leading-16 font-r text-black flex items-center gap-x-4">
                <p className="text-16 leading-22 font-m text-black">{total.toLocaleString("en-US")}</p>
                تومان
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-y-14">
          {!!websiteShare && (
            <div className="flex justify-between items-center">
              <span className="text-12 text-black leading-14 font-r">کارمزد سایت</span>
              <span className="text-11 leading-14 font-r text-black flex items-center gap-x-4">
                <span className="13 leading-16 text-black font-r">
                  {websiteShare.toLocaleString("en-US")}
                </span>
                تومان
                <i className="icon-Negative text-red-main text-14"></i>
              </span>
            </div>
          )}
          {/* {!!vatAmount && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-x-4">
                <span className="text-12 text-black leading-14 font-r">ارزش افزوده</span>
                <NewTooltip
                  tooltipText="ارزش افزوده محسابه شده معادل 9 درصد مبلغ کارمزد دریافتی سایت از میزبان می باشد. تمامی این
                  مبلغ به حساب اداره مالیات واریز خواهد شد."
                >
                  <i
                    className="icon-WarningFill text-blue-main cursor-pointer"
                    // onClick={(e) => handleDisplayTooltip(e)}
                  ></i>
                </NewTooltip>
              </div>
              <span className="text-11 leading-14 font-r text-black flex items-center gap-x-4">
                <span className="13 leading-16 text-black font-r">
                  {vatAmount.toLocaleString("en-US")}
                </span>
                تومان
                <i className="icon-Negative text-red-main text-14"></i>
              </span>
            </div>
          )} */}
        </div>
        {!!hostShare && (
          <div className="bg-gray-C4CAD3 rounded-8 flex justify-between items-center px-14 py-7 mt-16">
            <span className="text-15 font-r leading-20 text-black">مبلغ قابل پرداخت به میزبان</span>
            <span className="text-13 leading-16 font-r text-black flex items-center gap-x-4">
              <p className="text-16 leading-22 font-m text-black">{hostShare.toLocaleString("en-US")}</p>
              تومان
            </span>
          </div>
        )}
      </div>
      {/* {tooltipPosition.x !== 0 && tooltipPosition.y !== 0 && (
        <Tooltip
          textClassname="!text-white"
          wrapperClassname="!bg-black opacity-90 w-[260px] !rounded-[14px] py-6 px-14"
          text="ارزش افزوده محاسبه شده معادل 9درصد مبلغ کارمزد دریافتی سایت از میزبان می باشد. تمامی این مبلغ به حساب اداره مالیات واریز خواهد شد."
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          time={6000}
        />
      )} */}
    </>
  );
}
///  return "valueOfKey" in a ? a.valueOfKey || 0 : a?.fullValue || 0;
export default Checkout;
