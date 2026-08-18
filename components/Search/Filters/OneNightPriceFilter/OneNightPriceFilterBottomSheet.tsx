import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { Button } from "@/components/General/core/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import OneNightPriceFilterInner from "./OneNightPriceFilterInner";

function OneNightPriceFilterBottomSheet({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
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
    <div>
      <OneNightPriceFilterInner
        selectedMinValue={tmpOneNightPrice?.[0]}
        selectedMaxValue={tmpOneNightPrice?.[1]}
        setSelectedRangeValue={setTmpOneNightPrice}
      />

      <div className="grid grid-cols-6 gap-x-12 mt-24">
        <div className="col-span-2">
          <Button
            disabled={
              !tmpOneNightPrice ||
              !!tmpOneNightPrice.every((val, i) => val === [100000, 18000000][i])
            }
            color="grey"
            isFullWidth
            onClick={() => {
              setTmpOneNightPrice([100000, 18000000]);
            }}
          >
            حذف فیلتر
          </Button>
        </div>
        <div className="col-span-4">
          <Button
            isFullWidth
            onClick={() => {
              if (!!tmpOneNightPrice) {
                applyOneNightPriceFilterToURL();
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

export default OneNightPriceFilterBottomSheet;
