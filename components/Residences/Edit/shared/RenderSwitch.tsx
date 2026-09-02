import { Switch } from "components/General/core/Switch";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import { Dispatch, SetStateAction } from "react";

function RenderSwitch({
  checkedValue,
  unCheckedValue,
  name,
  facilityId,
  selectedExtraFeatures,
  setSelectedExtraFeatures,
}: {
  checkedValue: string;
  unCheckedValue: string;
  name: string;
  facilityId: number;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-14 leading-24 text-black font-r">{name}</p>
      <Switch
        name={name}
        label={
          !!selectedExtraFeatures?.[facilityId] && // This has to be true. bcz the facility is ticked so that user could enter to its bottom sheet.
          !!selectedExtraFeatures?.[facilityId]?.[name]
            ? checkedValue
            : unCheckedValue
        }
        checked={
          !!selectedExtraFeatures?.[facilityId] && // This has to be true. bcz the facility is ticked so that user could enter to its bottom sheet.
          !!selectedExtraFeatures?.[facilityId]?.[name]
        }
        onChange={(e) => {
          // console.log("Inside onChange");
          // console.log("e.target.checked switch", e?.target?.checked);
          if (e.target.checked) {
            setSelectedExtraFeatures((prev) => ({
              ...prev,
              [facilityId]: { ...prev[facilityId], [name]: checkedValue },
            }));
          } else {
            setSelectedExtraFeatures((prev) => {
              // let's make a shallow copy of the state
              const newState = { ...prev };
              delete newState[facilityId][name];
              return newState;
            });
          }
        }}
      />
    </div>
  );
}

export default RenderSwitch;
