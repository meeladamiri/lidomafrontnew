import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptTheReserve } from "api/Reserves";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import exception from "utilities/exception";

function ConfirmReserveBottomSheet({
  handleSmoothClose,
  reserveId,
}: {
  handleSmoothClose: THandleSmoothClose;
  reserveId: number;
}) {
  const queryClient = useQueryClient();

  const acceptReserveMutation = useMutation(
    () => {
      return acceptTheReserve({ reserveId });
    },
    {
      onSuccess: (data) => {
        // console.log("At onSuccess of acceptTheReserve", data);
        if (data?.status === "success") {
          queryClient.invalidateQueries(["getReserve"]);
          handleSmoothClose();
          exception.message([
            { type: EXCEPTIONTYPES.INFO, title: "درخواست رزرو توسط شما تأیید شد" },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <div>
      <p className="text-14 leading-24 text-black mb-16">
        آیا از تأیید این درخواست اطمینان دارید ؟
      </p>
      <div>
        <Button
          isFullWidth
          className="mb-12"
          isLoading={acceptReserveMutation.isLoading}
          loadingText="در حال تأیید…"
          onClick={() => acceptReserveMutation.mutate()}
        >
          بله، تأیید کن
        </Button>
        <Button isFullWidth variant="outlined" color="error" onClick={handleSmoothClose}>
          خیر، انصراف
        </Button>
      </div>
    </div>
  );
}
export default ConfirmReserveBottomSheet;
