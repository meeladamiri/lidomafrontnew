import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectReasons, rejectTheReserve, submitRejectReserveReason } from "api/Reserves";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { Radio } from "components/General/core/Radio";
import { Textarea } from "components/General/core/Textarea";
import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { RejectReasons_enum } from "constants/enums/reject_reasons";
import { useState } from "react";
import exception from "utilities/exception";

function RejectReserveWithReasonBottomSheet({
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
  const [rejectReason, setRejectReason] = useState<number>();
  const [manualRejectReason, setManualRejectReason] = useState<string>("");

  const queryClient = useQueryClient();

  const submitRejectReserveReasonMutation = useMutation(
    () => {
      const r = rejectReasons.find((el) => el.order === rejectReason);
      return submitRejectReserveReason({
        reserveId,
        reason: r?.key as RejectReasons_enum,
        desc: manualRejectReason,
      });
    },
    {
      onSuccess: (d) => {
        if (d?.status === "success") {
          queryClient.invalidateQueries(["getReserve"]);
          handleSmoothClose();
          exception.message([
            { type: EXCEPTIONTYPES.ERROR, title: "درخواست رزرو توسط شما لغو شد" },
          ]);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.ERROR, title: "مشکلی در ثبت دلیل رد درخواست رخ داد." },
          ]);
        }
      },
    }
  );

  const rejectReserveMutation = useMutation(
    () => {
      return rejectTheReserve({ reserveId });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          submitRejectReserveReasonMutation.mutate();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: "مشکلی در رد درخواست رخ داد." }]);
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
                checked={rejectReason === r.order}
                label={r.text}
                value={r.order.toString()}
                onChange={(e) => {
                  setRejectReason(Number(e.target.value));
                  // reset Manual Reject Reason
                  setManualRejectReason("");
                }}
                wrapperClassnames=""
                look="checked"
              />
            </div>
          );
        })}
      </div>

      {rejectReason === reasonsList.length && (
        <div className="mt-8">
          <Textarea
            name="manualRejectReason"
            customValue={manualRejectReason || ""}
            customOnChange={(value) => setManualRejectReason(value)}
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
            disabled={!rejectReason}
            isLoading={rejectReserveMutation.isLoading}
            onClick={() => rejectReserveMutation.mutate()}
          >
            رد درخواست
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RejectReserveWithReasonBottomSheet;
