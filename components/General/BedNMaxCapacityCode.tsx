import ResRate from "./ResRate";

interface I_BedNMaxCapacityCode {
  rating?: number;
  commentsN?: number;
  bedN: number;
  maxCapacity: number;
  className?: string;
}

function BedNMaxCapacityCode({
  rating,
  commentsN,
  bedN,
  maxCapacity,
  className,
}: I_BedNMaxCapacityCode) {
  return (
    <div className={`flex items-center gap-x-6 ${className || ""}`}>
      <p className="text-13 leading-16 font-r">{bedN} اتاق خواب</p>
      <p className="text-13 leading-16 font-r">تا {maxCapacity} نفر ظرفیت</p>
      {!!rating && !!commentsN && (
        <div className="pr-8 mr-6 flex items-center gap-x-2 border-r border-gray-F0F0F0 text-gray-57585C">
          <ResRate average_rating={rating} reviews_count={commentsN} />
        </div>
      )}
    </div>
  );
}

export default BedNMaxCapacityCode;
