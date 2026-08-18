import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useRef, useState } from "react";

const OneNightPriceFilterPaper = dynamic(() => import("./OneNightPriceFilterPaper"), {
  ssr: true,
});
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});

function OneNightPriceFilter({
  setShowOneNightPriceFilterBottomSheet,
}: {
  setShowOneNightPriceFilterBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const oneNightPriceFilterWrapperRef = useRef<any>(null);
  const [showOneNightPriceFilterPaper, setShowOneNightPriceFilterPaper] = useState<boolean>(false);

  const oneNightPrice: [number, number] | undefined =
    !!router.query.min_price && !!router.query.max_price
      ? [Number(router.query.min_price as string), Number(router.query.max_price as string)]
      : undefined;

  function clearOneNightPriceFilterFromUrlFilters() {
    removeQueryParameters(router, [
      { paramKey: "min_price" },
      { paramKey: "max_price" },
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
            !!oneNightPrice && !!oneNightPrice[1]
              ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
              : "border-gray-CACFD3"
          }
        `}
        onClick={() => {
          if (!!isDesktop) {
            setShowOneNightPriceFilterPaper((prev) => !prev);
          } else {
            setShowOneNightPriceFilterBottomSheet(true);
          }
        }}
        ref={oneNightPriceFilterWrapperRef}
      >
        <span className="text-12 leading-16 font-m text-black pl-8 text-nowrap">
          {!!oneNightPrice && !!oneNightPrice[1]
            ? `${oneNightPrice[1]} تا ${oneNightPrice[0]}`
            : "قیمت برای یک شب"}
        </span>

        {!!oneNightPrice && !!oneNightPrice[1] && (
          <CloseBtn
            onClose={(e) => {
              e.preventDefault();
              e.stopPropagation();

              clearOneNightPriceFilterFromUrlFilters();
            }}
          />
        )}
      </div>

      {!!showOneNightPriceFilterPaper && (
        <OneNightPriceFilterPaper
          setShowOneNightPriceFilterPaper={setShowOneNightPriceFilterPaper}
          oneNightPriceFilterWrapperRef={oneNightPriceFilterWrapperRef}
        />
      )}
    </div>
  );
}

export default OneNightPriceFilter;
