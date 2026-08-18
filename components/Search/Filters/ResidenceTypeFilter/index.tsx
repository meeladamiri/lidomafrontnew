import { residences_types } from "@/constants/search/residences_types";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useRef, useState } from "react";
// const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
//   ssr: true,
// });
const ResidenceTypeFilterPaper = dynamic(() => import("./ResidenceTypeFilterPaper"), {
  ssr: true,
});

function ResidenceTypeFilter({
  setShowResidenceTypeFilterBottomSheet,
}: {
  setShowResidenceTypeFilterBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const residenceTypeFilterWrapperRef = useRef<any>(null);
  const [showResidenceTypeFilterPaper, setShowResidenceTypeFilterPaper] = useState<boolean>(false);

  const router = useRouter();
  const queryKeys = Object.keys(router.query);
  const hasMatchingKey = queryKeys.some((key) => key in residences_types);

  // function clearResTypeFromUrlFilters() {
  //   const prevQuery = router.query;

  //   router.push({ query: { ...router.query, newParam: "someValue" } }, undefined, {
  //     shallow: true,
  //   });
  // }

  return (
    <div className="relative shrink-0">
      <div
        className={`
            px-8 cursor-pointer h-32
            border-1 border-solid
            rounded-50 flex items-center
            ${
              !!hasMatchingKey
                ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
                : "border-gray-CACFD3"
            }
          `}
        onClick={() => {
          if (!!isDesktop) {
            setShowResidenceTypeFilterPaper((prev) => !prev);
          } else {
            setShowResidenceTypeFilterBottomSheet(true);
          }
        }}
        ref={residenceTypeFilterWrapperRef}
      >
        <span className="text-12 leading-16 font-m text-black pl-8 text-nowrap">نوع اقامتگاه</span>

        {/* {!!selectedResidenceType && (
          <CloseBtn
            // onClose={() => clearResTypeFromUrlFilters()}
            onClose={() => {}}
          />
        )} */}
      </div>

      {!!showResidenceTypeFilterPaper && (
        <ResidenceTypeFilterPaper
          residenceTypeFilterWrapperRef={residenceTypeFilterWrapperRef}
          setShowResidenceTypeFilterPaper={setShowResidenceTypeFilterPaper}
        />
      )}
    </div>
  );
}

export default ResidenceTypeFilter;
