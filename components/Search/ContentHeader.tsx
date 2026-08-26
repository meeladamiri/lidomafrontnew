import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Sort_Map, TSort_Map } from "@/constants/Sort_Map";
import SquareSkeleton from "../General/Skeletons/Square";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import SortFilter from "./SortFilter";
import { Button } from "../General/core/Button";
import { countAndPricePhrase, faNumber } from "@/utilities/SearchPage/buildSearchTitle";

const BottomSheet = dynamic(() => import("../General/core/BottomSheet"), { ssr: true });
const SortFilterBottomSheet = dynamic(() => import("./Filters/SortFilterBottomSheet"), {
  ssr: true,
});

function ContentHeader({
  counterIsLoading,
  nameIsLoading,
  count,
  name,
  minPrice,
}: {
  counterIsLoading: boolean;
  nameIsLoading: boolean;
  count: number;
  name: string;
  minPrice?: number | null;
}) {
  const [showSortFilterBottomSheet, setShowSortFilterBottomSheet] = useState<boolean>(false);
  const router = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      <header>
        {/* The count sits inside the H1, the way jabama does it — the heading
            answers "how many, from how much" instead of leaving that to a line
            underneath. The second line is a span, so the page still has one
            heading with one accessible name. */}
        <h1 className="md:mt-24 mt-0 mb-20">
          {nameIsLoading ? (
            <SquareSkeleton
              heightClass="h-28"
              widthClass="w-[280px] md:w-[480px]"
              borderRadiusClass="rounded-2"
            />
          ) : (
            <>
              <span className="block text-20 leading-28 font-m text-black">{name}</span>
              {/* Both spans are block-level, so this space costs nothing
                  visually — but without it the H1's accessible name reads as
                  one run-on word: "…در شیراز۳۴۶ اقامتگاه". */}{" "}
              {!counterIsLoading && !!count && (
                <span className="mt-4 block text-14 leading-22 font-r text-gray-6C6A7D">
                  {countAndPricePhrase(count, minPrice) ?? `${faNumber(count)} اقامتگاه`}
                </span>
              )}
            </>
          )}
        </h1>

        <div className="flex items-center justify-between md:mb-24 mb-16">
          {counterIsLoading ? (
            <SquareSkeleton
              heightClass="h-20"
              widthClass="w-[120px]"
              borderRadiusClass="rounded-2"
            />
          ) : (
            <span aria-hidden="true" />
          )}

          {/* {isLoading ? (
          <SquareSkeleton heightClass="h-32" widthClass="w-[132px]" borderRadiusClass="rounded-8" />
        ) : (
        
        )} */}
          {!isDesktop && (
            <Button
              onClick={() => setShowSortFilterBottomSheet(true)}
              variant="outlined"
              color="white"
              rightIcon={<i className="icon-Rating text-24" />}
            >
              {!!router?.query?.order
                ? Sort_Map[router?.query?.order as TSort_Map]
                : Sort_Map["lidoma_suggestion"]}
            </Button>
          )}
          {!!isDesktop && <SortFilter />}
        </div>
      </header>
      {!!showSortFilterBottomSheet && !isDesktop && (
        <BottomSheet
          open={showSortFilterBottomSheet}
          handleClose={() => setShowSortFilterBottomSheet(false)}
          headerTitle="مرتب سازی بر اساس"
          body={({ handleSmoothClose }) => {
            return <SortFilterBottomSheet handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}
    </>
  );
}

export default ContentHeader;
