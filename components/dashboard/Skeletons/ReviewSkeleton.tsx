import SquareSkeleton from "@/components/General/Skeletons/Square";

export function ReviewSkeleton() {
  return (
    <div className="flex items-center justify-between p-12 gap-x-6 rounded-10 border-1 border-solid border-gray-C4CAD3">
      <div className="text-14 leading-24 text-black">
        <SquareSkeleton widthClass="w-[140px]" heightClass="h-24" borderRadiusClass="rounded-2" />
      </div>

      <SquareSkeleton widthClass="w-[72px]" heightClass="h-40" borderRadiusClass="rounded-6" />
    </div>
  );
}
