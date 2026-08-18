import { Sort_Map, TSort_Map } from "@/constants/Sort_Map";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SortFilterItem from "./SortFilterItem";

function SortFilter() {
  const router = useRouter();
  const [tmpSort, setTmpSort] = useState<TSort_Map>("lidoma_suggestion");

  useEffect(() => {
    if (router?.query && !!router?.query?.order) {
      setTmpSort(router?.query?.order as TSort_Map);
    }
  }, [router?.query]);

  const handleSortChange = (newSort: TSort_Map) => {
    setTmpSort(newSort);

    if (newSort !== "lidoma_suggestion") {
      removeSomeQueryParameters_Then_AddSomeQueryParameters(
        router,
        ["order"],
        [["order", newSort]]
      );
    } else {
      removeQueryParameters(router, [{ paramKey: "order" }]);
    }
  };

  return (
    <div className="flex items-center gap-x-16">
      <div className="flex items-center">
        <i className="icon-Rating text-16" />
        <label className="text-13 leading-16 font-r text-black mr-4">مرتب سازی :</label>
      </div>
      {Object.entries(Sort_Map).map(([k, v], idx: number) => {
        return (
          <div key={idx}>
            <SortFilterItem
              onClick={() => handleSortChange(k as TSort_Map)}
              filterName={v}
              selectedItem={tmpSort === k}
            />
          </div>
        );
      })}
    </div>
  );
}

export default SortFilter;
