import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { Button } from "@/components/General/core/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import ResidenceTypeFilterInner from "./ResidenceTypeFilterInner";
// import { getTargetPathname } from "@/utilities/SearchPage/getTargetPathname";
// import { I_Residence_display_type } from "@/interfaces/Residences";
import { residences_types } from "@/constants/search/residences_types";
import { preserveNonGeneralFiltersQueryParams } from "@/utilities/SearchPage/preserveNonGeneralFiltersQueryParams";
import { preservingURLRouteParameters } from "@/utilities/SearchPage/preservingURLRouteParameters";

function ResidenceTypeFilterBottomSheet({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
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
    <div>
      <ResidenceTypeFilterInner
        selectedResidenceTypes={tmpResidenceTypes}
        setSelectedResidenceTypes={setTmpResidenceTypes}
      />

      <div className="grid grid-cols-6 gap-x-12 mt-24">
        <div className="col-span-2">
          <Button
            disabled={!tmpResidenceTypes.length}
            onClick={() => {
              setTmpResidenceTypes([]);
            }}
            color="grey"
            isFullWidth
          >
            حذف فیلتر
          </Button>
        </div>
        <div className="col-span-4">
          <Button
            isFullWidth
            onClick={() => {
              if (tmpResidenceTypes.length !== 0) {
                applyResidenceTypeFilterToURL();
                handleSmoothClose();
              }
            }}
          >
            مشاهده نتایج
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResidenceTypeFilterBottomSheet;
