import Image from "next/image";
import { IValueDataItem } from "./ValueDataItems";

export const ValueItem = ({ icon, title, description }: IValueDataItem) => {
  return (
    <div className="flex flex-col items-center p-24 my-24 gap-16 min-w-[315px] max-w-[315px] min-h-[274px] bg-[#f4f5f6] rounded-12">
      <Image alt="" src={icon} width={56} height={56} />
      <span className="font-bold text-16">{title}</span>
      <span className="border-dashed border-1 border-gray-300 w-full"></span>
      <p className="text-12 leading-24 text-center">{description}</p>
    </div>
  );
};
export default ValueItem;
