export interface ITransactionsCart {
  isFailed: boolean;
  failureReason?: string;
  price: number;
  transferredTo: string;
  reserveCode: string;
  date: string;
}

function TransactionsCart({
  isFailed,
  failureReason,
  price,
  transferredTo,
  reserveCode,
  date,
}: ITransactionsCart) {
  return (
    <div className="rounded-10 p-12 typical-gray-bg">
      <div
        className={`
            pr-12 border-r-2 border-solid
            ${isFailed ? "border-r-error-light" : "border-r-success"}
        `}
      >
        <div className="flex items-center justify-between mb-12">
          <p className="text-16 leading-28 text-black font-m">{price?.toLocaleString("en-US")} تومان</p>

          <p
            className={`px-12 py-4 text-10 leading-17 text-white rounded-50 ${
              !isFailed ? "bg-success" : "bg-error-light"
            }`}
          >
            {isFailed ? "تراکنش ناموفق" : "تراکنش موفق"}
          </p>
        </div>

        {!!isFailed ? (
          <p className="text-14 text-error-light mb-12">{failureReason}</p>
        ) : (
          <p className="text-14 text-black mb-12">واریز به : {transferredTo}</p>
        )}

        <p className="flex items-center justify-between">
          <span className={`text-info text-12`}>کد رزرو : {reserveCode}</span>
          <span className="text-12 leading-21 text-black font-l">{date}</span>
        </p>
      </div>
    </div>
  );
}
export default TransactionsCart;
