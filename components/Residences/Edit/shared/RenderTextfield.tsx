import { TextField } from "components/General/core/TextField";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import { Dispatch, SetStateAction } from "react";

function RenderTextfield({
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
    <div className="flex items-center justify-between">
      <p className="text-14 leading-24 text-black font-r">{name}</p>

      <div className="w-[180px]">
        <TextField
          name={name}
          placeholder={placeholder || ""}
          inputClassname="!leading-18"
          customOnChange={(value) => {
            setSelectedExtraFeatures((prev) => ({
              ...prev,
              [facilityId]: {
                ...prev[facilityId],
                [name]: value,
              },
            }));
          }}
          customValue={selectedExtraFeatures?.[facilityId]?.[name]}
        />
      </div>
    </div>
  );
}

export default RenderTextfield;
