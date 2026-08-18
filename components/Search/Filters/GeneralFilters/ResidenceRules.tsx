// import { getAmenities } from "@/api/Residences/getAmenities";
import PageTitle from "@/components/General/PageTitle";
import { Switch } from "@/components/General/core/Switch";
// import { ResidenceAmenity } from "@/interfaces/Residences/Submit";
import { residences_rule } from "@/constants/search/residences_rule";
import { Dispatch, SetStateAction } from "react";

function ResidenceRules({
  tickedResidenceRulesId,
  setTickedResidenceRulesId,
}: {
  tickedResidenceRulesId: string[];
  setTickedResidenceRulesId: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <>
      <PageTitle
        title="مقررات اقامتگاه"
        icon={<i className="icon-Details text-24" />}
        containerClassname="mb-24"
      />

      <div>
        {Object.entries(residences_rule).map(([k, v], idx: number) => (
          <div className="mb-16 last:mb-0" key={idx}>
            <Switch
              name={v}
              label={v}
              checked={!!tickedResidenceRulesId.find((el) => el === k)}
              onChange={(e) => {
                if (!!e.target.checked) {
                  setTickedResidenceRulesId((prev) => [...prev, k]);
                } else {
                  setTickedResidenceRulesId((prev) => [...prev.filter((item) => item !== k)]);
                }
              }}
              wrapperClassnames="justify-between"
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default ResidenceRules;
