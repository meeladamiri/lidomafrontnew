import { Button } from "@/components/General/core/Button";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OneNightPriceFilterInner from "./OneNightPriceFilterInner";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";

function OneNightPriceFilterPaper({
  setShowOneNightPriceFilterPaper,
  oneNightPriceFilterWrapperRef,
}: {
  setShowOneNightPriceFilterPaper: Dispatch<SetStateAction<boolean>>;
  oneNightPriceFilterWrapperRef: any;
}) {
  const router = useRouter();
  const [tmpOneNightPrice, setTmpOneNightPrice] = useState<[number, number]>();

  useEffect(() => {
    const oneNightPriceFromURL: [number, number] | undefined =
      !!router.query.min_price && !!router.query.max_price
        ? [Number(router.query.min_price as string), Number(router.query.max_price as string)]
        : undefined;

    setTmpOneNightPrice(oneNightPriceFromURL);
  }, [router.query.min_price, router.query.max_price]);

  function applyOneNightPriceFilterToURL() {
    removeSomeQueryParameters_Then_AddSomeQueryParameters(
      router,
      ["min_price", "max_price", "page"],
      [
        ["min_price", tmpOneNightPrice?.[0] as number],
        ["max_price", tmpOneNightPrice?.[1] as number],
      ]
    );
  }

  return (
    <OutsideClickHandler
      handleClick={() => setShowOneNightPriceFilterPaper(false)}
      exceptionElementsRef={[oneNightPriceFilterWrapperRef]}
    >
      <div className="shadow-[0px_8px_32px_rgba(24,39,58,0.15)] bg-white rounded-16 p-24 w-[380px] absolute top-42 right-0">
        <div>
          <OneNightPriceFilterInner
            selectedMinValue={tmpOneNightPrice?.[0]}
            selectedMaxValue={tmpOneNightPrice?.[1]}
            setSelectedRangeValue={setTmpOneNightPrice}
          />
        </div>

        <Button
          isFullWidth
          className="mt-28"
          onClick={() => {
            if (!!tmpOneNightPrice) {
              applyOneNightPriceFilterToURL();
              setShowOneNightPriceFilterPaper(false);
            }
          }}
        >
          اعمال تغییرات
        </Button>
      </div>
    </OutsideClickHandler>
  );
}

export default OneNightPriceFilterPaper;
