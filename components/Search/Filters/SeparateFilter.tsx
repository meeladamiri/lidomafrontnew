import { appendQueryParameters } from "@/utilities/URL/appendQueryParameters";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});

function SeparateFilter({
  paramKey,
  filterName,
  filterIcon,
  paramValue,
}: {
  paramKey: string;
  filterName: string;
  filterIcon: ReactNode;
  paramValue: string | number | boolean;
}) {
  const router = useRouter();

  function clearSeveralFilterFromUrlFilters() {
    removeQueryParameters(router, [{ paramKey: paramKey }]);
  }

  const [filterKey, setfilterKey] = useState<string>("");
  useEffect(() => {
    if (!!router?.query?.[paramKey]) {
      setfilterKey(router?.query?.[paramKey] as string);
    } else {
      setfilterKey("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.[paramKey]]);

  return (
    <div className="relative shrink-0">
      <div
        className={`
          px-8 cursor-pointer h-32
          border-1 border-solid
          rounded-50 flex items-center
          ${
            !!filterKey
              ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
              : "border-gray-CACFD3"
          }
        `}
        onClick={() => {
          if (!router?.query?.[paramKey]) {
            appendQueryParameters(router, [[paramKey, paramValue]]);
          }
        }}
      >
        <div className="flex items-center gap-x-6 pl-8">
          {filterIcon}
          <span className="text-12 leading-16 font-m text-black">{filterName}</span>
        </div>
        {!!filterKey && (
          <CloseBtn
            onClose={(e) => {
              e.preventDefault();
              e.stopPropagation();

              clearSeveralFilterFromUrlFilters();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default SeparateFilter;
