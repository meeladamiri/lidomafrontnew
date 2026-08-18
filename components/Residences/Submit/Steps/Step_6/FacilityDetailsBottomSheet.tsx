import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { IAmenity_ExtraFeature, TSwitchValues } from "interfaces/Residences/Submit";
import { Dispatch, SetStateAction, useState } from "react";
import RenderSwitch from "./RenderSwitch";
import RenderDropdown from "./RenderDropdown";
import RenderCheckbox from "./RenderCheckbox";
import RenderTextfield from "./RenderTextfield";
import { Textarea } from "components/General/core/Textarea";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";

function RenderTextarea({
  name,
  facilityId,
  selectedExtraFeatures,
  setSelectedExtraFeatures,
  placeholder,
}: {
  name: string;
  facilityId: number;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
  placeholder?: string;
}) {
  return (
    <div className="w-full">
      <Textarea
        rows={1}
        name={name}
        label={name}
        labelClassname="!mb-8"
        placeholder={placeholder || ""}
        // inputClassname="!leading-18"
        customOnChange={(value) => {
          setSelectedExtraFeatures((prev) => ({
            ...prev,
            [facilityId]: {
              ...prev[facilityId],
              [name]: value,
            },
          }));
        }}
        customValue={selectedExtraFeatures?.[facilityId]?.[name]?.toString()}
      />
    </div>
  );
}

function FacilityDetailsBottomSheet({
  handleSmoothClose,
  extraFeaturesData,
  // tickedFacilities,
  // setTickedFacilities,
  selectedExtraFeatures,
  setSelectedExtraFeatures,
  facilityId,
}: {
  handleSmoothClose: THandleSmoothClose;
  extraFeaturesData: IAmenity_ExtraFeature[];
  // tickedFacilities: number[];
  // setTickedFacilities: Dispatch<SetStateAction<number[]>>;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
  facilityId: number;
}) {
  const [localSelectedExtraFeatures, setLocalSelectedExtraFeatures] =
    useState<ISelectedExtraFeatures>(selectedExtraFeatures);

  return (
    <div>
      <div className="grid grid-cols-12 gap-x-10 gap-y-16">
        {extraFeaturesData.map((extraFeature: IAmenity_ExtraFeature, i: number) => {
          if (extraFeature.field_type === "switch") {
            const allowedValues = extraFeature.values as TSwitchValues;
            // first item in 'allowedValuesArr' is always 'checkedValue' and second item is always 'unCheckedValue';
            const allowedValuesArr = allowedValues?.split(",");
            const checkedValue = allowedValuesArr[0].trim();
            const unCheckedValue = allowedValuesArr[1].trim();

            return (
              <div key={extraFeature.name + i} className="col-span-full">
                <RenderSwitch
                  checkedValue={checkedValue}
                  unCheckedValue={unCheckedValue}
                  name={extraFeature.name}
                  facilityId={facilityId}
                  selectedExtraFeatures={localSelectedExtraFeatures}
                  setSelectedExtraFeatures={setLocalSelectedExtraFeatures}
                />
              </div>
            );
          } else if (extraFeature.field_type === "dropdown") {
            const allowedValuesArr = extraFeature.values?.split(",");
            // console.log("allowedValuesArr", allowedValuesArr);
            const trimmedAllowedValues = allowedValuesArr?.map((item) => item.trim());
            // console.log("trimmedAllowedValues", trimmedAllowedValues);
            return (
              <div key={extraFeature.name + i} className="col-span-full">
                <RenderDropdown
                  name={extraFeature.name}
                  placeholder={extraFeature?.placeholder}
                  allowedValues={trimmedAllowedValues}
                  facilityId={facilityId}
                  selectedExtraFeatures={localSelectedExtraFeatures}
                  setSelectedExtraFeatures={setLocalSelectedExtraFeatures}
                />
              </div>
            );
          } else if (extraFeature.field_type === "checkbox") {
            const allowedValues = extraFeature.values as TSwitchValues;
            // first item in 'allowedValuesArr' is always 'checkedValue' and second item is always 'unCheckedValue';
            const allowedValuesArr = allowedValues?.split(",");
            const checkedValue = allowedValuesArr[0].trim();
            const unCheckedValue = allowedValuesArr[1].trim();

            return (
              <div key={extraFeature.name + i} className="col-span-6">
                <RenderCheckbox
                  checkedValue={checkedValue}
                  unCheckedValue={unCheckedValue}
                  extraFeatureName={extraFeature.name}
                  facilityId={facilityId}
                  selectedExtraFeatures={localSelectedExtraFeatures}
                  setSelectedExtraFeatures={setLocalSelectedExtraFeatures}
                />
              </div>
            );
          } else if (extraFeature.field_type === "text" && extraFeature.name !== "توضیحات") {
            return (
              <div key={extraFeature.name + i} className="col-span-full">
                <RenderTextfield
                  name={extraFeature.name}
                  facilityId={facilityId}
                  selectedExtraFeatures={localSelectedExtraFeatures}
                  setSelectedExtraFeatures={setLocalSelectedExtraFeatures}
                  placeholder={extraFeature.placeholder}
                />
              </div>
            );
          } else if (extraFeature.field_type === "text" && extraFeature.name === "توضیحات") {
            return (
              <div key={extraFeature.name + i} className="col-span-full">
                <RenderTextarea
                  name={extraFeature.name}
                  facilityId={facilityId}
                  selectedExtraFeatures={localSelectedExtraFeatures}
                  setSelectedExtraFeatures={setLocalSelectedExtraFeatures}
                  placeholder={extraFeature.placeholder}
                />
              </div>
            );
          }
        })}
      </div>

      <div className="grid grid-cols-3 gap-x-12 mt-32">
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
              setSelectedExtraFeatures(localSelectedExtraFeatures);
              handleSmoothClose();
            }}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FacilityDetailsBottomSheet;
