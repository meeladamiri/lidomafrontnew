import type { IWalletTransaction } from "@/api/Wallet";

/**
 * One ledger row.
 *
 * What this replaced knew only "succeeded" or "failed" and always read
 * "واریز به: …", because the Odoo endpoint returned nothing else. The ledger
 * now has a kind and a signed amount, so a row can say whether money came in
 * or went out — which is the first thing anyone looks for.
 */

const KIND_LABEL: Record<IWalletTransaction["kind"], string> = {
  BOOKING_INCOME: "درآمد رزرو",
  BOOKING_REFUND: "بازگشت وجه",
  SETTLEMENT: "تسویه",
  GIFT: "اعتبار هدیه",
  ADJUSTMENT: "اصلاح حساب",
};

const STATUS_STYLE: Record<
  IWalletTransaction["status"],
  { label: string; className: string; border: string }
> = {
  DONE: { label: "انجام شد", className: "bg-success", border: "border-r-success" },
  PENDING: { label: "در انتظار", className: "bg-warning", border: "border-r-warning" },
  FAILED: { label: "ناموفق", className: "bg-error-light", border: "border-r-error-light" },
};

const fa = (n: number) => Math.abs(n).toLocaleString("fa-IR");

function TransactionsCart({ transaction }: { transaction: IWalletTransaction }) {
  const status = STATUS_STYLE[transaction.status] ?? STATUS_STYLE.DONE;
  const isCredit = transaction.amount > 0;

  return (
    <div className="rounded-10 p-12 typical-gray-bg">
      <div className={`border-r-2 border-solid pr-12 ${status.border}`}>
        <div className="mb-12 flex items-center justify-between gap-x-8">
          <p className="text-16 leading-28 font-m text-black">
            {/* The sign is spelled out. A leading "-" on a right-to-left line
                lands where a reader does not look for it. */}
            <span className={isCredit ? "text-success" : "text-black"}>
              {isCredit ? "+" : "−"} {fa(transaction.amount)}
            </span>{" "}
            تومان
          </p>

          <p
            className={`shrink-0 rounded-50 px-12 py-4 text-10 leading-17 text-white ${status.className}`}
          >
            {status.label}
          </p>
        </div>

        <p className="mb-12 text-14 leading-22 text-black">
          <span className="text-gray-6C6A7D">{KIND_LABEL[transaction.kind] ?? "تراکنش"}: </span>
          {transaction.description}
        </p>

        {transaction.failure_reason && (
          <p className="mb-12 text-13 leading-20 text-error-light">{transaction.failure_reason}</p>
        )}

        <p className="flex flex-wrap items-center justify-between gap-x-12 gap-y-4">
          {transaction.reserve_code ? (
            <span className="text-12 text-info">کد رزرو: {transaction.reserve_code}</span>
          ) : (
            <span />
          )}
          <span className="text-12 text-gray-959FA7">
            موجودی پس از تراکنش: {fa(transaction.balance_after)} تومان
          </span>
        </p>
      </div>
    </div>
  );
}

export default TransactionsCart;
