import { deleteAllGeneralFilters } from "@/utilities/SearchPage/deleteAllGeneralFilters";
import { doWeHaveAnyGeneralFiltersApplied } from "@/utilities/SearchPage/doWeHaveAnyGeneralFiltersApplied";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useMemo } from "react";

const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});

function GeneralFilters({
  setShowGeneralFiltersModal,
}: {
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const isThereAnyGeneralFiltersApplied = useMemo(() => {
    return doWeHaveAnyGeneralFiltersApplied(router?.query);
  }, [router?.query]);

  return (
    <div className="relative shrink-0">
      <div
        className={`
            px-8 cursor-pointer h-32
            border-1 border-solid
            rounded-50 flex items-center
            ${
              isThereAnyGeneralFiltersApplied
                ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
                : "border-gray-CACFD3"
            }
          `}
        onClick={() => setShowGeneralFiltersModal(true)}
      >
        <div className="flex items-center gap-x-6 pl-8">
          <i className="icon-FiltersFill text-16" />

          <span className="text-12 leading-16 font-m text-black">فیلترها</span>
        </div>
        {isThereAnyGeneralFiltersApplied && (
          <CloseBtn
            onClose={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // clear GeneralFilters from URL
              deleteAllGeneralFilters(router);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default GeneralFilters;
