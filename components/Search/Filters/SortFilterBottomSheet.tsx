import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { Radio } from "@/components/General/core/Radio";
import { Sort_Map, TSort_Map } from "@/constants/Sort_Map";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function SortFilterBottomSheet({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) {
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

    handleSmoothClose();
  };

  return (
    <div>
      <div>
        {Object.entries(Sort_Map).map(([k, v], idx: number) => {
          return (
            <div key={idx} className="pb-20 last:pb-0 mb-12 last:mb-0">
              <Radio
                name=""
                checked={tmpSort === k}
                label={v}
                value={k}
                onChange={(e) => handleSortChange(e.target.value as TSort_Map)}
                inputClassnames="after:border-gray-E1E1E5 after:border-2"
                look="selected"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SortFilterBottomSheet;
