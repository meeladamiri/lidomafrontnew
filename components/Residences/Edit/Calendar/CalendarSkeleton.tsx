import Square from "@/components/General/Skeletons/Square";

/**
 * The calendar while it loads.
 *
 * A month grid is the most layout-shifting thing in the panel — a dot spinner
 * collapses the page to nothing and then a six-row grid slams into place. This
 * holds the real frame: the listing picker, the month header, the weekday
 * strip and six weeks of cells, at the sizes the real calendar uses.
 */
export function CalendarSkeleton() {
  return (
    <div aria-hidden="true" className="pt-8">
      {/* listing picker */}
      <Square widthClass="w-full" heightClass="h-[52px]" borderRadiusClass="rounded-12" />

      {/* month header */}
      <div className="mt-24 flex items-center justify-between">
        <Square widthClass="w-32" heightClass="h-32" borderRadiusClass="rounded-full" />
        <Square widthClass="w-[120px]" heightClass="h-16" borderRadiusClass="rounded-6" />
        <Square widthClass="w-32" heightClass="h-32" borderRadiusClass="rounded-full" />
      </div>

      {/* weekday strip */}
      <div className="mt-20 grid grid-cols-7 gap-8">
        {Array.from({ length: 7 }).map((_, index) => (
          <Square key={index} widthClass="w-full" heightClass="h-12" borderRadiusClass="rounded-6" />
        ))}
      </div>

      {/* six weeks */}
      <div className="mt-12 grid grid-cols-7 gap-8">
        {Array.from({ length: 42 }).map((_, index) => (
          <Square
            key={index}
            widthClass="w-full"
            heightClass="h-[52px]"
            borderRadiusClass="rounded-10"
          />
        ))}
      </div>
    </div>
  );
}

export default CalendarSkeleton;
