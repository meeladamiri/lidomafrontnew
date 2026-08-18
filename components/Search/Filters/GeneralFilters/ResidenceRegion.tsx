// import { getAmenities } from "@/api/Residences/getAmenities";
import PageTitle from "@/components/General/PageTitle";
import { Checkbox } from "@/components/General/core/Checkbox";
// import { ResidenceAmenity } from "@/interfaces/Residences/Submit";
import { residences_regions } from "@/constants/search/residences_regions";
import { Dispatch, SetStateAction } from "react";

function ResidenceRegion({
  tmpResidenceRegions,
  setTmpResidenceRegions,
}: {
  tmpResidenceRegions: string[];
  setTmpResidenceRegions: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <>
      <PageTitle title="منطقه اقامتگاه" containerClassname="mb-24" />

      <div className="grid grid-cols-2 gap-x-16 gap-y-20">
        {Object.entries(residences_regions).map(([k, v], idx: number) => (
          <div className="col-span-1" key={idx}>
            <Checkbox
              onChange={(e) => {
                if (!!e.target.checked) {
                  setTmpResidenceRegions((prev) => [...prev, k]);
                } else {
                  setTmpResidenceRegions((prev) => [...prev.filter((el) => el !== k)]);
                }
              }}
              label={v}
              checked={tmpResidenceRegions.includes(k)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default ResidenceRegion;
