import { submitTasfieRequest } from "@/api/Wallet";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "components/General/core/Button";
import { THandleSmoothClose } from "../General/core/BottomSheet";

export default function TasfieBottomSheet({
  credit_balance,
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
  credit_balance: number;
}) {
  const queryClient = useQueryClient();

  const submitTasfieRequestMutation = useMutation(() => submitTasfieRequest(), {
    onSuccess: (data) => {
      if (data?.status === "success") {
        queryClient.invalidateQueries(["getWalletAndTransactions"]);

        exception.message([
          {
            type: EXCEPTIONTYPES.SUCCESS,
            title: "درخواست تسویه کیف پول با موفقیت ثبت شد.",
          },
        ]);

        handleSmoothClose();
      } else {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: data?.err_msg || defaultError,
          },
        ]);

        handleSmoothClose();
      }
    },
  });

  return (
    <>
      <p className="text-14 leading-24 text-zilgara mb-16">
        آیا مایل به تسویه حساب کیف پول خود می باشید ؟
      </p>

      <div className="px-24 py-10 rounded-8 border-1 mb-32 border-solid border-gray-C4CAD3 flex items-center justify-center gap-x-8">
        <p className="text-12 leading-21 text-zilgara">موجودی کیف پول شما : </p>
        <p className="text-16 leading-28 text-zilgara font-m">
          {Number(credit_balance)?.toLocaleString("en-US")} تومان
        </p>
      </div>

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
            disabled={Number(credit_balance) === 0}
            onClick={() => {
              submitTasfieRequestMutation.mutate();
            }}
          >
            بله، تسویه کن
          </Button>
        </div>
      </div>
    </>
  );
}
