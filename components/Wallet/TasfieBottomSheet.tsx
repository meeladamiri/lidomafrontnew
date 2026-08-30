import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { requestSettlement } from "@/api/Wallet";
import { Button } from "components/General/core/Button";
import { THandleSmoothClose } from "../General/core/BottomSheet";

/** Mirrors MIN_SETTLEMENT in the backend, which is what actually enforces it. */
const MIN_SETTLEMENT = 50_000;

/**
 * Asking for a payout.
 *
 * The amount is a field rather than "settle everything". A host who wants to
 * take out part of a balance and leave the rest had no way to say so, and the
 * old sheet sent no amount at all — the Odoo endpoint decided.
 */
export default function TasfieBottomSheet({
  credit_balance,
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
  credit_balance: number;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>(String(credit_balance || ""));

  const value = Number(amount.replace(/[^\d]/g, "")) || 0;
  const tooSmall = value < MIN_SETTLEMENT;
  const tooLarge = value > credit_balance;

  const submit = useMutation({
    mutationFn: () => requestSettlement(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      toast.success("درخواست تسویه ثبت شد.");
      handleSmoothClose();
    },
    // The backend's message is the specific one — an open request, a balance
    // that moved between page load and submit — so it is shown as-is.
    onError: (error: any) => toast.error(error?.message || "درخواست تسویه ثبت نشد"),
  });

  return (
    <>
      <div className="mb-16 flex items-center justify-center gap-x-8 rounded-8 border-1 border-solid border-gray-C4CAD3 px-24 py-10">
        <p className="text-12 leading-21 text-zilgara">موجودی قابل برداشت:</p>
        <p className="text-16 leading-28 font-m text-zilgara">
          {credit_balance.toLocaleString("fa-IR")} تومان
        </p>
      </div>

      <label htmlFor="settlement-amount" className="mb-8 block text-14 leading-20 text-black">
        مبلغ درخواستی (تومان)
      </label>
      <input
        id="settlement-amount"
        inputMode="numeric"
        value={value ? value.toLocaleString("fa-IR") : ""}
        onChange={(e) => setAmount(e.target.value)}
        aria-describedby="settlement-hint"
        className="mb-8 w-full rounded-8 border-1 border-solid border-gray-C4CAD3 px-16 py-12 text-16 font-m text-black outline-none focus:border-primary-main"
      />

      <p id="settlement-hint" className="mb-24 text-12 leading-20 text-gray-6C6A7D">
        {tooLarge
          ? "مبلغ درخواستی از موجودی قابل برداشت بیشتر است."
          : tooSmall
            ? `حداقل مبلغ تسویه ${MIN_SETTLEMENT.toLocaleString("fa-IR")} تومان است.`
            : "پس از تأیید، مبلغ به حساب بانکی ثبت‌شده واریز می‌شود."}
      </p>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            type="submit"
            disabled={tooSmall || tooLarge || submit.isLoading}
            isLoading={submit.isLoading}
            loadingText="در حال ثبت"
            onClick={() => submit.mutate()}
          >
            ثبت درخواست تسویه
          </Button>
        </div>
      </div>
    </>
  );
}
