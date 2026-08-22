import { THandleSmoothClose } from "components/General/core/BottomSheet";

function BankTransactionBottomSheet({
  handleSmoothClose,
  isSuccess,
  rejectReason,
  date,
}: {
  handleSmoothClose: THandleSmoothClose;
  isSuccess: boolean;
  rejectReason?: string;
  date: string;
}) {
  return (
    <div>
      <p className="text-14 leading-24 text-black mb-16">
        مبلغ 15.500.000 تومان بابت رزرو اقامتگاه دوخوابه گلشن2 با کد رزرو :1566654 به حساب شما واریز
        شد
      </p>

      <div className="rounded-10 typical-gray-bg p-12 ">
        <div
          className={`
            pr-12 border-r-2 border-solid
            ${isSuccess ? "border-r-success" : "border-r-error-light"}
        `}
        >
          {/* first line */}
          <div className="flex items-center justify-between mb-12">
            <p className="text-14 sm:text-16 leading-16 sm:leading-28 text-black font-m">
              {(15500000).toLocaleString("en-US")} تومان
            </p>
            <div
              className={`
                text-10 leading-17 text-white font-r py-4 px-12 rounded-50
                ${isSuccess ? "bg-success" : "bg-error-light"}
              `}
            >
              تراکنش موفق
            </div>
          </div>
          {/* second line */}
          {!!isSuccess ? (
            <p className="text-14 text-black">واریز به : 6037997518931440</p>
          ) : (
            <p className="text-14 text-error-light">{rejectReason}</p>
          )}

          <div className="mt-12 flex items-center justify-between">
            <p className="text-12 text-info">کد رزرو : 1524585</p>
            <p className="font-l text-12 leading-21 text-black">{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankTransactionBottomSheet;
