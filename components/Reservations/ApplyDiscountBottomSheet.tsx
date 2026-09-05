import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitDiscountCode } from "api/Reserves";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { useState } from "react";
import exception from "utilities/exception";
import { TextField } from "../General/core/TextField";

function ApplyDiscountBottomSheet({
  handleSmoothClose,
  reserveId,
}: {
  handleSmoothClose: THandleSmoothClose;
  reserveId: number;
}) {
  const [guestEnteredCode, setGuestEnteredCode] = useState<string>("");
  const [fieldCustomError, setFieldCustomError] = useState<string>("");

  const submitDiscountCodeMutation = useMutation(
    () => {
      return submitDiscountCode({ order_id: reserveId, voucher_code: guestEnteredCode });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          queryClient.invalidateQueries(["getReserve"]);

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "کد تخفیف با موفقیت اعمال شد." },
          ]);

          handleSmoothClose();
        } else {
          //   exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
          setFieldCustomError(data?.err_msg);
        }
      },
    }
  );

  const queryClient = useQueryClient();

  return (
    <div>
      <div>
        <TextField
          name="guest-discount-code-input"
          customValue={guestEnteredCode}
          customOnChange={(value) => {
            setGuestEnteredCode(value);
            setFieldCustomError("");
          }}
          customError={fieldCustomError}
          label={
            <span className="flex items-center gap-x-8">
              <i className="icon-Offer text-24 text-black" />
              <span className="text-14 leading-24 text-black font-r">
                کد تخفیف خود را در کادر زیر وارد کنید
              </span>
            </span>
          }
          fillFrom="ltr"
          rightIcon={
            !guestEnteredCode ? undefined : (
              <span
                className="flex items-center justify-center bg-gray-F4F5F6 rounded-full cursor-pointer"
                onClick={() => {
                  setGuestEnteredCode("");
                  setFieldCustomError("");
                }}
              >
                <i className="icon-CloseButton text-24" />
              </span>
            )
          }
        />
      </div>

      <div className="mt-24">
        <Button
          color="primary"
          variant="contained"
          isFullWidth
          isLoading={submitDiscountCodeMutation.isLoading}
          onClick={() => submitDiscountCodeMutation.mutate()}
          disabled={!guestEnteredCode}
        >
          بررسی و اعمال تخفیف
        </Button>
      </div>
    </div>
  );
}

export default ApplyDiscountBottomSheet;
