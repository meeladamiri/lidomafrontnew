import { Checkbox } from "components/General/core/Checkbox";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import { Dispatch, SetStateAction } from "react";

function RenderCheckbox({
  checkedValue,
  unCheckedValue,
  extraFeatureName,
  facilityId,
  selectedExtraFeatures,
  setSelectedExtraFeatures,
}: {
  checkedValue: string;
  unCheckedValue: string;
  extraFeatureName: string;
  facilityId: number;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
}) {
  return (
    <div className="w-full">
      <Checkbox
        onChange={(e) => {
          // console.log("e.target.value", e.target.checked);
          if (!!e.target.checked) {
            // setSelectedFacilities((prev) => [...prev, facility]);
            setSelectedExtraFeatures((prev) => ({
              ...prev,
              [facilityId]: {
                ...prev[facilityId],
                [extraFeatureName]: checkedValue,
              },
            }));
          } else {
            setSelectedExtraFeatures((prev) => {
              // let's make a shallow copy of the state
              const newState = { ...prev };
              delete newState[facilityId][extraFeatureName];
              return newState;
            });
          }
        }}
        disabled={false}
        label={extraFeatureName}
        checked={!!selectedExtraFeatures?.[facilityId]?.[extraFeatureName]}
      />
    </div>
  );
}

export default RenderCheckbox;
