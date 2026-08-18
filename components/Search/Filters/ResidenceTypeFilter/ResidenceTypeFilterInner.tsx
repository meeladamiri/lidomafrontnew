import PageTitle from "@/components/General/PageTitle";
import { Checkbox } from "@/components/General/core/Checkbox";
// import { residence_types_filter } from "@/constants/residence_types_filter";
// import { I_Residence_display_type } from "@/interfaces/Residences";
import { residences_types } from "@/constants/search/residences_types";
import { Dispatch, SetStateAction } from "react";

function ResidenceTypeFilterInner({
  selectedResidenceTypes,
  setSelectedResidenceTypes,
}: {
  selectedResidenceTypes: string[];
  setSelectedResidenceTypes: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <div>
      <PageTitle title="نوع اقامتگاه" containerClassname="mb-24" />

      <div className="grid grid-cols-2 gap-x-16 gap-y-20">
        {Object.entries(residences_types).map(([k, v], idx: number) => (
          <div className="col-span-1" key={idx}>
            <Checkbox
              onChange={(e) => {
                if (!!e.target.checked) {
                  setSelectedResidenceTypes((prev) => [...prev, k]);
                } else {
                  setSelectedResidenceTypes((prev) => [...prev.filter((el) => el !== k)]);
                }
              }}
              label={v}
              checked={selectedResidenceTypes.includes(k)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default ResidenceTypeFilterInner;
