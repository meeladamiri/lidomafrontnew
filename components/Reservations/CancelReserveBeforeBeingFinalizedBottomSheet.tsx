import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReasons, cancelReserve } from "api/Reserves";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { Radio } from "components/General/core/Radio";
import { Textarea } from "components/General/core/Textarea";
import { CancelReasons_enum } from "constants/enums/cancel_reasons";
import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { useState } from "react";
import exception from "utilities/exception";

function CancelReserveBeforeBeingFinalizedBottomSheet({
  handleSmoothClose,
  reasonsList,
  reserveId,
}: {
  handleSmoothClose: THandleSmoothClose;
  reserveId: number;
  reasonsList: {
    key: string;
    text: string;
    order: number; // start idx from 1 in the list
  }[]; // include "سایر موارد" as the last item in the list
}) {
  const [cancelReason, setCancelReason] = useState<number>();
  const [manualCancelReason, setManualCancelReason] = useState<string>("");

  const queryClient = useQueryClient();

  const cancelReserveMutation = useMutation(
    () => {
      const r = cancelReasons.find((el) => el.order === cancelReason);
      return cancelReserve({
        reserveId,
        reason: r?.key as CancelReasons_enum,
        desc: manualCancelReason,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          //   submitRejectReserveReasonMutation.mutate();
          queryClient.invalidateQueries(["getReserve"]);
          handleSmoothClose();
          exception.message([
            { type: EXCEPTIONTYPES.ERROR, title: "درخواست رزرو توسط شما لغو شد" },
          ]);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.ERROR, title: "مشکلی در لغو درخواست رخ داد." },
          ]);
        }
      },
    }
  );

  return (
    <div>
      <div>
        {reasonsList.map((r, i) => {
          return (
            <div
              key={i}
              className="pb-12 border-b-1 border-solid border-[#1C345442] mb-12 last:pb-0 last:border-b-none last:mb-0"
            >
              <Radio
                name=""
                checked={cancelReason === r.order}
                label={r.text}
                value={r.order.toString()}
                onChange={(e) => {
                  setCancelReason(Number(e.target.value));
                  // reset Manual Reject Reason
                  setManualCancelReason("");
                }}
                wrapperClassnames=""
                look="checked"
              />
            </div>
          );
        })}
      </div>

      {cancelReason === reasonsList.length && (
        <div className="mt-8">
          <Textarea
            name="manualCancelReason"
            customValue={manualCancelReason || ""}
            customOnChange={(value) => setManualCancelReason(value)}
            rows={3}
            placeholder="لطفاً دلیل رد درخواست را شرح دهید"
          />
        </div>
      )}

      <div className="grid grid-cols-6 gap-x-12 mt-24">
        <div className="col-span-2">
          <Button color="grey" isFullWidth onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-4">
          <Button
            color="error"
            variant="outlined"
            isFullWidth
            disabled={!cancelReason}
            isLoading={cancelReserveMutation.isLoading}
            onClick={() => cancelReserveMutation.mutate()}
          >
            رد درخواست
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CancelReserveBeforeBeingFinalizedBottomSheet;
