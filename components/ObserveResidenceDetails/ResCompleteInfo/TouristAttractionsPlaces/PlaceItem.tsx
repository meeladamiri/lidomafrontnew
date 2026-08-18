import { IDistanceItem } from "@/interfaces/observe_residence";

function PlaceItem({ distance, name, time, className }: IDistanceItem & { className?: string }) {
  return (
    <div className={`flex items-center gap-x-8 ${className || ""}`}>
      <span className="text-14 leading-20 text-black font-r shrink-0">{distance}</span>
      <i className="icon-CalendarFlash text-24 text-black shrink-0" />
      <span className={`text-14 leading-20 text-black font-m OnlyOneLineAndEndWithElipsis `}>
        {name}
      </span>
    </div>
  );
}

export default PlaceItem;
