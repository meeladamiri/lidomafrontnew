import SquareSkeleton from "@/components/General/Skeletons/Square";

function TypicalResidenceCartSkeletonForSwippableSlider() {
  return (
    <div>
      <div className="relative h-[214px] w-full">
        <SquareSkeleton borderRadiusClass="rounded-12" heightClass="h-full" widthClass="w-full" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 gap-x-4 h-24">
          <SquareSkeleton
            widthClass="w-[190px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />

          <SquareSkeleton
            widthClass="w-[100px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className=" mb-4 h-21">
          <SquareSkeleton
            widthClass="w-[140px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="h-21 mb-4">
          <SquareSkeleton
            widthClass="w-[120px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="h-24">
          <SquareSkeleton
            widthClass="w-[160px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="h-26 mt-12">
          <SquareSkeleton
            widthClass="w-[90px]"
            heightClass="h-full"
            borderRadiusClass="rounded-2"
          />
        </div>
      </div>
    </div>
  );
}

export default TypicalResidenceCartSkeletonForSwippableSlider;
