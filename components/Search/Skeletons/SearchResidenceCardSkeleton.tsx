import SquareSkeleton from "@/components/General/Skeletons/Square";

export function SearchResidenceCardSkeleton() {
  return (
    <div className="rounded-16">
      <div className="w-full h-[214px] relative rounded-tr-16 rounded-tl-16 border-1 border-solid border-gray-E9EdF1 border-b-none">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-full"
          borderRadiusClass="rounded-tr-16 rounded-tl-16"
        />
      </div>
      <div className="p-12 border-1 border-solid border-gray-E9EdF1 border-t-none rounded-br-12 rounded-bl-12">
        <div className="flex items-center justify-between mb-8 gap-x-4">
          <SquareSkeleton
            widthClass="w-[240px]"
            heightClass="h-[12px]"
            borderRadiusClass="rounded-full"
          />
          <SquareSkeleton
            widthClass="w-[24px]"
            heightClass="h-[12px]"
            borderRadiusClass="rounded-full"
          />
        </div>
        <div className="mb-8">
          <SquareSkeleton
            widthClass="w-[190px]"
            heightClass="h-[12px]"
            borderRadiusClass="rounded-full"
          />
        </div>
        <div className="mb-8">
          <SquareSkeleton
            widthClass="w-[190px]"
            heightClass="h-[12px]"
            borderRadiusClass="rounded-full"
          />
        </div>
        <div className="mb-8">
          <SquareSkeleton
            widthClass="w-[170px]"
            heightClass="h-[12px]"
            borderRadiusClass="rounded-full"
          />
        </div>
        <div className="flex items-center gap-x-4">
          <div className="py-4 rounded-full">
            <SquareSkeleton
              widthClass="w-[75px]"
              heightClass="h-[24px]"
              borderRadiusClass="rounded-full"
            />
          </div>
          <div className="py-4 rounded-full">
            <SquareSkeleton
              widthClass="w-[75px]"
              heightClass="h-[24px]"
              borderRadiusClass="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
