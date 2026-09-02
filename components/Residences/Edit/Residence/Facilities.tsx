import { getAmenities } from "@/api/Residences/getAmenities";
import { useQuery } from "@tanstack/react-query";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { Checkbox } from "components/General/core/Checkbox";
import { TextField } from "components/General/core/TextField";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IAmenity_ExtraFeature, ResidenceAmenity } from "interfaces/Residences/Submit";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});
const FacilityDetailsBottomSheet = dynamic(
  () => import("components/Residences/Edit/shared/FacilityDetailsBottomSheet"),
  {
    ssr: true,
  }
);

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

const EditResidenceFacilities = ({
  selectedFacilities,
  setSelectedFacilities,
  selectedExtraFeatures,
  setSelectedExtraFeatures,
  resSpecialFacilities,
  setResSpecialFacilities,
}: {
  selectedFacilities: ResidenceAmenity[];
  setSelectedFacilities: Dispatch<SetStateAction<ResidenceAmenity[]>>;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
  resSpecialFacilities: string;
  setResSpecialFacilities: Dispatch<SetStateAction<string>>;
}) => {
  const [facilities, setFacilities] = useState<ResidenceAmenity[]>();

  const [facilityDetailsBottomSheet, setFacilityDetailsBottomSheet] = useState(
    facilityDetailsBottomSheetInitV
  );

  const { isLoading: getAmenitiesIsLoading, data } = useQuery(["getAmenities"], () =>
    getAmenities()
  );

  useEffect(() => {
    if (!!data) {
      // console.log(`getAmenities data`, data);

      if (data?.status === "success") {
        const allAmenities: ResidenceAmenity[] = data?.params?.amenities;

        const facilities = allAmenities?.filter((el) => el.category === "امکانات");

        setFacilities(facilities);
      }
    }
  }, [data]);

  return (
    <div className="">
      {getAmenitiesIsLoading ? (
        <TinyLoader />
      ) : (
        <>
          <p className="text-16 leading-28 text-black font-m mb-24">
            امکانات اقامتگاه را انتخاب کنید
          </p>

          {/* facilities list */}
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
                      // console.log("e.target.value", e.target.checked);
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
                        alt={`آیکون ${facility.name}`}
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

          <div className="mt-24">
            <TextField
              name="resSpecialFacilities"
              label="سایر امکانات"
              placeholder="امکانات ویژه اقامتگاه"
              customValue={resSpecialFacilities}
              customOnChange={(value) => setResSpecialFacilities(value)}
            />
          </div>
        </>
      )}

      {!!facilityDetailsBottomSheet.show && (
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
      )}
    </div>
  );
};

export default EditResidenceFacilities;
