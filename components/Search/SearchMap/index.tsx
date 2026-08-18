import { Button } from "@/components/General/core/Button";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";
const SupportBtn = dynamic(() => import("@/components/Support/SupportBtn"), {
  ssr: true,
});

function SearchMap({
  showSearchMapModal,
  setShowSearchMapModal,
  setShowCallSupportBottomSheet,
}: {
  showSearchMapModal: boolean;
  setShowSearchMapModal: Dispatch<SetStateAction<boolean>>;
  setShowCallSupportBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      <div className="flex items-center justify-between md:mt-24">
        <div
          id="SearchPage-MapBtnText"
          className="w-auto md:mx-auto overflow-hidden rounded-full transition-all duration-500 ease-in-out"
        >
          <Button
            color="black"
            rounded
            rightIcon={<i className="icon-Map text-white text-24" />}
            className="!bg-black bg-gradient-0 opacity-100 !bg-none px-8 sm:!px-8 md:!px-16"
            onClick={() => {
              setShowSearchMapModal(true);
            }}
          >
            نمایش نقشه
          </Button>
        </div>

        {!isDesktop && <SupportBtn setShowCallSupportBottomSheet={setShowCallSupportBottomSheet} />}
      </div>
    </>
  );
}

export default SearchMap;
