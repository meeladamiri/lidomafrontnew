import { useQueryClient } from "@tanstack/react-query";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useRouter } from "next/router";

function HaltSubmitResidenceProcess({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div>
      <p className="text-14 leading-24 font-r text-black text-center">
        آیا میخواهید فرایند ثبت اقامتگاه را متوقف کنید؟
      </p>

      <div className="mt-32">
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
              onClick={() => {
                queryClient.invalidateQueries();
                router.push("/residences/submit");
                handleSmoothClose();
              }}
            >
              بله
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HaltSubmitResidenceProcess;
