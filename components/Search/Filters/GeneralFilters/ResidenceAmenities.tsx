// import { getAmenities } from "@/api/Residences/getAmenities";
import PageTitle from "@/components/General/PageTitle";
import { Button } from "@/components/General/core/Button";
import { Checkbox } from "@/components/General/core/Checkbox";
// import { ResidenceAmenity } from "@/interfaces/Residences/Submit";
import { residences_amenities } from "@/constants/search/residences_amenities";
import { Dispatch, SetStateAction, useState } from "react";

function ResidenceAmenities({
  tmpTickedResidenceAmenitiesIds,
  setTmpTickedResidenceAmenitiesIds,
}: {
  tmpTickedResidenceAmenitiesIds: string[];
  setTmpTickedResidenceAmenitiesIds: Dispatch<SetStateAction<string[]>>;
}) {
  const [showMore, setShowMore] = useState<boolean>(false);
  return (
    <>
      <PageTitle title="امکانات اقامتگاه" containerClassname="mb-24" />

      <div className="grid grid-cols-2 gap-x-16 gap-y-20">
        {Object.entries(residences_amenities)
          .slice(0, !!showMore ? undefined : 6)
          .map(([k, v], idx: number) => (
            <div className="col-span-1" key={idx}>
              <Checkbox
                onChange={(e) => {
                  if (!!e.target.checked) {
                    setTmpTickedResidenceAmenitiesIds((prev) => [...prev, k]);
                  } else {
                    setTmpTickedResidenceAmenitiesIds((prev) => [...prev.filter((el) => el !== k)]);
                  }
                }}
                label={v}
                checked={tmpTickedResidenceAmenitiesIds.includes(k)}
              />
            </div>
          ))}
      </div>

      {!showMore && (
        <Button
          variant="text"
          color="light-blue"
          isFullWidth
          leftIcon={<i className="icon-FlashDown text-24" />}
          className="mt-16"
          onClick={() => setShowMore(true)}
        >
          نمایش بیشتر
        </Button>
      )}
    </>
  );
}

export default ResidenceAmenities;
