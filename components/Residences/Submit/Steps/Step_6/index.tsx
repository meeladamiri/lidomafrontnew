import { useMutation, useQuery } from "@tanstack/react-query";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { Checkbox } from "components/General/core/Checkbox";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IAmenity_ExtraFeature, ResidenceAmenity } from "interfaces/Residences/Submit";
import Image from "next/image";
import { useEffect, useState } from "react";
import FacilityDetailsBottomSheet from "./FacilityDetailsBottomSheet";
import { TextField } from "components/General/core/TextField";
import { useRouter } from "next/router";
import { ISelectedExtraFeatures } from "@/interfaces/Residences/Submit/Steps/Step_6";
import StepTitle from "../../StepTitle";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { getAmenities } from "@/api/Residences/getAmenities";
import { useResidenceDraft } from "../../useWizard";

const facilityDetailsBottomSheetInitV: {
  show: boolean;
  data: {
    facilityName: string;
    facilityId: number;
    extraFeatures: IAmenity_ExtraFeature[];
  };
} = {
  show: false,
  data: {
    facilityName: "",
    facilityId: 0,
    extraFeatures: [],
  },
};

function Step6() {
  const router = useRouter();

  const [facilities, setFacilities] = useState<ResidenceAmenity[]>();
  const [facilityDetailsBottomSheet, setFacilityDetailsBottomSheet] = useState(
    facilityDetailsBottomSheetInitV
  );

  const [selectedFacilities, setSelectedFacilities] = useState<ResidenceAmenity[]>([]);
  const [selectedExtraFeatures, setSelectedExtraFeatures] = useState<ISelectedExtraFeatures>({});
  const [resSpecialFacilities, setResSpecialFacilities] = useState<string>("");

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        if (!!residenceSubmittedData?.params?.residence_info?.amenities) {
          const alreadySubmittedAmenities: {
            category: string; // surely it is "امکانات"
            id: number;
            name: string;
            value: string;
          }[] = residenceSubmittedData?.params?.residence_info?.amenities;

          setSelectedFacilities(
            alreadySubmittedAmenities.map((item) => ({
              category: item.category,
              icon_url: "", // we don't actually use this; for 'icon_url', we use 'icon_url' of "getAmenities" API;
              id: item.id,
              name: item.name,
              values: item.value,
              extra_features: [], // we don't actually use this; for listing extra_features, we use "getAmenities" API;
            }))
          );
        }

        if (!!residenceSubmittedData?.params?.residence_info?.extra_features) {
          const alreadySubmittedExtraFeatures: {
            [
              key: number // facilityId
            ]: {
              [key: string | number]: string | number;
            };
          } & { others?: string } = JSON.parse(
            residenceSubmittedData?.params?.residence_info?.extra_features
          );

          const alreadySubmittedExtraFeaturesWithoutOthersField = {
            ...alreadySubmittedExtraFeatures,
          };
          delete alreadySubmittedExtraFeaturesWithoutOthersField.others;

          setSelectedExtraFeatures(alreadySubmittedExtraFeaturesWithoutOthersField);

          setResSpecialFacilities(alreadySubmittedExtraFeatures.others || "");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const { isLoading: getAmenitiesIsLoading, data: amenitiesData } = useQuery(["getAmenities"], () =>
    getAmenities()
  );

  useEffect(() => {
    if (!!amenitiesData) {
      if (amenitiesData?.status === "success") {
        const allAmenities: ResidenceAmenity[] = amenitiesData?.params?.amenities;

        const facilities = allAmenities?.filter((el) => el.category === "امکانات");
        setFacilities(facilities);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amenitiesData]);

  const submitStep6Mutation = useMutation(
    ({
      productId,
      amenities,
      others,
    }: {
      productId: number;
      amenities: {
        id: number;
        extra_features: { [key: string | number]: string | number };
      }[];
      others: string;
    }) => {
      return submitStep({
        step: 6,
        productId,
        data: {
          amenities,
          others,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${7}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep6Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      amenities: selectedFacilities.map((facility) => {
        return {
          id: facility.id,
          extra_features: selectedExtraFeatures[facility.id] || {},
        };
      }),
      others: resSpecialFacilities,
    });
  }

  return (
    <>
      {getResidenceSubmittedDataIsLaoding || getAmenitiesIsLoading ? (
        <TinyLoader />
      ) : (
        <>
          <div className="pb-120 md:pb-[130px]">
            <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

            <div>
              {facilities?.map((facility, index) => {
                return (
                  <div
                    className={`
                    p-12 border-1 border-solid
                    ${
                      !!selectedFacilities.find((el) => el.id === facility.id)
                        ? "border-primary-main"
                        : "border-[rgba(28,52,84,0.26)]"
                    }
                    rounded-8 mb-12 last:mb-0 flex items-center justify-between
                  `}
                    key={facility.id}
                  >
                    <Checkbox
                      onChange={(e) => {
                        if (!!e.target.checked) {
                          setSelectedFacilities((prev) => [...prev, facility]);
                        } else {
                          setSelectedFacilities((prev) => [
                            ...prev.filter((el) => el.id !== facility.id),
                          ]);
                          // remove all extra_features selected from this facility
                          setSelectedExtraFeatures((prev) => {
                            // let's make a shallow copy of the state
                            const newState = { ...prev };
                            delete newState[facility.id];
                            return newState;
                          });
                        }
                      }}
                      disabled={false}
                      label={facility.name}
                      subLabel={
                        <Image
                          src={facility.icon_url}
                          width={16}
                          height={16}
                          alt=""
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      }
                      checked={!!selectedFacilities.find((el) => el.id === facility.id)}
                    />

                    {!!selectedFacilities.find((el) => el.id === facility.id) &&
                      !!facility.extra_features &&
                      !!facility.extra_features.length && (
                        <Button
                          color="grey"
                          className="!py-4 !px-12 !text-12"
                          onClick={() => {
                            setFacilityDetailsBottomSheet({
                              show: true,
                              data: {
                                facilityName: facility.name,
                                facilityId: facility.id,
                                extraFeatures: facility.extra_features as IAmenity_ExtraFeature[],
                              },
                            });
                          }}
                        >
                          ویژگی ها
                        </Button>
                      )}
                  </div>
                );
              })}
            </div>

            {facilities?.length !== 0 && (
              <div className="mt-24">
                <TextField
                  name="resSpecialFacilities"
                  label="سایر امکانات"
                  placeholder="امکانات ویژه اقامتگاه"
                  customValue={resSpecialFacilities}
                  customOnChange={(value) => setResSpecialFacilities(value)}
                />
              </div>
            )}
          </div>

          <BottomActionsWrapper isSaving={submitStep6Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
            <Button
              isFullWidth
              isLoading={submitStep6Mutation.isLoading}
              loadingText="در حال ذخیره…"
              leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
              onClick={onSubmitClick}
            >
              ذخیره و ادامه
            </Button>
          </BottomActionsWrapper>
        </>
      )}

      <BottomSheet
        open={!!facilityDetailsBottomSheet.show}
        handleClose={() => setFacilityDetailsBottomSheet(facilityDetailsBottomSheetInitV)}
        headerTitle={facilityDetailsBottomSheet.data.facilityName}
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <FacilityDetailsBottomSheet
              handleSmoothClose={handleSmoothClose}
              extraFeaturesData={facilityDetailsBottomSheet.data.extraFeatures}
              selectedExtraFeatures={selectedExtraFeatures}
              setSelectedExtraFeatures={setSelectedExtraFeatures}
              facilityId={facilityDetailsBottomSheet.data.facilityId}
            />
          );
        }}
      />
    </>
  );
}

export default Step6;
