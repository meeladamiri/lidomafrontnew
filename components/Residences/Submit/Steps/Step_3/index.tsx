import { useMutation, useQuery } from "@tanstack/react-query";
import { Radio } from "components/General/core/Radio";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { RentType } from "interfaces/Residences/Submit";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StepTitle from "../../StepTitle";
import { Button } from "@/components/General/core/Button";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { getResidenceSubmittedData } from "@/api/Residences/getResidenceSubmittedData";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";

function Step3() {
  const router = useRouter();
  const [selectedRentType, setSelectedRentType] = useState<RentType["name"]>("");

  const { isLoading: getAllowedValuesIsLoading, data: allowedValuesData } = useQuery(
    ["getAllowedValues", router?.query?.step],
    () => getAllowedValues({ step: Number(router?.query?.step as string) })
  );

  const { isLoading: getResidenceSubmittedDataIsLaoding, data: residenceSubmittedData } = useQuery(
    ["getResidenceSubmittedData", router?.query?.step],
    () => {
      return getResidenceSubmittedData({
        step: Number(router?.query?.step as string),
        productId: Number(router?.query?.productId as string),
      });
    }
  );

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        if (!!setSelectedRentType) {
          setSelectedRentType(residenceSubmittedData?.params?.residence_info?.rent_type);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep3Mutation = useMutation(
    ({ rentType, productId }: { rentType: RentType["name"]; productId: number }) => {
      return submitStep({
        step: 3,
        productId,
        data: {
          rent_type: rentType,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          router.push(`?step=${4}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep3Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      rentType: selectedRentType,
    });
  }

  return getAllowedValuesIsLoading || getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <div>
          {(allowedValuesData?.params?.values as RentType[])?.map((rentType) => {
            return (
              <div key={rentType.id} className="mb-24 last:mb-0">
                <div className="flex items-center gap-x-8">
                  <Radio
                    label={rentType.name}
                    name={rentType.name}
                    value={rentType.name}
                    disabled={false}
                    checked={selectedRentType === rentType.name}
                    look={"selected"}
                    onChange={(e) => {
                      if (!!setSelectedRentType) {
                        setSelectedRentType(e.target.value);
                      }
                    }}
                  />
                  {/* <p className="text-14 leading-24 text-black font-r pr-24">{rentType.name}</p> */}
                </div>
                {!!rentType.description && (
                  <p className="pr-32 text-12 leading-21 text-black font-l mt-8">
                    {rentType.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomActionsWrapper
        onClickOfSubmitStep={() => onSubmitClick()}
        isSubmitBtnDisabled={!selectedRentType}
      >
        <Button
          isFullWidth
          onClick={onSubmitClick}
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          disabled={!selectedRentType}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step3;
