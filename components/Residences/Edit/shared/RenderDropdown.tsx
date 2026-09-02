import { Select } from "components/General/core/Select";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import { Dispatch, SetStateAction } from "react";

function RenderDropdown({
  name,
  placeholder = "انتخاب کنید",
  allowedValues = [],
  selectedExtraFeatures,
  setSelectedExtraFeatures,
  facilityId,
}: {
  name: string;
  placeholder?: string;
  allowedValues?: string[];
  facilityId: number;
  selectedExtraFeatures: ISelectedExtraFeatures;
  setSelectedExtraFeatures: Dispatch<SetStateAction<ISelectedExtraFeatures>>;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-14 leading-24 text-black font-r">{name}</p>

      <div className="w-[180px]">
        <Select
          name={name}
          placeholder={placeholder}
          // formik={formik}
          // keyValue="name"
          // data={allowedValues.map((allowedValue, i) => ({
          //   id: i + 1,
          //   name: allowedValue,
          // }))}
          data={allowedValues.map((allowedValue, i) => allowedValue)}
          value={selectedExtraFeatures?.[facilityId]?.[name]}
          // onChange={(value) => setSelectedYear(value)}
          onChange={(value) => {
            setSelectedExtraFeatures((prev) => ({
              ...prev,
              [facilityId]: { ...prev[facilityId], [name]: value },
            }));
          }}
          filterBySearch={false}
        />
      </div>
    </div>
  );
}

export default RenderDropdown;
