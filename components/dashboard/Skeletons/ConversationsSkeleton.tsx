import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import { ConversationSkeleton } from "./ConversationSkeleton";

export function ConversationsSkeleton() {
  return (
    <div className="py-16">
      <div className="mb-16">
        <PageTitleSkeleton />
      </div>

      <ConversationSkeleton />
    </div>
  );
}
