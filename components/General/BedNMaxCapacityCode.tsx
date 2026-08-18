// import { I_Residence_display_type } from "@/interfaces/Residences";
import ResRate from "./ResRate";

interface I_BedNMaxCapacityCode {
  rating?: number;
  commentsN?: number;
  bedN: number;
  maxCapacity: number;
  // displayType: I_Residence_display_type;
  // referenceCode: string | number;
  // resPureNameAlone: string;
  className?: string;
}

function BedNMaxCapacityCode({
  rating,
  commentsN,
  bedN,
  maxCapacity,
  // displayType,
  // referenceCode,
  // resPureNameAlone,
  className,
}: I_BedNMaxCapacityCode) {
  return (
    // <p
    //   className={`
    //     text-12 leading-21 text-[rgba(28,46,69,0.6)] font-l OnlyOneLineAndEndWithElipsis
    //     ${className || ""}
    //   `}
    // >
    <div className={`flex items-center ${className}`}>
      <p className="text-13 leading-16 font-r">{bedN} اتاق خواب .</p>
      <p className="text-13 leading-16 font-r">تا {maxCapacity} نفر ظرفیت</p>
      <div className="pr-8 mr-8 flex items-center gap-x-2 border-r border-gray-F0F0F0 text-gray-57585C">
        {!!rating && !!commentsN && <ResRate average_rating={rating} reviews_count={commentsN} />}
      </div>
      {/* <p className="text-13 leading-16 font-r">
          کد: {displayType === "suit" ? referenceCode : resPureNameAlone}
        </p> */}
    </div>
    // </p>
  );
}

export default BedNMaxCapacityCode;
