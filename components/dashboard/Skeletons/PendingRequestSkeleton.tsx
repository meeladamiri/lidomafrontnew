import SquareSkeleton from "@/components/General/Skeletons/Square";

export function PendingRequestSkeleton() {
  return (
    <div className="rounded-12 border-gray-C4CAD3 border-1 border-solid flex mb-12 last-of-type:mb-0">
      <div className="w-72 relative shrink-0">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-full"
          borderRadiusClass="rounded-tr-10 rounded-br-10 rounded-tl-0 rounded-bl-0"
        />
      </div>

      <div className="pl-12 p-10 gap-y-4 flex w-[calc(100%-72px)]">
        <div className="flex flex-col gap-y-12 w-[calc(100%-72px)] gap-x-4">
          <div className="text-14 leading-24 w-full text-black OnlyOneLineAndEndWithElipsis">
            <SquareSkeleton
              widthClass="w-[160px]"
              heightClass="h-24"
              borderRadiusClass="rounded-2"
            />
          </div>

          <div className="flex w-full items-center gap-x-2 sm:gap-x-10 text-12 leading-21 text-black grow shrink">
            <SquareSkeleton
              widthClass="w-[120px]"
              heightClass="h-[21px]"
              borderRadiusClass="rounded-2"
            />
          </div>
        </div>

        <div className="w-72 flex-col flex">
          <div className="text-center text-14 leading-24 text-black font-l w-72 shrink-0 mb-4">
            <SquareSkeleton widthClass="w-full" heightClass="h-20" borderRadiusClass="rounded-2" />
          </div>

          <SquareSkeleton widthClass="w-full" heightClass="h-40" borderRadiusClass="rounded-6" />
        </div>
      </div>
    </div>
  );
}
