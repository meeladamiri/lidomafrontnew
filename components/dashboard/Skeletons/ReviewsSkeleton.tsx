import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import { ReviewSkeleton } from "./ReviewSkeleton";

export function ReviewsSkeleton() {
  return (
    <div className="py-16">
      <div className="mb-16">
        <PageTitleSkeleton />
      </div>

      <ReviewSkeleton />
    </div>
  );
}
