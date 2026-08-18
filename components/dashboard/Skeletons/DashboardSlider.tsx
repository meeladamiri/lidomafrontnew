import CircleSkeleton from "@/components/General/Skeletons/Circle";
import SquareSkeleton from "@/components/General/Skeletons/Square";

export function DashboardSlider() {
  return (
    <div>
      <SquareSkeleton widthClass="w-full" heightClass="h-[214px]" borderRadiusClass="rounded-10" />
      <div className="h-24 flex items-center justify-center gap-x-5">
        <CircleSkeleton widthClass="w-6" heightClass="h-6" />
        <CircleSkeleton widthClass="w-6" heightClass="h-6" />
        <CircleSkeleton widthClass="w-6" heightClass="h-6" />
      </div>
    </div>
  );
}
