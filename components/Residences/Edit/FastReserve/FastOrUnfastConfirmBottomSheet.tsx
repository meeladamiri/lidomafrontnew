import { fastOrUnfastResidences } from "@/api/Residences/fastOrUnfastResidences";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import exception from "@/utilities/exception";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { FastUnfastOptions_enum } from "constants/enums/fast_unfast_options";
import { useRouter } from "next/router";

function FastOrUnfastConfirmBottomSheet({
  handleSmoothClose,
  datesToFastOrUnfast,
  isAllResidencesSelected,
  payload,
  resetAllSelectedDays,
}: {
  handleSmoothClose: THandleSmoothClose;
  datesToFastOrUnfast: string[]; // ex: ["1401/11/26", "1401/11/27"]
  isAllResidencesSelected: boolean;
  payload: {
    eligibleRoomsIds: number[];
    productIds: number[];
  };
  resetAllSelectedDays: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const fastOrUnfastResidencesMutation = useMutation(
    ({
      product_id,
      products,
      dates,
      fast_option,
      res_type,
    }: {
      fast_option: FastUnfastOptions_enum;
      product_id?: number;
      products?: number[];
      res_type: ResidenceTypes_enum;
      dates: string[];
    }) => {
      const options: {
        product_id?: number;
        products?: number[];
        dates: string[];
        fast: FastUnfastOptions_enum;
        res_type: ResidenceTypes_enum;
      } = {
        dates: dates,
        fast: fast_option,
        res_type,
      };

      if (isAllResidencesSelected) {
        options["products"] = products;
      } else {
        // 'residenceIds' has ONLY one item.
        options["product_id"] = product_id;
      }

      return fastOrUnfastResidences(options);
    },
    {
      onSuccess: (resp) => {
        if (resp?.status === "success") {
          // refetch(es)
          queryClient.invalidateQueries(["getCalendarData"]);
          // clearings
          // resetAllSelectedDays();
          // editCalendarPriceAndDiscount_MakeEmpty_Formik.resetForm();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
          ]);
          // setShowEditCalendarBottomSheet(false);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <div>
      <div className="mb-16">
        <Button
          isFullWidth
          color="secondary"
          rightIcon={<i className="icon-Flash text-24 text-white" />}
          onClick={async () => {
            try {
              if (isAllResidencesSelected) {
                await fastOrUnfastResidencesMutation.mutateAsync({
                  products: payload.productIds,
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.FAST,
                  res_type: ResidenceTypes_enum.PRODUCT,
                });

                await fastOrUnfastResidencesMutation.mutateAsync({
                  products: payload.eligibleRoomsIds,
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.FAST,
                  res_type: ResidenceTypes_enum.ROOM,
                });
              } else {
                const resp = await fastOrUnfastResidencesMutation.mutateAsync({
                  product_id: Number(router.query.residenceId as string),
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.FAST,
                  res_type: router.query.residenceType as ResidenceTypes_enum,
                });

                if (resp?.status === "success") {
                  // refetch(es)
                  // queryClient.invalidateQueries(["getCalendarData"]);
                  // clearings
                  resetAllSelectedDays();

                  // exception.message([
                  //   { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
                  // ]);

                  handleSmoothClose();
                }
              }
            } catch (e) {}
          }}
        >
          فعالسازی رزرو آنی
        </Button>
      </div>

      <div>
        <Button
          isFullWidth
          color="black"
          variant="outlined"
          rightIcon={<i className="icon-Power text-24 text-black" />}
          onClick={async () => {
            try {
              if (isAllResidencesSelected) {
                await fastOrUnfastResidencesMutation.mutateAsync({
                  products: payload.productIds,
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.UNFAST,
                  res_type: ResidenceTypes_enum.PRODUCT,
                });

                await fastOrUnfastResidencesMutation.mutateAsync({
                  products: payload.eligibleRoomsIds,
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.UNFAST,
                  res_type: ResidenceTypes_enum.ROOM,
                });
              } else {
                const resp = await fastOrUnfastResidencesMutation.mutateAsync({
                  product_id: Number(router.query.residenceId as string),
                  dates: datesToFastOrUnfast,
                  fast_option: FastUnfastOptions_enum.UNFAST,
                  res_type: router.query.residenceType as ResidenceTypes_enum,
                });

                if (resp?.status === "success") {
                  // refetch(es)
                  // queryClient.invalidateQueries(["getCalendarData"]);
                  // clearings
                  resetAllSelectedDays();

                  // exception.message([
                  //   { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
                  // ]);

                  handleSmoothClose();
                }
              }
            } catch (e) {}
          }}
        >
          غیرفعالسازی رزرو آنی
        </Button>
      </div>
    </div>
  );
}

export default FastOrUnfastConfirmBottomSheet;
