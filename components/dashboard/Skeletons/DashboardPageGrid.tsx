import SquareSkeleton from "@/components/General/Skeletons/Square";

export function DashboardPageGrid() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="col-span-4" key={i}>
          <SquareSkeleton widthClass="w-full" heightClass="h-110" borderRadiusClass="rounded-8" />
        </div>
      ))}
    </>
  );
}
