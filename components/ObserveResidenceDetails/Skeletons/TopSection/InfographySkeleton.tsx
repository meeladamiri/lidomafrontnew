import CircleSkeleton from "@/components/General/Skeletons/Circle";
import SquareSkeleton from "@/components/General/Skeletons/Square";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function InfographySkeleton() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex items-start md:items-end justify-between CustomContainer">
      <div>
        <SquareSkeleton
          heightClass="h-28"
          widthClass="w-[180px] md:w-[380px]"
          borderRadiusClass="rounded-2"
          marginsClassnames="mb-16"
        />

        <div className="flex items-center gap-x-12 flex-wrap md:flex-nowrap gap-y-16">
          <SquareSkeleton
            heightClass="h-21"
            widthClass="w-[160px] md:w-[380px]"
            borderRadiusClass="rounded-2"
            extraClassnames="md:hidden"
          />

          <SquareSkeleton
            heightClass="h-[39px]"
            widthClass="w-[120px] md:w-[320px]"
            borderRadiusClass="rounded-4"
          />
        </div>
      </div>

      {!isDesktop && (
        <div className="md:hidden">
          <CircleSkeleton heightClass="h-48" widthClass="w-48" />
        </div>
      )}

      {!!isDesktop && (
        <div className="flex items-center gap-x-12">
          <SquareSkeleton
            heightClass="h-[42px]"
            widthClass="w-[140px]"
            borderRadiusClass="rounded-6"
          />
          <SquareSkeleton
            heightClass="h-[42px]"
            widthClass="w-[198px]"
            borderRadiusClass="rounded-6"
          />
        </div>
      )}
    </div>
  );
}

export default InfographySkeleton;
