import { activateResidence } from "@/api/Residences/activateResidence";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import exception from "@/utilities/exception";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";

function ActivateResidenceBottomSheet({
  handleSmoothClose,
  residenceId,
  productType,
}: {
  handleSmoothClose: THandleSmoothClose;
  residenceId: number;
  productType: ResidenceTypes_enum;
}) {
  const queryClient = useQueryClient();

  const activateResidenceMutation = useMutation(
    ({ productId, productType }: { productId: number; productType: ResidenceTypes_enum }) => {
      return activateResidence({ product_id: productId, product_type: productType });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          // refetch residences list
          queryClient.invalidateQueries(["getResidencesList"]);

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "فعال سازی اقامتگاه با موفقیت انجام شد" },
          ]);

          handleSmoothClose();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
          handleSmoothClose();
        }
      },
    }
  );

  return (
    <div>
      <p className="mb-8 text-14 leading-24 text-black font-r">
        آیا از فعالسازی اقامتگاه خود مطمئن هستید ؟
      </p>

      <div className="flex items-center gap-x-8 mb-16">
        <li className="text-warning text-14 leading-24 font-r">توجه : </li>
        <p className="text-gray-77828F text-12 leading-21 font-r">
          با فعالسازی، اقامتگاه قابل رزرو خواهد بود
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            isFullWidth
            type="submit"
            onClick={() =>
              activateResidenceMutation.mutate({ productId: residenceId, productType })
            }
          >
            بله، فعال کن
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ActivateResidenceBottomSheet;
