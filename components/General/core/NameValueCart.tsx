// import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { copyToClipboard } from "@/utilities/copyToClipboard";
// import exception from "@/utilities/exception";
import Image from "next/image";
import { useState } from "react";
import Tooltip from "../Tooltip";

interface INameValueCart {
  name: string;
  value: string | number;
  copyable?: boolean;
  wrapperClassname?: string;
  valueClassname?: string;
}

function NameValueCart({
  name,
  value,
  copyable = true,
  wrapperClassname,
  valueClassname,
}: INameValueCart) {
  const [copiedTooltipPosition, setCopiedTooltipPosition] = useState({ x: 0, y: 0 });
  const handleDisplayCopiedTooltip = (event: React.MouseEvent) => {
    setCopiedTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      <div
        className={`bg-gray-F4F5F6 p-12 flex item-center justify-between rounded-10 w-full ${
          wrapperClassname || ""
        }`}
      >
        <span className="flex items-center gap-x-4">
          <span className="text-black text-13 font-r leading-16">{name} :</span>
          <span className={`text-17 font-r leading-24 text-black ${valueClassname || ""}`}>
            {value}
          </span>
        </span>
        {copyable && (
          <Image
            onClick={(e) => {
              copyToClipboard(value.toString());
              // exception.message([
              //   {
              //     type: EXCEPTIONTYPES.SUCCESS,
              //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
              //   },
              // ]);
              handleDisplayCopiedTooltip(e);
            }}
            src="/assets/non-icomoon-icons/copy2.svg"
            width={24}
            height={24}
            alt="copy"
          />
        )}
      </div>
      {copiedTooltipPosition.x !== 0 && copiedTooltipPosition.y !== 0 && (
        <Tooltip
          icon="icon-Success"
          text="کپی شد"
          x={copiedTooltipPosition.x - 30}
          y={copiedTooltipPosition.y - 48}
        />
      )}
    </>
  );
}

export default NameValueCart;
