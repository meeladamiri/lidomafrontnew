import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ResidenceTypeFilterInner from "./ResidenceTypeFilterInner";
import { Button } from "@/components/General/core/Button";
import { useRouter } from "next/router";
// import { getTargetPathname } from "@/utilities/SearchPage/getTargetPathname";
// import { I_Residence_display_type } from "@/interfaces/Residences";
import { residences_types } from "@/constants/search/residences_types";
import { preserveNonGeneralFiltersQueryParams } from "@/utilities/SearchPage/preserveNonGeneralFiltersQueryParams";
import { preservingURLRouteParameters } from "@/utilities/SearchPage/preservingURLRouteParameters";

function ResidenceTypeFilterPaper({
  setShowResidenceTypeFilterPaper,
  residenceTypeFilterWrapperRef,
}: {
  setShowResidenceTypeFilterPaper: Dispatch<SetStateAction<boolean>>;
  residenceTypeFilterWrapperRef: any;
}) {
  const router = useRouter();
  const [tmpResidenceTypes, setTmpResidenceTypes] = useState<string[]>([]);

  function applyResidenceTypeFilterToURL() {
    let newParams = new URLSearchParams();

    newParams = preserveNonGeneralFiltersQueryParams(newParams, router);
    newParams = preservingURLRouteParameters(newParams, router);

    if (tmpResidenceTypes.length !== 0) {
      tmpResidenceTypes.forEach((resType) => {
        newParams.append(resType, "1");
      });
    }

    router.push({ pathname: router?.pathname, query: newParams.toString() }, undefined, {
      shallow: true,
    });
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(router.asPath.split("?")[1]);

    const filterParams = (obj: Record<string, string>) =>
      Object.keys(obj)
        .filter((key) => queryParams.get(key) === "1")
        .map((key) => key);

    setTmpResidenceTypes(filterParams(residences_types));
  }, [router.asPath]);

  return (
    <OutsideClickHandler
      handleClick={() => setShowResidenceTypeFilterPaper(false)}
      exceptionElementsRef={[residenceTypeFilterWrapperRef]}
    >
      <div className="shadow-[0px_8px_32px_rgba(24,39,58,0.15)] bg-white rounded-16 p-24 w-[320px] absolute top-42 right-0">
        <div>
          <ResidenceTypeFilterInner
            selectedResidenceTypes={tmpResidenceTypes}
            setSelectedResidenceTypes={setTmpResidenceTypes}
          />
        </div>

        <Button
          isFullWidth
          className="mt-16"
          onClick={() => {
            if (!!tmpResidenceTypes) {
              applyResidenceTypeFilterToURL();
              setShowResidenceTypeFilterPaper(false);
            }
          }}
        >
          اعمال تغییرات
        </Button>
      </div>
    </OutsideClickHandler>
  );
}
export default ResidenceTypeFilterPaper;
