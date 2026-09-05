import Square from "@/components/General/Skeletons/Square";
import Circle from "@/components/General/Skeletons/Circle";

/**
 * The notification list while it loads.
 *
 * It used to be a centred dot spinner, which said «something is happening»
 * and nothing else: the page collapsed to a few pixels tall and then jumped
 * to full height once the answer came. This holds the same frame the real
 * list occupies — the bordered card, the 40px icon, the title line, the body
 * line — so arriving data fills a shape that is already there instead of
 * pushing the page around.
 */
function Row() {
  return (
    <div className="flex items-start gap-x-4 border-b-1 border-solid border-gray-EFEFEF px-12 py-14 last:border-b-0">
      <div className="mt-2 shrink-0">
        <Circle widthClass="w-40" heightClass="h-40" />
      </div>
      <div className="min-w-0 grow pr-8">
        <div className="mb-8 flex items-center gap-x-8">
          <Square widthClass="w-[45%]" heightClass="h-14" borderRadiusClass="rounded-6" />
          <Square
            widthClass="w-40"
            heightClass="h-10"
            borderRadiusClass="rounded-6"
            marginsClassnames="mr-auto"
          />
        </div>
        <Square widthClass="w-[85%]" heightClass="h-12" borderRadiusClass="rounded-6" />
      </div>
    </div>
  );
}

export function NotificationsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-16 border-1 border-solid border-gray-EFEFEF bg-white p-8"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <Row key={index} />
      ))}
    </div>
  );
}

export default NotificationsSkeleton;
