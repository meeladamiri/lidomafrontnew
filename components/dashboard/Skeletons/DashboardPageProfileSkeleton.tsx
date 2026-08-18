import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import SquareSkeleton from "@/components/General/Skeletons/Square";

export function DashboardPageProfileSkeleton() {
  return (
    <div className="py-16">
      <div className="mb-16">
        <PageTitleSkeleton />
      </div>

      <div className="mb-16">
        <SquareSkeleton widthClass="w-full" heightClass="h-64" borderRadiusClass="rounded-10" />
      </div>
      <div className="mb-16">
        <SquareSkeleton widthClass="w-full" heightClass="h-64" borderRadiusClass="rounded-10" />
      </div>
      <SquareSkeleton widthClass="w-full" heightClass="h-64" borderRadiusClass="rounded-10" />
    </div>
  );
}
