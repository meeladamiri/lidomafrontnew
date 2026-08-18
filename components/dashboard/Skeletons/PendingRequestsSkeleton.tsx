import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import { PendingRequestSkeleton } from "./PendingRequestSkeleton";

export function PendingRequestsSkeleton() {
  return (
    <div className="py-16">
      <div className="mb-16">
        <PageTitleSkeleton />
      </div>

      <div className="mb-12">
        <PendingRequestSkeleton />
      </div>
      <div className="mb-12">
        <PendingRequestSkeleton />
      </div>
      <div>
        <PendingRequestSkeleton />
      </div>
    </div>
  );
}
