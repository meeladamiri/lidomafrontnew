import SquareSkeleton from "@/components/General/Skeletons/Square";

export function IncompleteResidenceSkeleton() {
  return (
    <div className="rounded-12 border-gray-C4CAD3 border-1 border-solid flex">
      <div className="w-72 relative shrink-0">
        <div className="absolute z-1 top-0 right-0 left-0 bottom-0 flex items-center">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-full"
            borderRadiusClass="rounded-tl-0 rounded-bl-0 rounded-tr-10 rounded-br-10"
          />
        </div>
      </div>

      <div className="pl-12 p-10 flex items-center gap-x-4 w-[calc(100%-72px)]">
        <div className="flex flex-col gap-y-16 w-[calc(100%-72px)]">
          <div className="text-14 leading-24 text-black OnlyOneLineAndEndWithElipsis">
            <SquareSkeleton
              widthClass="w-[160px]"
              heightClass="h-24"
              borderRadiusClass="rounded-2"
            />
          </div>
          <div className="text-12 leading-21 text-black">
            <SquareSkeleton
              widthClass="w-[120px]"
              heightClass="h-[21px]"
              borderRadiusClass="rounded-2"
            />
          </div>
        </div>
        <div className="w-72">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[40px]"
            borderRadiusClass="rounded-6"
          />
        </div>
      </div>
    </div>
  );
}
