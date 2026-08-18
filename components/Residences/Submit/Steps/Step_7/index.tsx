import { useMutation, useQuery } from "@tanstack/react-query";
import { Select } from "components/General/core/Select";
import { Textarea } from "components/General/core/Textarea";
import { TextField } from "components/General/core/TextField";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useEffect, useState } from "react";
import ProvincesListModal from "components/General/Address/ProvincesListModal";
import CitiesListModal from "components/General/Address/CitiesListModal";
import { IResidenceAddressInfo } from "interfaces/Residences/Submit/Steps/Step_7";
import { useRouter } from "next/router";
import StepTitle from "../../StepTitle";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { Button } from "@/components/General/core/Button";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { submitStep } from "@/api/SubmitResidence";
import { getResidenceSubmittedData } from "@/api/Residences/getResidenceSubmittedData";

function Step7() {
  const router = useRouter();
  const [showProvincesListModal, setShowProvincesListModal] = useState<boolean>(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState<boolean>(false);

  const [selectedProvince, setSelectedProvince] = useState<{ id: number; name: string }>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [neighborhoodValue, setNeighborhoodValue] = useState<string>("");
  const [exactAddress, setExactAddress] = useState<string>("");

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useQuery(["getResidenceSubmittedData", router?.query?.step], () => {
    return getResidenceSubmittedData({
      step: Number(router?.query?.step as string),
      productId: Number(router?.query?.productId as string),
    });
  });

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const residenceAddressInfo: IResidenceAddressInfo =
          residenceSubmittedData.params.residence_info;

        if (!!residenceAddressInfo?.province) {
          setSelectedProvince({
            id: residenceAddressInfo.province?.id,
            name: residenceAddressInfo.province?.name,
          });
        } else {
          setSelectedProvince(undefined);
        }
        setSelectedCity(residenceAddressInfo.city);
        setNeighborhoodValue(residenceAddressInfo.neighborhood || "");
        setExactAddress(residenceAddressInfo.address || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep7Mutation = useMutation(
    ({
      productId,
      province,
      city,
      neighborhood,
      address,
    }: {
      productId: number;
      province: string;
      city: string;
      neighborhood: string;
      address: string;
    }) => {
      const data: { [key: string]: string } = {};

      if (!!province) {
        data["province"] = province;
      }
      if (!!city) {
        data["city"] = city;
      }
      if (!!neighborhood) {
        data["neighborhood"] = neighborhood;
      }
      if (!!address) {
        data["address"] = address;
      }

      return submitStep({
        step: 7,
        productId,
        data,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${8}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep7Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      province: selectedProvince?.name || "",
      city: selectedCity || "",
      neighborhood: neighborhoodValue,
      address: exactAddress,
    });
  }

  return (
    <>
      {getResidenceSubmittedDataIsLaoding ? (
        <TinyLoader />
      ) : (
        <>
          <div className="pb-120 md:pb-[130px]">
            <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

            <div>
              <div
                className="mb-16"
                onClick={() => {
                  setShowProvincesListModal(true);
                }}
              >
                <Select
                  name={"select-province"}
                  placeholder={"انتخاب کنید"}
                  labelText="استان"
                  readOnly={true}
                  data={[].map((_, i) => "")}
                  value={selectedProvince?.name}
                  // onChange={(value) => setSelectedYear(value)}
                  onChange={(value) => {}}
                />
              </div>

              <div
                className="mb-16"
                onClick={() => {
                  if (!selectedProvince) return;
                  setShowCitiesListModal(true);
                }}
              >
                <Select
                  name={"select-city"}
                  placeholder={"انتخاب کنید"}
                  disabled={!selectedProvince}
                  labelText="شهر"
                  readOnly={true}
                  data={[].map((_, i) => "")}
                  value={selectedCity}
                  onChange={(value) => {}}
                />
              </div>

              <div className="mb-16">
                <TextField
                  name="neighborhood"
                  label="محله"
                  placeholder="مثال : کله سهی"
                  customValue={neighborhoodValue}
                  customOnChange={(value) => setNeighborhoodValue(value)}
                />
              </div>

              <Textarea
                label="آدرس دقیق"
                name="exactAddress"
                rows={3}
                placeholder="مانند : شیراز، بلوار چمران، ابیوردی 3 ، کوچه 7، پلاک36"
                customValue={exactAddress}
                customOnChange={(value) => setExactAddress(value)}
              />
            </div>

            {!!showProvincesListModal && (
              <ProvincesListModal
                isModalOpen={showProvincesListModal}
                handleClose={() => setShowProvincesListModal(false)}
                handleAfterSelect={() => {
                  setShowCitiesListModal(true);
                }}
                // selectedProvince={selectedProvince}
                setSelectedProvince={setSelectedProvince}
                setSelectedCity={setSelectedCity}
              />
            )}

            {!!showCitiesListModal && (
              <CitiesListModal
                isModalOpen={showCitiesListModal}
                handleClose={() => setShowCitiesListModal(false)}
                selectedProvince={selectedProvince}
                // selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                handleGoBack={() => setShowProvincesListModal(true)}
              />
            )}
          </div>

          <BottomActionsWrapper onClickOfSubmitStep={() => onSubmitClick()}>
            <Button
              leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
              isFullWidth
              onClick={onSubmitClick}
            >
              ذخیره و ادامه
            </Button>
          </BottomActionsWrapper>
        </>
      )}
    </>
  );
}

export default Step7;
