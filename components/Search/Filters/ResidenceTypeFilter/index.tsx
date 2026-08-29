import { residences_types } from "@/constants/search/residences_types";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useRef, useState } from "react";
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});
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

  // Which types are currently applied. More than one can be, so this is a list
  // rather than a flag — the chip has to be able to name them and clear all of
  // them together.
  const activeKeys = Object.keys(router.query).filter((key) => key in residences_types);
  const hasMatchingKey = activeKeys.length > 0;

  // Naming the applied filter is the point of the chip. A chip that reads
  // "نوع اقامتگاه" whether or not a type is chosen forces the reader back to
  // the panel to find out what is filtering their results.
  const chipLabel = !hasMatchingKey
    ? "نوع اقامتگاه"
    : activeKeys.length === 1
    ? (residences_types as Record<string, string>)[activeKeys[0]]
    : `${activeKeys.length.toLocaleString("fa-IR")} نوع اقامتگاه`;

  function clearResidenceTypesFromUrlFilters() {
    removeQueryParameters(router, [
      ...activeKeys.map((paramKey) => ({ paramKey })),
      // Clearing a filter changes the result set, so page 3 of the old one is
      // not a place to land.
      { paramKey: "page" },
    ]);
  }

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
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label="انتخاب نوع اقامتگاه"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        }}
        onClick={() => {
          if (!!isDesktop) {
            setShowResidenceTypeFilterPaper((prev) => !prev);
          } else {
            setShowResidenceTypeFilterBottomSheet(true);
          }
        }}
        ref={residenceTypeFilterWrapperRef}
      >
        <span className="text-12 leading-16 font-m text-black pl-8 text-nowrap">{chipLabel}</span>

        {hasMatchingKey && (
          <CloseBtn
            aria-label="حذف فیلتر نوع اقامتگاه"
            onClose={(e: any) => {
              e.preventDefault();
              e.stopPropagation();

              clearResidenceTypesFromUrlFilters();
            }}
          />
        )}
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
