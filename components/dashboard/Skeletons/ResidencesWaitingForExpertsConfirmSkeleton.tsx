import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import { IncompleteResidenceSkeleton } from "./IncompleteResidenceSkeleton";

export function ResidencesWaitingForExpertsConfirmSkeleton() {
  return (
    <div className="py-16">
      <div className="mb-16">
        <PageTitleSkeleton />
      </div>

      <div className="mb-12">
        <IncompleteResidenceSkeleton />
      </div>
      <div className="mb-12">
        <IncompleteResidenceSkeleton />
      </div>
      <div>
        <IncompleteResidenceSkeleton />
      </div>
    </div>
  );
}
